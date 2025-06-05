const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: function() { return this.role === 'user'; }, // Only required for website owners
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: function() { return this.role === 'user'; }, // Required for website owners, not validators
    select: false // Don't include password hash in queries by default for security
  },
  role: {
    type: String,
    enum: ['user', 'validator'],
    default: 'user',
    required: true
  },
  solanaWallet: {
    type: String,
    required: function() { return this.role === 'validator'; }, // Required for validators
  }
}, {
  timestamps: true
});

// Indexes for performance and uniqueness
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ solanaWallet: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });

// Method to get user data without sensitive information
UserSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema); 