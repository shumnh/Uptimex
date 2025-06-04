const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  validator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true // Amount in SOL or token units
  },
  transactionId: {
    type: String,
    required: true // Solana transaction hash
  },
  tokenType: {
    type: String,
    default: 'SOL' // SOL or SPL token symbol
  },
  checkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Check',
    required: false // Which check was rewarded (optional)
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reward', RewardSchema);
