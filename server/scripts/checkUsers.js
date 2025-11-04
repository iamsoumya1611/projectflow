const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load environment variables
require('dotenv').config();

const checkUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get all users
    const users = await User.find().select('-password');
    
    console.log('Existing users in database:');
    console.log('============================');
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   ID: ${user._id}`);
        console.log('------------------------');
      });
    }

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

checkUsers();