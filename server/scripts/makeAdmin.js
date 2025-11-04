const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load environment variables
require('dotenv').config();

const makeAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Find the user by email
    const user = await User.findOne({ email: 'soumyamajumder201817@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log(`User ${user.name} (${user.email}) has been made an admin`);
    console.log('You can now login as admin');

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

makeAdmin();