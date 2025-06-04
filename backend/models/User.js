const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: function() { return this.role === 'user'; }, // Only required for website owners
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: false // Not required if using wallet-only auth
  },
  role: {
    type: String,
    enum: ['user', 'validator'],
    default: 'user',
    required: true
  },
  solanaWallet: {
    type: String,
    required: false // Only for validators
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema); 