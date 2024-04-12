const mongoose = require('mongoose');

// Define task schema
const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Ass uming you have a User model
    // required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming User is the name of the user model
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming User is the name of the user model
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    validate: {
      validator: function(value) {
        // Custom validation logic
        return ['Pending', 'InProgress', 'Completed', 'pending', 'inProgress', 'completed'].includes(value);
      },
      message: props => `${props.value} is not a valid status.`
    },
    default: 'Pending'
  }
});

// Create Task model
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
