// models/Salary.js

const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Ass uming you have a User model
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  // You can add more fields as needed
});

module.exports = mongoose.model('Salary', SalarySchema);
