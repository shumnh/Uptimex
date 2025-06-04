const mongoose = require('mongoose');

const CheckSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['up', 'down'],
    required: true
  },
  latency: {
    type: Number, // milliseconds
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  signature: {
    type: String,
    required: true // cryptographic proof from validator
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Check', CheckSchema); 