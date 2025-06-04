const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Reward = require('../models/Reward');

// POST /api/users/connect-wallet
router.post('/connect-wallet', auth, async (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: 'Wallet address required' });
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { solanaWallet: wallet },
      { new: true }
    );
    res.json({ success: true, wallet: user.solanaWallet });
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect wallet' });
  }
});

// POST /api/users/record-reward - Record a reward transaction
router.post('/record-reward', auth, async (req, res) => {
  const { validatorId, websiteId, amount, transactionId, tokenType, checkId } = req.body;
  
  if (!validatorId || !websiteId || !amount || !transactionId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const reward = await Reward.create({
      website: websiteId,
      owner: req.user.id,
      validator: validatorId,
      amount,
      transactionId,
      tokenType: tokenType || 'SOL',
      checkId: checkId || null
    });
    
    res.json({ success: true, reward });
  } catch (err) {
    console.error('Error recording reward:', err);
    res.status(500).json({ error: 'Failed to record reward' });
  }
});

// GET /api/users/rewards - Get reward history for the logged-in user
router.get('/rewards', auth, async (req, res) => {
  try {
    const rewards = await Reward.find({ owner: req.user.id })
      .populate('validator', 'username solanaWallet')
      .populate('website', 'name url')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(rewards);
  } catch (err) {
    console.error('Error fetching rewards:', err);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

module.exports = router; 