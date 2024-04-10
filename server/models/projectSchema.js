// models/Salary.js

const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  // assignedtomanager: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // Assuming you have a User model
  //   required: true
  // },
  projectname: {
    type: String,
    required: true
  },
  projectcreateddate: {
    type: Date,
    required: true
  },
  projectduedate: {
    type: Date,
    required: true
  },
  projectdescription: {
    type: String,
    required: true
  },
  projectstatus: {
    type: String,
    validate: {
      validator: function(value) {
        // Custom validation logic
        return ['Pending', 'InProgress', 'Completed'].includes(value);
      },
      message: props => `${props.value} is not a valid status.`
    },
    default: 'Pending'
  },
  // You can add more fields as needed
});

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
