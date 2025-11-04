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
const Project = require('../models/Project');

const checkTasks = async () => {
  try {
    console.log('Checking tasks in database...');
    
    // Count total tasks
    const taskCount = await Task.countDocuments();
    console.log(`Total tasks in database: ${taskCount}`);
    
    // Get all tasks with populated data
    const tasks = await Task.find()
      .populate('project', ['name'])
      .populate('assignee', ['name'])
      .populate('user', ['name']);
    
    console.log('Tasks:');
    tasks.forEach(task => {
      console.log(`- ${task.title} (Project: ${task.project?.name || 'N/A'}, Assignee: ${task.assignee?.name || 'Unassigned'}, Owner: ${task.user?.name || 'N/A'})`);
    });
    
    // Count users
    const userCount = await User.countDocuments();
    console.log(`\nTotal users in database: ${userCount}`);
    
    // Get all users
    const users = await User.find({}, 'name email role');
    console.log('Users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

checkTasks();