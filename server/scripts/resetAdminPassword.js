const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load environment variables
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    // Connect to database
    await connectDB();

    // Find the admin user
    const user = await User.findOne({ email: 'soumyamajumder201817@gmail.com' });
    
    if (!user) {
      console.log('Admin user not found');
      process.exit(1);
    }

    // Set a new password
    const newPassword = 'admin123'; // Default admin password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    console.log('Admin password has been reset successfully');
    console.log('Email:', user.email);
    console.log('New Password:', newPassword);
    console.log('Please change this password after first login for security');

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

resetAdminPassword();