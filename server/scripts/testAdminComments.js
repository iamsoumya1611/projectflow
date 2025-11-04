require('dotenv').config();
const mongoose = require('mongoose');

// Import models
require('../models/User');
require('../models/Project');
require('../models/Task');

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const testAdminComments = async () => {
  try {
    console.log('Testing admin comment functionality...\n');
    
    // Find an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found admin user: ${adminUser.name} (${adminUser.email}) - ID: ${adminUser._id}`);
    
    // Find a project owned by this user
    const project = await Project.findOne({ user: adminUser._id });
    if (!project) {
      console.log('No project found for this user.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found project: ${project.name} (ID: ${project._id})`);
    
    // Check if project has comments
    console.log(`Project comments count: ${project.comments ? project.comments.length : 0}`);
    
    // Find a task
    const task = await Task.findOne();
    if (!task) {
      console.log('No task found.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found task: ${task.title} (ID: ${task._id})`);
    
    // Check if task has comments
    console.log(`Task comments count: ${task.comments ? task.comments.length : 0}`);
    
    // Fetch all projects with comments populated
    console.log('\nFetching all projects with comments...');
    const projectsWithComments = await Project.find().populate('comments.user', ['name']);
    
    let totalProjectComments = 0;
    projectsWithComments.forEach(proj => {
      if (proj.comments) {
        totalProjectComments += proj.comments.length;
      }
    });
    
    console.log(`Total projects with comments: ${projectsWithComments.length}`);
    console.log(`Total project comments: ${totalProjectComments}`);
    
    // Fetch all tasks with comments populated
    console.log('\nFetching all tasks with comments...');
    const tasksWithComments = await Task.find().populate('comments.user', ['name']);
    
    let totalTaskComments = 0;
    tasksWithComments.forEach(task => {
      if (task.comments) {
        totalTaskComments += task.comments.length;
      }
    });
    
    console.log(`Total tasks with comments: ${tasksWithComments.length}`);
    console.log(`Total task comments: ${totalTaskComments}`);
    
    console.log('\n✅ Admin comment functionality test completed!');
    console.log(`Total comments in system: ${totalProjectComments + totalTaskComments}`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

testAdminComments();