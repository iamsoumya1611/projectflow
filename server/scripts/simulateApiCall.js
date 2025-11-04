require('dotenv').config();
const mongoose = require('mongoose');

// Import all models to register them
require('../models/User');
require('../models/Project');
require('../models/Task');

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Task = require('../models/Task');

const simulateApiCall = async () => {
  try {
    console.log('Simulating API call to fetch tasks...');
    
    // Simulate a user ID (using the one from our test task)
    const userId = '6904fa792c4cbde04790c50d';
    console.log(`Simulating request for user ID: ${userId}`);
    
    // This is the exact query used in the API route
    const tasks = await Task.find({
      $or: [
        { user: userId },
        { assignee: userId }
      ]
    }).sort({ date: -1 });
    
    console.log(`\nTasks found: ${tasks.length}`);
    
    // Display task details
    tasks.forEach((task, index) => {
      console.log(`\nTask ${index + 1}:`);
      console.log(`  Title: ${task.title}`);
      console.log(`  ID: ${task._id}`);
      console.log(`  User ID: ${task.user}`);
      console.log(`  Assignee ID: ${task.assignee}`);
      console.log(`  Project ID: ${task.project}`);
      console.log(`  Description: ${task.description || 'No description'}`);
      console.log(`  Status: ${task.status}`);
      console.log(`  Priority: ${task.priority}`);
    });
    
    console.log('\n✅ API call simulation successful!');
    console.log('✅ Tasks would be returned to the frontend');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

simulateApiCall();