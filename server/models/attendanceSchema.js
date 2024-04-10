const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['login', 'logout', 'present', 'absent'], // Add 'present' and 'absent' as valid values
    required: true
  },
  login_time: {
    type: Date
  },
  logout_time: {
    type: Date
  },
  session_duration: {
    type: Number // Or whatever type suits your needs for session duration
  }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
