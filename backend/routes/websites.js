const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createWebsite, getUserWebsites, getWebsiteStats, getWebsiteHistory } = require('../controllers/websiteController');
const Check = require('../models/Check');

// POST /api/websites - Create a new website
router.post('/', auth, createWebsite);

// GET /api/websites - Get all websites for logged-in user
router.get('/', auth, getUserWebsites);

// GET /api/websites/marketplace - Get all websites for validator marketplace (MUST BE BEFORE :websiteId routes)
router.get('/marketplace', auth, async (req, res) => {
  try {
    const Website = require('../models/Website');
    
    // Get all websites with their recent check statistics
    const websites = await Website.find({}).populate('owner', 'username');
    
    const websitesWithStats = await Promise.all(websites.map(async (website) => {
      // Get recent checks (last 24 hours)
      const recentChecks = await Check.find({
        website: website._id,
        timestamp: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).sort({ timestamp: -1 });
      
      // Get last check by current validator (to prevent spam)
      const lastCheckByValidator = await Check.findOne({
        website: website._id,
        validator: req.user.id
      }).sort({ timestamp: -1 });
      
      // Calculate time since last check by this validator
      const timeSinceLastCheck = lastCheckByValidator 
        ? Date.now() - new Date(lastCheckByValidator.timestamp).getTime()
        : Infinity;
      
      // Calculate recent activity stats
      const totalChecks = recentChecks.length;
      const upChecks = recentChecks.filter(check => check.status === 'up').length;
      const avgLatency = recentChecks.length > 0 
        ? Math.round(recentChecks.reduce((sum, check) => sum + (check.latency || 0), 0) / recentChecks.length)
        : 0;
      
      return {
        id: website._id,
        url: website.url,
        name: website.name,
        owner: website.owner.username,
        createdAt: website.createdAt,
        recentStats: {
          totalChecks,
          uptime: totalChecks > 0 ? Math.round((upChecks / totalChecks) * 100) : 0,
          avgLatency,
          lastChecked: recentChecks[0]?.timestamp || null
        },
        canCheck: timeSinceLastCheck > 2 * 60 * 1000, // Can check if last check was >2 minutes ago
        lastCheckByValidator: lastCheckByValidator?.timestamp || null
      };
    }));
    
    // Sort by most recently needed (least recently checked overall)
    websitesWithStats.sort((a, b) => {
      const aLastCheck = a.recentStats.lastChecked ? new Date(a.recentStats.lastChecked).getTime() : 0;
      const bLastCheck = b.recentStats.lastChecked ? new Date(b.recentStats.lastChecked).getTime() : 0;
      return aLastCheck - bLastCheck; // Oldest first (needs checking most)
    });
    
    res.json({
      success: true,
      websites: websitesWithStats,
      count: websitesWithStats.length
    });
  } catch (err) {
    console.error('Error fetching marketplace websites:', err);
    res.status(500).json({ error: 'Failed to fetch marketplace websites' });
  }
});

// GET /api/websites/:websiteId/stats - Get website statistics (uptime, latency)
router.get('/:websiteId/stats', auth, getWebsiteStats);

// GET /api/websites/:websiteId/history - Get website check history for charts
router.get('/:websiteId/history', auth, getWebsiteHistory);

// GET /api/websites/:websiteId/validators - Get validators who checked this website
router.get('/:websiteId/validators', auth, async (req, res) => {
  try {
    const checks = await Check.find({ website: req.params.websiteId })
      .populate('validator', 'solanaWallet username')
      .sort({ timestamp: -1 })
      .limit(10); // Get last 10 checks

    const validators = checks.map(check => ({
      checkId: check._id,
      validatorId: check.validator._id,
      walletAddress: check.validator.solanaWallet,
      username: check.validator.username,
      status: check.status,
      latency: check.latency,
      timestamp: check.timestamp,
      signature: check.signature
    }));

    res.json({
      success: true,
      validators: validators,
      count: validators.length
    });
  } catch (err) {
    console.error('Error fetching validators:', err);
    res.status(500).json({ error: 'Failed to fetch validators' });
  }
});

// DELETE /api/websites/:websiteId - Delete a website (owner only)
router.delete('/:websiteId', auth, async (req, res) => {
  try {
    const Website = require('../models/Website');
    
    // Find the website and verify ownership
    const website = await Website.findOne({
      _id: req.params.websiteId,
      owner: req.user.id
    });
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found or you do not have permission to delete it' });
    }
    
    // Delete all associated checks first
    await Check.deleteMany({ website: req.params.websiteId });
    
    // Delete the website
    await Website.findByIdAndDelete(req.params.websiteId);
    
    console.log(`✅ Website deleted: ${website.url} by user ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Website and all associated data deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting website:', err);
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

// PUT /api/websites/:websiteId/reward-settings - Update reward settings for a website
router.put('/:websiteId/reward-settings', auth, async (req, res) => {
  try {
    const Website = require('../models/Website');
    const { rewardPerCheck, autoPayments, walletBalance } = req.body;
    
    // Find the website and verify ownership
    const website = await Website.findOne({
      _id: req.params.websiteId,
      owner: req.user.id
    });
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found or you do not have permission to modify it' });
    }
    
    // Update reward settings
    const updateData = {};
    if (rewardPerCheck !== undefined) updateData.rewardPerCheck = rewardPerCheck;
    if (autoPayments !== undefined) updateData.autoPayments = autoPayments;
    if (walletBalance !== undefined) updateData.walletBalance = walletBalance;
    
    await Website.findByIdAndUpdate(req.params.websiteId, updateData);
    
    console.log(`✅ Reward settings updated for website: ${website.url}`);
    
    res.json({
      success: true,
      message: 'Reward settings updated successfully',
      settings: updateData
    });
  } catch (err) {
    console.error('Error updating reward settings:', err);
    res.status(500).json({ error: 'Failed to update reward settings' });
  }
});

module.exports = router; 