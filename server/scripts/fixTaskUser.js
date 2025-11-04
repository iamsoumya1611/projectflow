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

const fixTaskUser = async () => {
  try {
    console.log('Fixing tasks with missing user field...');
    
    // Find tasks with missing user field using Mongoose
    const tasks = await Task.find({ user: { $exists: false } });
    console.log(`Found ${tasks.length} tasks with missing user field`);
    
    for (const task of tasks) {
      console.log(`Fixing task: ${task.title}`);
      console.log(`  Current user field: ${task.user}`);
      console.log(`  Current assignee field: ${task.assignee}`);
      
      // If assignee exists, set user to assignee
      if (task.assignee) {
        // Directly set the user field and save
        task.user = task.assignee;
        await task.save();
        console.log(`  Updated user field to: ${task.user}`);
      } else {
        // If no assignee, we need to determine who should own this task
        console.log(`  Task has no assignee, cannot fix automatically`);
        continue;
      }
    }
    
    console.log('Task fixing completed');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

fixTaskUser();