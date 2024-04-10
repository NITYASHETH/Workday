const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true
  },
  Age: {
    type: Number,
    required: true
  },
  DateOfBirth: {
    type: Date,
    required: true
  },
  Country: {
    type: String,
    required: true
  },
  City: {
    type: String,
    required: true
  },
  State: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  contactNumber: {
    type: String, // Changed type to String
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cid: {
    type: String,
    required: true
  }
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
