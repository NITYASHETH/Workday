// Import required modules
const mongoose = require('mongoose');

// Define the schema for the Alert model
const alertSchema = new mongoose.Schema({
  alertType: {
    type: String,
    required: true,
    enum: ['success', 'info', 'warning', 'danger'] // Enumerate the possible alert types
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: false // Making it optional
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Alert model using the schema
const Alert = mongoose.model('Alert', alertSchema);

// Export the model
module.exports = Alert;
