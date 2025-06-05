const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');

// GET /api/assignments - Get assignments for the logged-in validator
router.get('/', auth, async (req, res) => {
  try {
    // Verify user is a validator
    if (req.user.role !== 'validator') {
      return res.status(403).json({ error: 'Only validators can access assignments' });
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

module.exports = router; 