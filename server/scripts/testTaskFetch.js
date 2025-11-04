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
const User = require('../models/User');

const testTaskFetch = async () => {
  try {
    console.log('Testing task fetch from database...');
    
    // Count total tasks
    const taskCount = await Task.countDocuments();
    console.log(`Total tasks in database: ${taskCount}`);
    
    // Get all tasks
    const tasks = await Task.find();
    console.log('All tasks:');
    tasks.forEach(task => {
      console.log(`- ${task.title} (User: ${task.user}, Assignee: ${task.assignee})`);
    });
    
    // Try to find a specific user's tasks
    const users = await User.find();
    if (users.length > 0) {
      console.log('\nUsers found:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ID: ${user._id}`);
      });
      
      // Try to find tasks for the first user
      const userTasks = await Task.find({
        $or: [
          { user: users[0]._id },
          { assignee: users[0]._id }
        ]
      });
      console.log(`\nTasks for user ${users[0].name}:`, userTasks.length);
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

testTaskFetch();