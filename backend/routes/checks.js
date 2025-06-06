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

module.exports = router; 