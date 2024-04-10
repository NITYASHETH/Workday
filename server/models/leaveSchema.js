const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  request_date_from: {
    type: Date,
    required: true
  },
  request_date_to: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'], // Status can be one of these values
    default: 'pending' // Default status is pending
  }
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
