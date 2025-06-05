const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  validator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
AssignmentSchema.index({ validator: 1, completed: 1 });
AssignmentSchema.index({ website: 1, assignedAt: -1 });

module.exports = mongoose.model('Assignment', AssignmentSchema); 