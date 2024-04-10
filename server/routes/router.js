const express = require("express");
const User = require("../models/userSchema");
const Task = require("../models/taskSchema");
const { exec } = require("child_process");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authenticate");
const Attendance = require("../models/attendanceSchema");
const Alert = require("../models/alertSchema");
const Leave = require('../models/leaveSchema');
const Salary = require('../models/Salary');
const Project = require('../models/projectSchema');
const axios = require('axios');
//const Employee = require('../models/employeeSchema');
const Salarystatus = require("../models/salarySchema");



const keysecret = "vrajjariwalanityasheth";

const router = express.Router();
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());



//register api
const nodemailer = require("nodemailer");

router.post("/register", async (req, res) => {
  try {
    const { fname, email, password, role, cid, mobileno, city, state, country, gender } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ status: 0, message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    user = new User({
      fname,
      email,
      password: hashedPassword,
      role,
      cid,
      mobileno,
      city,
      state,
      country,
      gender
    });

    // Save user to database
    await user.save();

    // Sending email to registered user
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vrajjariwala123@gmail.com',
        pass: 'levywymfixzbejia'
      }
    });

    const mailOptions = {
      from: 'vrajjariwala123@gmail.com',
      to: email,
      subject: 'Registration Successful',
      text: `Dear ${fname},\n\nThank you for registering with us!\n\nRegards,\n WorkDay`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res
      .status(201)
      .json({ status: 1, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});



router.get("/userscom", async (req, res) => {
  try {
    // Fetch users from the database
    const users = await User.find({}, { cid: 1, fname: 1, email: 1 });

    if (!users) {
      return res.status(404).json({ status: 0, message: "No users found" });
    }

    res.status(200).json({ status: 1, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});

router.get("/usersrole", async (req, res) => {
  try {
    const { cid, role } = req.query;

    // Construct filter object based on query parameters
    const filter = {};
    if (cid) filter.cid = cid;
    if (role) filter.role = role;

    // Find users matching the filter
    const users = await User.find(filter);

    if (!users || users.length === 0) {
      return res.status(404).json({ status: 0, message: "No users found" });
    }

    // Extract only fname and role from users
    const userList = users.map((user) => ({
      fname: user.fname,
      role: user.role,
    }));

    res.status(200).json({ status: 1, message: "User list retrieved successfully", userList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});


// router.post("/createEmployee", async (req, res) => {
//   try {
//     const { Name, Age, DateOfBirth, Country, City, State, role, email, contactNumber, password, cid } = req.body;

//     // Check if employee with the same email already exists
//     let existingEmployee = await Employee.findOne({ email });
//     if (existingEmployee) {
//       return res.status(400).json({ status: 0, message: "Employee with this email already exists" });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Create new employee
//     const newEmployee = new Employee({
//       Name,
//       Age,
//       DateOfBirth,
//       Country,
//       City,
//       State,
//       role,
//       email,
//       contactNumber,
//       password: hashedPassword,
//       cid,
//     });

//     // Save the new employee to the database
//     await newEmployee.save();

//     // Send email to the new employee
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'your_email@gmail.com', // Update with your email
//         pass: 'your_password' // Update with your password
//       }
//     });

//     // Email content and configuration
//     const mailOptions = {
//       from: 'your_email@gmail.com', // Update with your email
//       to: email,
//       subject: 'Welcome to the Company',
//       text: `Welcome, ${Name}! Your registration as an employee was successful.`
//     };

//     // Send email
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log("Error sending email:", error);
//       } else {
//         console.log('Email sent: ' + info.response);
//       }
//     });

//     // Return success response
//     res.status(200).json({ status: 1, message: "Employee registered successfully" });
//   } catch (error) {
//     console.error("Error creating employee:", error);
//     res.status(500).json({ status: 0, message: "Internal server error" });
//   }
// });



// Login route


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    // Check if the user is active
    if (!user.isactive) {
      return res.status(401).json({ status: 0, message: "User is not active" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: 0, message: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, keysecret, { expiresIn: "1h" });

    // Create attendance record
    const attendance = new Attendance({
      user_id: user._id,
      date: new Date(),
      status: "login",
      login_time: new Date(),
    });

    await attendance.save();

    // Send token in response
    res
      .status(200)
      .json({ status: 1, message: "Login successful", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});

// User profile by ID route

router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    // Verify the token
    const decodedToken = jwt.verify(token, keysecret);
    const userId = decodedToken.userId;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    const userProfile = {
      fname: user.fname,
      email: user.email,
      role: user.role,
      cid: user.cid,
      mobileno: user.mobileno,
    };

    res.status(200).json({
      status: 1,
      message: "User profile retrieved successfully",
      userProfile,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      // Token verification failed
      return res.status(401).json({ status: 0, message: "Unauthorized" });
    }
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});

// Get single user by ID
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    // Exclude sensitive information like password before sending the response
    const userDetails = {
      fname: user.fname,
      email: user.email,
      role: user.role,
      cid: user.cid,
      mobileno: user.mobileno,
      // Add other fields as needed
    };

    res
      .status(200)
      .json({
        status: 1,
        message: "User details retrieved successfully",
        userDetails,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});


// Get total number of users by cid and role (filter)
router.get("/totalEmployees", async (req, res) => {
  try {
    const { cid, role } = req.query;

    // Construct filter object based on query parameters
    const filter = {};
    if (cid) filter.cid = cid;
    if (role) filter.role = role;

    // Count users matching the filter
    const totalEmployees = await User.countDocuments(filter);

    res.status(200).json({ totalEmployees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get total number of users by cid and role (filter) along with their fname
router.get("/totalEmployeesWithFname", async (req, res) => {
  try {
    const { cid, role } = req.query;

    // Construct filter object based on query parameters
    const filter = {};
    if (cid) filter.cid = cid;
    if (role) filter.role = role;

    // Find users matching the filter and retrieve only the 'fname' field
    const users = await User.find(filter).select('fname');

    if (!users || users.length === 0) {
      return res.status(404).json({ status: 0, message: "No users found" });
    }

    // Count the total number of users matching the filter
    const totalEmployees = users.length;

    res.status(200).json({ status: 1, totalEmployees, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});


// Get all users by cid and role (filter)
router.get("/users", async (req, res) => {
  try {
    const { cid, role } = req.query;

    // Construct filter object based on query parameters
    const filter = {};
    if (cid) filter.cid = cid;
    if (role) filter.role = role;

    // Find users matching the filter
    const users = await User.find(filter);

    if (!users || users.length === 0) {
      return res.status(404).json({ status: 0, message: "No users found" });
    }

    // Exclude sensitive information like password before sending the response
    const userList = users.map((user) => ({
      _id: user._id,
      fname: user.fname,
      email: user.email,
      role: user.role,
      cid: user.cid,
      mobileno: user.mobileno,
      // Add other fields as needed
    }));

    res
      .status(200)
      .json({
        status: 1,
        message: "User list retrieved successfully",
        userList,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});

// Edit user details
router.put("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { fname, email, role, cid, mobileno } = req.body;

    // Find the user by user ID
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    // Update user details
    user.fname = fname || user.fname;
    user.email = email || user.email;
    user.role = role || user.role;
    user.cid = cid || user.cid;
    user.mobileno = mobileno || user.mobileno;

    // Save updated user to the database
    await user.save();

    // Return updated user details
    res
      .status(200)
      .json({ status: 1, message: "User details updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});

// GET request to fetch all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Fetch users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "username"); // Assuming you have a User model
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Fetch users by role
router.get("/ausers", async (req, res) => {
  try {
    // Extract the role query parameter from the request
    const { role } = req.query;

    // Define the filter based on the role query parameter
    let filter = {};
    if (role) {
      filter.role = { $in: ["employee", "manager", "hr"] };
    }

    // Define the projection to exclude cid and mobileno fields
    const projection = { cid: 0, mobileno: 0 };

    // Find users matching the filter, excluding cid and mobileno fields
    const users = await User.find(filter, projection);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});


// Create a task
router.post("/tasks", async (req, res) => {
  try {
    const { title, description, dueDate, status, assignedTo, assignedBy, project } = req.body;
    
    // Check if assignedTo is provided and valid
    if (!assignedTo) {
      return res.status(400).json({ error: "AssignedTo is required." });
    }

    // Check if the assignedTo user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ error: "Assigned user not found." });
    }

    // Check if the assignedBy user exists
    if (assignedBy) {
      const assignedByUser = await User.findById(assignedBy);
      if (!assignedByUser) {
        return res.status(404).json({ error: "AssignedBy user not found." });
      }
    }

    // Check if the project exists
    if (project) {
      const projectExists = await Project.findById(project);
      if (!projectExists) {
        return res.status(404).json({ error: "Project not found." });
      }
    }

    const task = new Task({
      title,
      description,
      dueDate,
      status,
      assignedTo: assignedUser._id, // Store user's _id directly
      assignedBy, // Store assignedBy directly
      project // Store project directly
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to display all tasks
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to update the status of a task
router.put("/tasks/:taskId/status", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    
    // Validate the status value
    const validStatusValues = ['Pending', 'InProgress', 'Completed'];
    if (!validStatusValues.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    // Find the task by ID and update its status
    const updatedTask = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
    
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to delete a task
router.delete("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Route to get total tasks for users belonging to a specific company
router.get('/total-tasks', async (req, res) => {
  const { cid } = req.query;
  try {
    // Find all users belonging to the company
    const users = await User.find({ cid: cid });

    // Initialize total task count
    let totalTasks = 0;

    // Iterate over each user and count their tasks
    for (const user of users) {
      const userTasks = await Task.countDocuments({ assignedTo: user._id });
      totalTasks += userTasks;
    }

    res.json({ success: true, totalTasks });
  } catch (error) {
    console.error('Error fetching total tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Create Project
router.post('/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).send(project);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Read all Projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.send(projects);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update Project
router.put('/projects/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['projectname', 'projectcreateddate', 'projectduedate', 'projectdescription', 'projectstatus'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!project) {
      return res.status(404).send();
    }

    res.send(project);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update Project Status
router.put('/projects/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['Pending', 'In Process', 'Completed'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).send({ error: 'Invalid status!' });
  }

  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { projectstatus: status }, { new: true, runValidators: true });

    if (!project) {
      return res.status(404).send();
    }

    res.send(project);
  } catch (error) {
    res.status(400).send(error);
  }
});


// Delete Project
router.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).send();
    }

    res.send(project);
  } catch (error) {
    res.status(500).send(error);
  }
});


// Get users by ID, role
router.get("/filtasks", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract token from headers
    const decodedToken = jwt.verify(token, keysecret); // Verify token
    const userId = decodedToken.userId; // Extract user ID from decoded token

    const { role, cid } = req.query;
    let query = {};

    // Filter tasks based on role, cid, and assignedBy (user who created the task)
    if (role && cid) {
      query = {
        "assignedTo.role": role,
        "assignedTo.cid": cid,
        assignedBy: userId,
      };
    } else if (role) {
      query = { "assignedTo.role": role, assignedBy: userId };
    } else if (cid) {
      query = { "assignedTo.cid": cid, assignedBy: userId };
    } else {
      // If neither role nor cid is provided, only filter based on assignedBy (user who created the task)
      query = { assignedBy: userId };
    }

    // Find tasks matching the query and populate assignedTo field with user data
    const tasks = await Task.find(query).populate(
      "assignedTo",
      "fname email role cid mobileno"
    );

    // Check if no records found
    if (tasks.length === 0) {
      return res.status(404).send({ status: 0, message: "No records found" });
    }

    res.send(tasks);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send(error);
  }
});


// Logout route
router.post("/logout", async (req, res) => {
  try {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      return res.status(400).json({ status: 0, message: "Authorization header is missing" });
    }
    
    // Extract token from request headers
    const token = req.headers.authorization.split(" ")[1];
    
    // Verify token and extract user ID
    const decodedToken = jwt.verify(token, keysecret);
    const userId = decodedToken.userId;

    // Find the most recent login record for the user
    const loginRecord = await Attendance.findOne({ user_id: userId, status: "login" }).sort({ login_time: -1 });

    // If no login record found, return error
    if (!loginRecord) {
      return res.status(404).json({ status: 0, message: "No login record found for the user" });
    }

    // Ensure loginRecord has login_time property before proceeding
    if (!loginRecord.login_time) {
      return res.status(400).json({ status: 0, message: "Login record is missing login_time property" });
    }

    // Calculate session duration in milliseconds
    const logoutTime = new Date();
    const loginTime = loginRecord.login_time;
    const sessionDuration = logoutTime - loginTime; // in milliseconds

    // Convert session duration to hours, minutes, and seconds
    const hours = Math.floor(sessionDuration / 3600000);
    const minutes = Math.floor((sessionDuration % 3600000) / 60000);
    const seconds = Math.floor((sessionDuration % 60000) / 1000);

    // Create attendance record for logout
    const attendance = new Attendance({
      user_id: userId,
      date: logoutTime,
      status: "logout",
      login_time: loginTime,
      logout_time: logoutTime,
      session_duration: sessionDuration,
    });

    // Save attendance record
    await attendance.save();

    // Respond with successful logout message and session duration
    res.status(200).json({ status: 1, message: "Logout successful", session_duration: `${hours} hours, ${minutes} minutes, ${seconds} seconds` });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});


// // Create Attendance Record
// router.post("/attendance", async (req, res) => {
//   try {
//     const { user_id, status } = req.body;
//     const date = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format

//     // Check if there's already an attendance record for the user on the current date
//     const existingAttendance = await Attendance.findOne({ user_id, date });

//     // If an attendance record exists, reject the login request
//     if (existingAttendance) {
//       return res.status(400).json({ message: "User has already logged in for the day" });
//     }

//     // Fetch user details from the authentication token (you can add this logic here)

//     // Create attendance record
//     const attendance = new Attendance({
//       user_id,
//       date,
//       status,
//       // Optionally add other fields like login_time or logout_time
//     });

//     await attendance.save();
//     res.status(201).json(attendance);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });


// API endpoint to get attendance records for all users within a specific month and year
router.get("/attendance/all", async (req, res) => {
  try {
    const { year, month } = req.query;
    const attendanceRecords = await Attendance.find({ 
      // Filter records by year and month
      date: { $gte: new Date(`${year}-${month}-01`), $lt: new Date(`${year}-${parseInt(month)+1}-01`) } 
    }).populate('user_id', 'fname'); // Populate user details (e.g., first name)

    res.status(200).json({ status: 1, message: "Attendance records retrieved successfully", attendanceRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});

// API endpoint to get attendance records for a specific user
router.get("/attendance/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const attendanceRecords = await Attendance.find({ user_id: userId });
    res.status(200).json({ status: 1, message: "Attendance records retrieved successfully", attendanceRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});

//attendance api
const mongoose = require("mongoose");

// API endpoint to get total present and absent records for a user within a specific month and year
router.get("/attendance/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const attendanceSummary = await Attendance.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          uniqueDates: { $addToSet: "$date" }, // Get unique login dates for each day
          totalLogins: { $sum: 1 } // Count total logins for each day
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalDays: { $size: "$uniqueDates" }, // Count total days with at least one login
          totalPresent: { $size: "$uniqueDates" }, // Total present days (assuming at least one login is considered present)
          totalAbsent: {
            $subtract: [30, { $size: "$uniqueDates" }] // Assuming 30 days in a month
          },
          totalWorkingHours: { $multiply: [{ $size: "$uniqueDates" }, 8] } // Assuming 8 hours/day
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.status(200).json({ status: 1, message: "Attendance summary retrieved successfully", attendanceSummary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});


// Route to fetch and display all users timings along with cid
// Route to fetch and display all users timings along with name and cid
router.get("/users-timings", async (req, res) => {
  try {
    const { cid } = req.query; // Extracting cid from query parameters

    // Constructing filter object based on the cid query parameter
    const filter = {};
    if (cid) {
      filter.cid = cid;
    }

    // Fetch users based on the filter
    const users = await User.find(filter);

    // Array to store all users timings data
    const allUsersTimings = [];

    // Iterate through each user
    for (const user of users) {
      // Find login and logout records for the user
      const loginRecords = await Attendance.find({ user_id: user._id, status: "login" }).sort({ login_time: 1 });
      const logoutRecords = await Attendance.find({ user_id: user._id, status: "logout" }).sort({ logout_time: 1 });

      // Combine login and logout records
      const timings = [];

      // Check if both login and logout records exist
      if (loginRecords.length === logoutRecords.length) {
        for (let i = 0; i < loginRecords.length; i++) {
          timings.push({
            login_time: loginRecords[i].login_time,
            logout_time: logoutRecords[i].logout_time
          });
        }
      } else {
        // Log the error and continue to the next user
        console.error(`Number of login records does not match number of logout records for user ${user._id}`);
        continue;
      }

      // Add user timings data to the array, including name and cid
      allUsersTimings.push({
        user_id: user._id,
        name: user.fname, // Adding name here
        email: user.email,
        cid: user.cid,
        timings: timings
      });
    }

    // Respond with all users timings data
    res.status(200).json({ status: 1, message: "All users timings fetched successfully", all_users_timings: allUsersTimings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});

// Route to automatically mark attendance as present for users who have completed 7 hours of work
router.post("/mark-attendance", async (req, res) => {
  try {
    // Get all users
    const users = await User.find();

    // Array to store attendance status for each user
    const attendanceStatus = [];

    // Get today's date
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Iterate through each user
    for (const user of users) {
      // Find today's login and logout records for the user
      const loginRecords = await Attendance.find({ user_id: user._id, status: "login", login_time: { $gte: startOfDay, $lt: endOfDay } });
      const logoutRecords = await Attendance.find({ user_id: user._id, status: "logout", logout_time: { $gte: startOfDay, $lt: endOfDay } });

      // Calculate total duration of work for today
      let totalWorkDuration = 0;
      const minRecordsLength = Math.min(loginRecords.length, logoutRecords.length);
      
      for (let i = 0; i < minRecordsLength; i++) {
        const loginTime = loginRecords[i].login_time;
        const logoutTime = logoutRecords[i].logout_time;
        totalWorkDuration += logoutTime - loginTime; // Assuming logout time is always after login time
      }

      // Check if total work duration exceeds 7 hours
      const sevenHoursInMillis = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
      if (totalWorkDuration >= sevenHoursInMillis) {
        // Mark attendance as present for today
        const todayAttendance = await Attendance.findOneAndUpdate(
          { user_id: user._id, date: startOfDay },
          { $set: { status: "present" } },
          { upsert: true, new: true }
        );

        // Push user's attendance status to the array, including user's name
        attendanceStatus.push({ user_id: user._id, user_name: user.fname, status: "present", date: startOfDay });
      } else {
        // Push user's attendance status to the array, including user's name
        attendanceStatus.push({ user_id: user._id, user_name: user.fname, status: "absent", date: startOfDay });
      }
    }

    // Send the response with attendance status
    res.status(200).json({ status: 1, message: "Attendance marked successfully", attendance_status: attendanceStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});

//filter for mark attendance automatic
router.post("/mark-attendance-filtered", async (req, res) => {
  try {
    // Get users with roles 'employee', 'manager', or 'hr'
    const users = await User.find({ role: { $in: ['employee', 'manager', 'hr'] } });

    // Array to store attendance status for each user
    const attendanceStatus = [];

    // Get today's date
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Iterate through each user
    for (const user of users) {
      // Find today's login and logout records for the user
      const loginRecords = await Attendance.find({ user_id: user._id, status: "login", login_time: { $gte: startOfDay, $lt: endOfDay } });
      const logoutRecords = await Attendance.find({ user_id: user._id, status: "logout", logout_time: { $gte: startOfDay, $lt: endOfDay } });

      // Calculate total duration of work for today
      let totalWorkDuration = 0;
      const minRecordsLength = Math.min(loginRecords.length, logoutRecords.length);
      
      for (let i = 0; i < minRecordsLength; i++) {
        const loginTime = loginRecords[i].login_time;
        const logoutTime = logoutRecords[i].logout_time;
        totalWorkDuration += logoutTime - loginTime; // Assuming logout time is always after login time
      }

      // Check if total work duration exceeds 7 hours
      const sevenHoursInMillis = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
      if (totalWorkDuration >= sevenHoursInMillis) {
        // Mark attendance as present for today
        const todayAttendance = await Attendance.findOneAndUpdate(
          { user_id: user._id, date: startOfDay },
          { $set: { status: "present" } },
          { upsert: true, new: true }
        );

        // Push user's attendance status to the array, including user's name
        attendanceStatus.push({ user_id: user._id, user_name: user.fname, status: "present", date: startOfDay });
      } else {
        // Push user's attendance status to the array, including user's name
        attendanceStatus.push({ user_id: user._id, user_name: user.fname, status: "absent", date: startOfDay });
      }
    }

    // Send the response with attendance status
    res.status(200).json({ status: 1, message: "Attendance marked successfully", attendance_status: attendanceStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});


//api for monthly attendace calculation
router.get("/monthly-attendance", async (req, res) => {
  try {
    // Get the month and year from the request query parameters
    const { month, year } = req.query;

    // Validate month and year
    if (!month || !year) {
      return res.status(400).json({ status: 0, message: "Month and year are required parameters." });
    }

    // Convert month and year to numbers
    const monthNumber = parseInt(month);
    const yearNumber = parseInt(year);

    // Check if month is valid
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({ status: 0, message: "Invalid month." });
    }

    // Get the first and last day of the specified month
    const firstDayOfMonth = new Date(yearNumber, monthNumber - 1, 1);
    const lastDayOfMonth = new Date(yearNumber, monthNumber, 0);

    // Get all attendance records within the specified month
    const attendanceRecords = await Attendance.find({
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });

    // Fetch user names and roles from the database for only 'employee', 'manager', or 'hr' roles
    const users = await User.find({ role: { $in: ['employee', 'manager', 'hr'] } }, { _id: 1, fname: 1 });

    // Calculate total attendance hours and presence days for each user
    const userAttendance = {};
    const presenceDays = {};

    attendanceRecords.forEach(record => {
      if (!userAttendance[record.user_id]) {
        userAttendance[record.user_id] = 0;
        presenceDays[record.user_id] = 0;
      }
      
      if (record.status === 'logout') {
        const workDuration = (record.logout_time - record.login_time) / (1000 * 60 * 60); // Convert milliseconds to hours
        userAttendance[record.user_id] += workDuration;
        
        if (workDuration >= 7) {
          presenceDays[record.user_id] += 1;
        }
      }
    });

    // Prepare response data with user names, total hours, presence days, and absence days
    const monthlyAttendance = users.map(user => ({
      user_id: user._id,
      user_name: user.fname,
      total_hours: userAttendance[user._id] || 0,
      presence_days: presenceDays[user._id] || 0,
      absence_days: lastDayOfMonth.getDate() - (presenceDays[user._id] || 0)
    }));

    // Send the response
    res.status(200).json({ status: 1, message: "Monthly attendance calculated successfully", monthly_attendance: monthlyAttendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
});


// REST API endpoint to create an alert
router.post('/alerts', async (req, res) => {
  try {
    const { alertType, title, message, userId, assignedTo } = req.body;

    // Save alert to the database
    const newAlert = new Alert({ alertType, title, message, userId, assignedTo });
    await newAlert.save();

    res.json({ success: true, message: 'Alert created successfully' });
  } catch (error) {
    console.error('Error creating alert:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create alert' });
  }
});

// REST API endpoint to fetch alerts
router.get('/alerts', async (req, res) => {
  try {
    const { cid } = req.query;

    let filter = {};

    if (cid) {
      // If cid is provided, filter alerts by user cid
      filter = { 'userId': { $in: await User.find({ cid }) } };
    }

    const alerts = await Alert.find(filter)
      .populate('userId', 'fname cid')
      .populate('assignedTo', 'fname cid');

    res.status(200).json({ success: true, alerts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
});

// REST API endpoint to update an alert
router.put('/alerts/:alertId', async (req, res) => {
  try {
    const alertId = req.params.alertId;
    const { alertType, title, message, userId, assignedTo } = req.body;

    // Find the alert by ID and update it
    const updatedAlert = await Alert.findByIdAndUpdate(alertId, { alertType, title, message, userId, assignedTo }, { new: true });

    if (!updatedAlert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.status(200).json({ success: true, message: 'Alert updated successfully', alert: updatedAlert });
  } catch (error) {
    console.error('Error updating alert:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update alert' });
  }
});

// REST API endpoint to fetch alerts with company IDs
router.get('/alerts-with-cid', async (req, res) => {
  try {
    // Fetch all alerts from the database and populate userId with cid
    const alerts = await Alert.find().populate({
      path: 'userId',
      select: 'cid'
    });

    res.status(200).json({ success: true, alerts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch alerts with CIDs' });
  }
});

router.get('/alerts-with-cidso', async (req, res) => {
  try {
    const { cid } = req.query; // Get the cid query parameter

    let query = {}; // Initialize an empty query object

    // If cid is provided, add it to the query after converting it to ObjectId
    if (cid) {
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(cid)) {
        return res.status(400).json({ success: false, message: 'Invalid company ID' });
      }
      query.userId = mongoose.Types.ObjectId(cid);
    }

    // Fetch alerts from the database and populate userId with cid
    const alerts = await Alert.find(query).populate({
      path: 'userId',
      select: 'cid'
    });

    res.status(200).json({ success: true, alerts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch alerts with CIDs' });
  }
});



// Create a new leave request
router.post('/api/leave', async (req, res) => {
  try {
      const leaveData = req.body;
      
      // Create a new Leave document
      const newLeave = new Leave(leaveData);

      // Save the new leave document to the database
      await newLeave.save();

      res.status(201).json(newLeave);
  } catch (error) {
      console.error("Error creating leave:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/api/leave', async (req, res) => {
  try {
    const { cid } = req.query;
    console.log('CID:', cid);

    let leaveRequests;
    if (cid) {
      // If cid is provided, filter leave requests by user cid
      leaveRequests = await Leave.find({ cid }).populate({
        path: 'user_id',
        select: 'fname' // Project only the fname field
      }).exec();
    } else {
      // If cid is not provided, fetch all leave requests
      leaveRequests = await Leave.find().populate({
        path: 'user_id',
        select: 'fname' // Project only the fname field
      }).exec();
    }

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch leave requests for a particular user
router.get('/api/leave/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch leave requests for the particular user from the database
    const userLeaveRequests = await Leave.find({ user_id: userId });

    // Send the leave requests for the user to the client
    res.status(200).json(userLeaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests for user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Update a leave request
router.put('/api/leave/:id', async (req, res) => {
  try {
      const leaveId = req.params.id;
      const { status } = req.body;

      // Check if the status is one of 'pending', 'approved', or 'rejected'
      if (!['pending', 'approved', 'rejected'].includes(status)) {
          return res.status(400).json({ error: "Invalid status" });
      }

      // Find the leave request by ID
      const leaveRequest = await Leave.findById(leaveId);
      if (!leaveRequest) {
          return res.status(404).json({ error: "Leave request not found" });
      }

      // Update the leave status
      leaveRequest.status = status;
      await leaveRequest.save();
      
      return res.json(leaveRequest);
  } catch (error) {
      console.error("Error updating leave:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch total leave requests, rejected leave requests, and approved leave requests
router.get('/api/leave/stats', async (req, res) => {
  try {
    // Fetch all leave requests from the database
    const allLeaveRequests = await Leave.find();

    // Count total leave requests
    const totalLeave = allLeaveRequests.length;

    // Filter leave requests by status
    const rejectedLeave = allLeaveRequests.filter(leave => leave.status === 'rejected').length;
    const approvedLeave = allLeaveRequests.filter(leave => leave.status === 'approved').length;

    res.status(200).json({ totalLeave, rejectedLeave, approvedLeave });
  } catch (error) {
    console.error("Error fetching leave stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch total leave for a particular user
router.get('/api/leave/total/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch all leave requests for the particular user from the database
    const userLeaveRequests = await Leave.find({ user_id: userId });

    // Count total leave requests for the user
    const totalLeave = userLeaveRequests.length;

    res.status(200).json({ totalLeave });
  } catch (error) {
    console.error("Error fetching total leave for user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch rejected leave for a particular user
router.get('/api/leave/rejected/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch all leave requests for the particular user from the database
    const userLeaveRequests = await Leave.find({ user_id: userId, status: 'rejected' });

    // Count rejected leave requests for the user
    const rejectedLeave = userLeaveRequests.length;

    res.status(200).json({ rejectedLeave });
  } catch (error) {
    console.error("Error fetching rejected leave for user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch approved leave for a particular user
router.get('/api/leave/approved/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch all leave requests for the particular user from the database
    const userLeaveRequests = await Leave.find({ user_id: userId, status: 'approved' });

    // Count approved leave requests for the user
    const approvedLeave = userLeaveRequests.length;

    res.status(200).json({ approvedLeave });
  } catch (error) {
    console.error("Error fetching approved leave for user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch leave requests for a particular user
router.get('/api/leave', async (req, res) => {
  try {
    // Check if userId is provided as a query parameter
    const userId = req.query.userId;

    // Define the query based on whether userId is provided or not
    const query = userId ? { user_id: userId } : {};

    // Fetch leave requests from the database based on the query
    const leaveRequests = await Leave.find(query);

    // Send the leave requests to the client
    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a leave request status
router.put('/api/leave/:id/:status', async (req, res) => {
  try {
      const leaveId = req.params.id;
      const status = req.params.status;

      // Check if the status is one of 'approved' or 'rejected'
      if (!['approved', 'rejected'].includes(status)) {
          return res.status(400).json({ error: "Invalid status. Only 'approved' or 'rejected' are allowed." });
      }

      // Find the leave request by ID
      const leaveRequest = await Leave.findById(leaveId);
      if (!leaveRequest) {
          return res.status(404).json({ error: "Leave request not found" });
      }

      // Update the leave status
      leaveRequest.status = status;
      await leaveRequest.save();
      
      return res.json(leaveRequest);
  } catch (error) {
      console.error("Error updating leave:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});



// // Create Attendance Record
// router.post('/attendance', async (req, res) => {
//   try {
//     const { user_id, date, status } = req.body;
//     // Assuming Attendance is a Mongoose model
//     const attendance = new Attendance({ user_id, date, status });
//     await attendance.save();
//     res.status(201).json(attendance);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// Create Attendance Record
router.post('/attendance', async (req, res) => {
  try {
    const { user_id, date, status } = req.body;

    // Check if an attendance record already exists for the specified user and date
    const existingAttendance = await Attendance.findOne({ user_id, date });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance record already exists for this date' });
    }

    // Assuming Attendance is a Mongoose model
    const attendance = new Attendance({ user_id, date, status });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// display API endpoint to fetch attendance data
router.get('/attendance', async (req, res) => {
  try {
    // Fetch attendance data from the database
    const attendanceData = await Attendance.find(); // Assuming you're using Mongoose to interact with MongoDB
    res.json(attendanceData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Attendance Record
router.put('/attendance/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { date, status } = req.body;

    // Find the attendance record based on user_id and date
    const attendance = await Attendance.findOneAndUpdate({ user_id, date }, { status }, { new: true });

    // If the attendance record doesn't exist, return a 404 error
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// GET request to fetch total attendance in a month for a particular user
// GET request to fetch total attendance in a month for a particular user
router.get('/attendance/monthly', async (req, res) => {
  try {
    const { userId, month, year } = req.query;

    // Validate request parameters
    if (!userId || !month || !year) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Fetch attendance data for the specified user and month where status is "present"
    const attendanceData = await Attendance.find({
      user_id: userId,
      date: { $gte: startDate, $lte: endDate },
      status: 'present' // Assuming the field name for status in Attendance model is "status"
    });

    // Calculate total attendance for the month
    const totalAttendance = attendanceData.length;

    res.json({ success: true, totalAttendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// GET request to fetch total attendance in a month for a particular user along with fname
router.get('/attendance/monthlyWithFname', async (req, res) => {
  try {
    const { userId, month, year } = req.query;

    // Validate request parameters
    if (!userId || !month || !year) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Fetch user data to get the fname
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch attendance data for the specified user and month where status is "present"
    const attendanceData = await Attendance.find({
      user_id: userId,
      date: { $gte: startDate, $lte: endDate },
      status: 'present' // Assuming the field name for status in Attendance model is "status"
    });

    // Calculate total attendance for the month
    const totalAttendance = attendanceData.length;

    res.json({ success: true, fname: user.fname, totalAttendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// //create salary

// router.post('/salary', async (req, res) => {
//   try {
//     const { userId, amount } = req.body;
    
//     // Check if the user exists or not
//     // You can implement this part by calling your user listing API

//     // Assuming user exists, create salary entry
//     const salary = new Salary({
//       userId,
//       amount
//     });
    
//     // Save salary to the database
//     await salary.save();
    
//     res.json({ success: true, message: 'Salary added successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// });

//create salary
router.post('/salary', async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // Check if the user already has a salary entry
    const existingSalary = await Salary.findOne({ userId });

    if (existingSalary) {
      return res.status(400).json({ success: false, message: 'Salary entry already exists for this user' });
    }

    // Create a new salary entry
    const salary = new Salary({ userId, amount });
    
    // Save salary to the database
    await salary.save();
    
    res.json({ success: true, message: 'Salary added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

//display salary
router.get('/salary/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Retrieve salary details for the given userId
    const salaries = await Salary.find({ userId });

    res.json({ success: true, salaries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

//display api
router.get('/salaries', async (req, res) => {
  try {
    // Retrieve all salary details and populate userid with user details
    const salaries = await Salary.find().populate({
      path: 'userId',
      select: 'fname email role mobileno isactive' // Include more fields here
    }).exec();

    if (!salaries) {
      return res.status(404).json({ success: false, message: 'Salaries not found' });
    }

    res.json({ success: true, salaries });
  } catch (error) {
    console.error('Error fetching salaries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update salary amount
router.put('/salary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    // Find the salary entry for the user
    const salary = await Salary.findOne({ userId });

    // If salary entry does not exist, return error
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary entry not found for this user' });
    }

    // Update the salary amount
    salary.amount = amount;
    
    // Save the updated salary to the database
    await salary.save();
    
    res.json({ success: true, message: 'Salary amount updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Calculate total salary amount for a specific company ID (CID)
router.get('/total-salary', async (req, res) => {
  try {
    const { cid } = req.query;

    // Retrieve all salary details for the given CID
    const salaries = await Salary.find().populate({
      path: 'userId',
      match: { cid } // Filter users by cid
    }).exec();

    // Calculate total salary amount
    let totalSalary = 0;
    salaries.forEach(salary => {
      // Add salary amount only if userId is not null (user with matching cid is found)
      if (salary.userId !== null) {
        totalSalary += salary.amount;
      }
    });

    res.json({ success: true, totalSalary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


// Delete salary amount
router.delete('/salary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the salary entry for the user
    const salary = await Salary.findOne({ userId });

    // If salary entry does not exist, return error
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary entry not found for this user' });
    }

    // Delete the salary entry from the database
    await salary.delete();
    
    res.json({ success: true, message: 'Salary amount deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});





router.post('/calculate-salary', async (req, res) => {
  try {
    const { userId, month, year } = req.body;

    // Fetch total attendance for the user in the specified month
    const attendanceResponse = await axios.get(`http://localhost:3001/attendance/monthly?userId=${userId}&month=${month}&year=${year}`);
    const totalAttendance = attendanceResponse.data.totalAttendance;

    // Fetch user's salary
    const salaryResponse = await axios.get('http://localhost:3001/salaries');
    const userSalary = salaryResponse.data.salaries.find(salary => salary.userId === userId)?.amount;

    if (!userSalary) {
      return res.status(404).json({ success: false, message: 'Salary not found for the user' });
    }

    // Calculate total working days in the month (assuming 22 days)
    const totalWorkingDays = 22; // You can modify this based on your business logic

    // Calculate salary for the user based on total present days and user's salary
    const calculatedSalary = (userSalary / totalWorkingDays) * totalAttendance;

    res.json({ success: true, calculatedSalary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.get('/salary', async (req, res) => {
  try {
    const { userId, month, year } = req.query;

    // Fetch total attendance for the user in the specified month
    const attendanceResponse = await axios.get(`http://localhost:3001/attendance/monthly?userId=${userId}&month=${month}&year=${year}`);
    const totalAttendance = attendanceResponse.data.totalAttendance;

    // Fetch user's salary
    const salaryResponse = await axios.get('http://localhost:3001/salaries');
    const userSalary = salaryResponse.data.salaries.find(salary => salary.userId === userId)?.amount;

    if (!userSalary) {
      return res.status(404).json({ success: false, message: 'Salary not found for the user' });
    }

    // Calculate total working days in the month (assuming 22 days)
    const totalWorkingDays = 22; // You can modify this based on your business logic

    // Calculate salary for the user based on total present days and user's salary
    const calculatedSalary = (userSalary / totalWorkingDays) * totalAttendance;

    res.json({ success: true, calculatedSalary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Combine APIs to display salary amount, total present day, and total salary per month
router.post('/calculate-salary-details', async (req, res) => {
  try {
    const { userId, month, year } = req.body;

    // Fetch total attendance for the user in the specified month
    const attendanceResponse = await axios.get(`http://localhost:3001/attendance/monthly?userId=${userId}&month=${month}&year=${year}`);
    const totalAttendance = attendanceResponse.data.totalAttendance;

    // Fetch user's salary
    const salaryResponse = await axios.get(`http://localhost:3001/salary/${userId}`);
    const userSalaries = salaryResponse.data.salaries;

    // Calculate total working days in the month (assuming 22 days)
    const totalWorkingDays = 22; // You can modify this based on your business logic

    // Calculate total salary for the user in the specified month
    let totalSalaryForMonth = 0;
    userSalaries.forEach(salary => {
      totalSalaryForMonth += salary.amount;
    });

    // Calculate salary for the user based on total present days and user's salary
    let calculatedSalary = (totalSalaryForMonth / totalWorkingDays) * totalAttendance;

    // Apply 10% tax deduction
    const taxDeduction = calculatedSalary * 0.1;
    calculatedSalary -= taxDeduction;

    // Send email to the user
    const user = await User.findById(userId); // Assuming you have a User model
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vrajjariwala123@gmail.com',
        pass: 'levywymfixzbejia'
      }
    });

    const mailOptions = {
      from: 'vrajjariwala123@gmail.com',
      to: user.email, // Assuming the user's email is stored in the User model
      subject: 'Salary Calculation Details',
      text: `Dear ${user.fname},\n\nHere are your salary calculation details:\n\nTotal Present Days: ${totalAttendance}\nTotal Salary for Month: ${totalSalaryForMonth}\nCalculated Salary (after 10% tax deduction): ${calculatedSalary}\n\nRegards,\nYour Company Name`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.error(error);
        // Handle error while sending email
      } else {
        console.log('Email sent: ' + info.response);
        // Email sent successfully
      }
    });

    // Send the salary details in the response
    res.json({ 
      success: true, 
      totalPresentDays: totalAttendance,
      totalSalaryForMonth,
      calculatedSalary 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


// API endpoint to fetch user details along with their salary
router.get('/user-salaries', async (req, res) => {
  try {
    // Retrieve users based on CID and role
    const { cid, role } = req.query;
    const filter = {};
    if (cid) filter.cid = cid;
    if (role) filter.role = role;
    const users = await User.find(filter);

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found' });
    }

    // Fetch salaries for the retrieved users
    const userSalaries = [];
    for (const user of users) {
      const salary = await Salary.findOne({ userId: user._id }); // Assuming Salary model has a field userId to associate with User
      if (salary) {
        userSalaries.push({
          fname: user.fname,
          cid: user.cid,
          salary: salary.amount // Assuming Salary model has a field amount representing salary
        });
      } else {
        userSalaries.push({
          fname: user.fname,
          cid: user.cid,
          salary: null // Salary not found for this user
        });
      }
    }

    // Remove entries with null salaries
    const validUserSalaries = userSalaries.filter(userSalary => userSalary.salary !== null);

    // Prepare data for bar graph
    const dataForBarGraph = validUserSalaries.map(userSalary => ({
      fname: userSalary.fname,
      salary: userSalary.salary
    }));

    res.json({ success: true, dataForBarGraph });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


// API endpoint to fetch total leave for employees with their CID for a particular month
router.get('/employee-leave-chart/:month', async (req, res) => {
  try {
    const month = parseInt(req.params.month); // Assuming month is passed as a number (1 for January, 2 for February, etc.)
    const { cid } = req.query;

    // Construct filter object based on query parameters
    const userFilter = { role: 'employee' }; // Filter only employees
    if (cid) userFilter.cid = cid;

    // Fetch users based on the filter
    const users = await User.find(userFilter);

    // Prepare data for the line chart
    const employeeLeaveData = [];

    for (const user of users) {
      // Fetch total leave for the user for the particular month
      const userLeaveRequests = await Leave.find({ user_id: user._id });
      const totalLeaveForMonth = userLeaveRequests.filter(leave => new Date(leave.startDate).getMonth() === month - 1).length;
      
      // Add user's data to the array
      employeeLeaveData.push({
        fname: user.fname,
        cid: user.cid,
        totalLeaveForMonth: totalLeaveForMonth
      });
    }

    res.status(200).json({ success: true, employeeLeaveData });
  } catch (error) {
    console.error("Error fetching employee leave data:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});


// API endpoint to get the count of tasks assigned to a specific user
router.get("/user/:userId/task-count", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find tasks assigned to the specified user
    const tasks = await Task.find({ assignedTo: userId });

    // Calculate the count of tasks
    const taskCount = tasks.length;

    res.json({ taskCount });
  } catch (error) {
    console.error("Error fetching task count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




// Combine APIs to display salary amount, total present day, and total salary per month, and send email for paid/unpaid
router.post('/calculate-and-send-salary-details', async (req, res) => {
  try {
    const { userId, month, year, status } = req.body;

    // Fetch total attendance for the user in the specified month
    const attendanceResponse = await axios.get(`http://localhost:3001/attendance/monthly?userId=${userId}&month=${month}&year=${year}`);
    const totalAttendance = attendanceResponse.data.totalAttendance;

    // Fetch user's salary
    const salaryResponse = await axios.get(`http://localhost:3001/salary/${userId}`);
    const userSalaries = salaryResponse.data.salaries;

    // Calculate total working days in the month (assuming 22 days)
    const totalWorkingDays = 22; // You can modify this based on your business logic

    // Calculate total salary for the user in the specified month
    let totalSalaryForMonth = 0;
    userSalaries.forEach(salary => {
      totalSalaryForMonth += salary.amount;
    });

    // Calculate salary for the user based on total present days and user's salary
    let calculatedSalary = (totalSalaryForMonth / totalWorkingDays) * totalAttendance;

    // Apply tax deduction
    const taxDeduction = calculatedSalary * 0.1;
    calculatedSalary -= taxDeduction;

     // Sending email to registered user
     const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vrajjariwala123@gmail.com',
        pass: 'levywymfixzbejia'
      }
    });

    const mailOptions = {
      from: 'vrajjariwala123@gmail.com',
      to: email,
      subject: 'Registration Successful',
      text: `Dear ${fname},\n\nThank you for registering with us!\n\nRegards,\n WorkDay`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });


    // Send the salary details in the response
    res.json({ 
      success: true, 
      totalPresentDays: totalAttendance,
      totalSalaryForMonth,
      calculatedSalary 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});



module.exports = router;
