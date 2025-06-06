const mongoose = require('mongoose');

const WebsiteSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: false,
    trim: true
  },
  rewardPerCheck: {
    type: Number,
    default: 0.001,
    min: 0.001,
    max: 1.0
  },
  autoPayments: {
    type: Boolean,
    default: true
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRewardsPaid: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Website', WebsiteSchema); 