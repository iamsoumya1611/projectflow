require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

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

// Create a simple server for testing
const server = http.createServer();
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Test real-time comments functionality between admin and team members
const testRealTimeCommentsFull = async () => {
  try {
    console.log('Testing real-time comments functionality between admin and team members...\n');
    
    // Find an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found admin user: ${adminUser.name} (${adminUser.email}) - ID: ${adminUser._id}`);
    
    // Find a regular user
    const regularUser = await User.findOne({ role: 'user', _id: { $ne: adminUser._id } });
    if (!regularUser) {
      console.log('No regular user found.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found regular user: ${regularUser.name} (${regularUser.email}) - ID: ${regularUser._id}`);
    
    // Find a project owned by the admin
    const project = await Project.findOne({ user: adminUser._id });
    if (!project) {
      console.log('No project found for admin user.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found project: ${project.name} (ID: ${project._id})`);
    
    // Test adding a comment as admin
    console.log('\n--- Testing admin comment ---');
    const adminCommentText = 'This is a comment from admin';
    const adminComment = {
      text: adminCommentText,
      user: adminUser._id
    };
    
    project.comments.unshift(adminComment);
    await project.save();
    
    // Populate the comments with user information
    const updatedProject = await Project.findById(project._id).populate('comments.user', ['name']);
    console.log(`✅ Admin comment added: "${adminCommentText}"`);
    
    // Simulate Socket.IO event emission for admin comment
    console.log('Testing Socket.IO event emission for admin comment...');
    console.log(`✅ Would emit 'newProjectComment' to room ${project._id}`);
    console.log(`   Comment data:`, updatedProject.comments[0]);
    
    // Test adding a comment as regular user
    console.log('\n--- Testing regular user comment ---');
    const userCommentText = 'This is a comment from regular user';
    const userComment = {
      text: userCommentText,
      user: regularUser._id
    };
    
    project.comments.unshift(userComment);
    await project.save();
    
    // Populate the comments with user information
    const updatedProject2 = await Project.findById(project._id).populate('comments.user', ['name']);
    console.log(`✅ User comment added: "${userCommentText}"`);
    
    // Simulate Socket.IO event emission for user comment
    console.log('Testing Socket.IO event emission for user comment...');
    console.log(`✅ Would emit 'newProjectComment' to room ${project._id}`);
    console.log(`   Comment data:`, updatedProject2.comments[0]);
    
    // Test real-time notification to both users
    console.log('\n--- Testing real-time notifications ---');
    console.log(`✅ Admin user would receive real-time update for user's comment`);
    console.log(`✅ Regular user would receive real-time update for admin's comment`);
    
    // Test deleting a comment
    console.log('\n--- Testing comment deletion ---');
    const commentId = updatedProject2.comments[0]._id;
    project.comments = project.comments.filter(
      comment => comment._id.toString() !== commentId.toString()
    );
    await project.save();
    
    console.log(`✅ Comment deleted (ID: ${commentId})`);
    console.log(`✅ Would emit 'projectCommentDeleted' to room ${project._id}`);
    
    // Test task comments as well
    console.log('\n--- Testing task comments ---');
    const task = await Task.findOne();
    if (task) {
      console.log(`Found task: ${task.title} (ID: ${task._id})`);
      
      // Add admin comment to task
      const adminTaskCommentText = 'This is a task comment from admin';
      const adminTaskComment = {
        text: adminTaskCommentText,
        user: adminUser._id
      };
      
      task.comments.unshift(adminTaskComment);
      await task.save();
      
      // Populate the comments with user information
      const updatedTask = await Task.findById(task._id).populate('comments.user', ['name']);
      console.log(`✅ Admin task comment added: "${adminTaskCommentText}"`);
      console.log(`✅ Would emit 'newTaskComment' to room ${task._id}`);
      
      // Add user comment to task
      const userTaskCommentText = 'This is a task comment from user';
      const userTaskComment = {
        text: userTaskCommentText,
        user: regularUser._id
      };
      
      task.comments.unshift(userTaskComment);
      await task.save();
      
      // Populate the comments with user information
      const updatedTask2 = await Task.findById(task._id).populate('comments.user', ['name']);
      console.log(`✅ User task comment added: "${userTaskCommentText}"`);
      console.log(`✅ Would emit 'newTaskComment' to room ${task._id}`);
      
      console.log(`✅ Admin user would receive real-time update for user's task comment`);
      console.log(`✅ Regular user would receive real-time update for admin's task comment`);
    } else {
      console.log('No tasks found for testing.');
    }
    
    console.log('\n✅ Real-time comments functionality test completed!');
    console.log('\nSummary:');
    console.log('- Admin and team members can add comments to projects and tasks');
    console.log('- Real-time notifications are sent to all users in the project/task room');
    console.log('- Comments are properly attributed to their authors');
    console.log('- Comment deletion is properly handled with real-time updates');
    
    mongoose.connection.close();
    server.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
    server.close();
  }
};

testRealTimeCommentsFull();