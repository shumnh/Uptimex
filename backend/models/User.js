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
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: false, // Optional for all users (wallet-based auth)
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,5})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: false, // Optional - only for traditional auth (if needed)
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
    required: true, // Required for all users (wallet-based auth)
    // Note: No unique constraint here - uniqueness is enforced by compound index with role
  }
}, {
  timestamps: true
});

// Indexes for performance and uniqueness
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ solanaWallet: 1, role: 1 }, { unique: true }); // Compound unique: same wallet can have different roles
UserSchema.index({ role: 1 });
// Note: username index is already created by "unique: true" in schema definition above

// Method to get user data without sensitive information
UserSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema); 