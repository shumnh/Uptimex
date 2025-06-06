const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { submitCheck } = require('../controllers/checkController');

router.post('/', auth, submitCheck);

// GET /api/checks/validator-stats - Get validator statistics
router.get('/validator-stats', auth, async (req, res) => {
  try {
    const Check = require('../models/Check');
    
    // Get total checks by this validator
    const totalChecks = await Check.countDocuments({ validator: req.user.id });
    
    // Get checks today by this validator
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checksToday = await Check.countDocuments({
      validator: req.user.id,
      timestamp: { $gte: today }
    });
    
    // Calculate estimated earnings (placeholder calculation)
    // In real implementation, this would be based on actual reward system
    const estimatedEarnings = parseFloat((totalChecks * 0.001).toFixed(3)); // 0.001 SOL per check
    
    res.json({
      success: true,
      stats: {
        totalChecks,
        checksToday,
        estimatedEarnings
      }
    });
  } catch (err) {
    console.error('Error fetching validator stats:', err);
    res.status(500).json({ error: 'Failed to fetch validator stats' });
  }
});

// GET /api/checks/validator-performance - Get validator performance for website owners
router.get('/validator-performance', auth, async (req, res) => {
  try {
    const Check = require('../models/Check');
    const Website = require('../models/Website');
    const User = require('../models/User');
    
    // Only allow website owners to see this
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only website owners can view validator performance' });
    }
    
    // Get all websites owned by this user
    const userWebsites = await Website.find({ owner: req.user.id });
    const websiteIds = userWebsites.map(w => w._id);
    
    if (websiteIds.length === 0) {
      return res.json({
        success: true,
        validators: []
      });
    }
    
    // Get all checks for user's websites
    const checks = await Check.find({ 
      website: { $in: websiteIds } 
    }).populate('validator', 'username name solanaWallet');
    
    // Group by validator and calculate performance metrics
    const validatorStats = {};
    
    checks.forEach(check => {
      const validatorId = check.validator._id.toString();
      
      if (!validatorStats[validatorId]) {
        validatorStats[validatorId] = {
          validatorId: validatorId,
          validatorName: check.validator.name || check.validator.username,
          validatorWallet: check.validator.solanaWallet,
          totalChecks: 0,
          accurateChecks: 0,
          totalResponseTime: 0,
          totalEarned: 0,
          lastCheck: null
        };
      }
      
      const stats = validatorStats[validatorId];
      stats.totalChecks++;
      
      // Assume accuracy based on consistent results (simplified)
      if (check.status === 'up') {
        stats.accurateChecks++;
      }
      
      // Add response time
      if (check.latency) {
        stats.totalResponseTime += check.latency;
      }
      
      // Calculate earnings (0.001 SOL per check - could be dynamic per website)
      stats.totalEarned += 0.001;
      
      // Update last check time
      if (!stats.lastCheck || new Date(check.timestamp) > new Date(stats.lastCheck)) {
        stats.lastCheck = check.timestamp;
      }
    });
    
    // Convert to array and calculate final metrics
    const validators = Object.values(validatorStats).map(stats => ({
      validatorId: stats.validatorId,
      validatorName: stats.validatorName,
      validatorWallet: stats.validatorWallet,
      totalChecks: stats.totalChecks,
      accuracy: stats.totalChecks > 0 ? Math.round((stats.accurateChecks / stats.totalChecks) * 100) : 0,
      avgResponseTime: stats.totalChecks > 0 ? Math.round(stats.totalResponseTime / stats.totalChecks) : 0,
      totalEarned: parseFloat(stats.totalEarned.toFixed(3)),
      lastCheck: stats.lastCheck
    }));
    
    // Sort by total checks (most active first)
    validators.sort((a, b) => b.totalChecks - a.totalChecks);
    
    res.json({
      success: true,
      validators: validators,
      count: validators.length
    });
  } catch (err) {
    console.error('Error fetching validator performance:', err);
    res.status(500).json({ error: 'Failed to fetch validator performance' });
  }
});

module.exports = router; 