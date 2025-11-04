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

const verifyTaskFetch = async () => {
  try {
    console.log('Verifying task fetch functionality...');
    
    // Test 1: Fetch all tasks
    const allTasks = await Task.find();
    console.log(`Total tasks in database: ${allTasks.length}`);
    
    // Test 2: Check if tasks have the required fields
    allTasks.forEach((task, index) => {
      console.log(`\nTask ${index + 1}: ${task.title}`);
      console.log(`  ID: ${task._id}`);
      console.log(`  User: ${task.user}`);
      console.log(`  Assignee: ${task.assignee}`);
      console.log(`  Project: ${task.project}`);
      
      // Verify required fields are present
      if (!task.user) {
        console.log(`  ❌ Missing user field!`);
      } else {
        console.log(`  ✅ User field present`);
      }
      
      if (!task.project) {
        console.log(`  ❌ Missing project field!`);
      } else {
        console.log(`  ✅ Project field present`);
      }
    });
    
    // Test 3: Simulate fetching tasks for a specific user
    if (allTasks.length > 0) {
      const testUserId = allTasks[0].user;
      console.log(`\n--- Testing user-specific task fetch ---`);
      console.log(`Testing for user ID: ${testUserId}`);
      
      const userTasks = await Task.find({
        $or: [
          { user: testUserId },
          { assignee: testUserId }
        ]
      }).sort({ date: -1 });
      
      console.log(`Tasks found for user: ${userTasks.length}`);
      userTasks.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.title}`);
      });
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

verifyTaskFetch();