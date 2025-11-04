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

const debugTask = async () => {
  try {
    console.log('Debugging task details...');
    
    // Get raw task data to see actual field values
    console.log('\nRaw task data:');
    const rawTasks = await Task.find();
    rawTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title}`);
      console.log(`   User: ${task.user}`);
      console.log(`   Assignee: ${task.assignee}`);
      console.log('---');
    });
    
    // Get all users
    const users = await User.find({}, 'name email _id');
    console.log('\nUsers:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user._id}`);
    });
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

debugTask();