const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const { createAssignments } = require('../utils/assignmentLogic');

// GET /api/assignments - Get assignments for the logged-in validator
router.get('/', auth, async (req, res) => {
  try {
    // Verify user is a validator or a website owner with a wallet (dual role)
    if (req.user.role !== 'validator' && !(req.user.role === 'user' && req.user.solanaWallet)) {
      return res.status(403).json({ error: 'Only validators or website owners with wallets can access assignments' });
    }

    // Get active assignments for this validator
    const assignments = await Assignment.find({
      validator: req.user.id,
      completed: false,
      expiresAt: { $gt: new Date() }
    }).populate('website', 'url name');

    // Format response
    const formattedAssignments = assignments.map(assignment => ({
      assignmentId: assignment._id,
      website: {
        id: assignment.website._id,
        url: assignment.website.url,
        name: assignment.website.name
      },
      assignedAt: assignment.assignedAt,
      expiresAt: assignment.expiresAt
    }));

    res.json({
      success: true,
      assignments: formattedAssignments,
      count: formattedAssignments.length
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/stats - Get assignment statistics for admin/debugging
router.get('/stats', auth, async (req, res) => {
  try {
    const totalAssignments = await Assignment.countDocuments({});
    const activeAssignments = await Assignment.countDocuments({
      completed: false,
      expiresAt: { $gt: new Date() }
    });
    const completedAssignments = await Assignment.countDocuments({
      completed: true
    });
    const expiredAssignments = await Assignment.countDocuments({
      completed: false,
      expiresAt: { $lt: new Date() }
    });

    res.json({
      total: totalAssignments,
      active: activeAssignments,
      completed: completedAssignments,
      expired: expiredAssignments
    });

  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    res.status(500).json({ error: 'Failed to fetch assignment statistics' });
  }
});

// POST /api/assignments/trigger - Manually trigger assignment creation (for testing)
router.post('/trigger', async (req, res) => {
  try {
    console.log('🔧 Manual assignment trigger requested');
    const result = await createAssignments();
    
    res.json({
      success: result.success,
      message: result.success 
        ? `Created ${result.assignmentsCreated} assignments for ${result.validatorsInvolved} validators`
        : result.message || result.error,
      details: result
    });
  } catch (error) {
    console.error('Error triggering assignments:', error);
    res.status(500).json({ error: 'Failed to trigger assignments' });
  }
});

module.exports = router; 