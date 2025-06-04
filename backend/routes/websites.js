const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createWebsite } = require('../controllers/websiteController');
const Check = require('../models/Check');

router.post('/', auth, createWebsite);

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

    res.json(validators);
  } catch (err) {
    console.error('Error fetching validators:', err);
    res.status(500).json({ error: 'Failed to fetch validators' });
  }
});

module.exports = router; 