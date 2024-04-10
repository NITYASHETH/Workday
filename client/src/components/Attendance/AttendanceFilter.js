import React, { useState, useEffect } from 'react';
import { Card, CardContent, Grid, Select, MenuItem, Typography, TextField, Button } from '@mui/material';

const fetchUsers = async () => {
  const response = await fetch('http://localhost:3001/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

const fetchAttendance = async (userId, date) => {
  const response = await fetch(`http://localhost:3001/attendance/user/${userId}?date=${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch attendance records');
  }
  return response.json();
};

const AttendanceFilter = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const getUsers = async () => {
      try {
        const userData = await fetchUsers();
        setUsers(userData.userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    getUsers();
  }, []);

  const handleUserSelect = async (userId) => {
    setSelectedUser(userId);
    try {
      const attendanceData = await fetchAttendance(userId, selectedDate);
      setAttendanceRecords(attendanceData.attendanceRecords);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (selectedUser) {
      handleUserSelect(selectedUser);
    }
  };

  return (
    <div>
      <h2>Attendance Filter</h2>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Select
            id="userSelect"
            value={selectedUser}
            onChange={(e) => handleUserSelect(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select User</MenuItem>
            {users.map(user => (
              <MenuItem key={user._id} value={user._id}>{user.fname}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="date"
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateSelect(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          {attendanceRecords.length > 0 ? (
            attendanceRecords.map((record, index) => (
              <Card key={index} variant="outlined" style={{ margin: '10px 0' }}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    User: {record.user_id}, Date: {new Date(record.date).toLocaleDateString()}, Status: {record.status}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body1">No attendance records found.</Typography>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default AttendanceFilter;
