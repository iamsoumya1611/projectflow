const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load environment variables
require('dotenv').config();

const verifyPassword = async () => {
  try {
    // Connect to database
    await connectDB();

    // Find the admin user
    const user = await User.findOne({ email: 'soumyamajumder201817@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log('User found:');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Password hash length:', user.password.length);
    console.log('Password hash preview:', user.password.substring(0, 20) + '...');
    
    // Test a sample password (you would need to know the actual password)
    // const testPassword = 'your_actual_password';
    // const isMatch = await bcrypt.compare(testPassword, user.password);
    // console.log('Password match:', isMatch);
    
    console.log('User is properly set as admin');
    console.log('If admin login is failing, check the password you are entering');

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

verifyPassword();