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

// Store io instance for routes to access
const app = { get: (key) => io };

const testRealTimeComments = async () => {
  try {
    console.log('Testing real-time comment functionality...\n');
    
    // Find a regular user
    const regularUser = await User.findOne({ role: 'user' });
    if (!regularUser) {
      console.log('No regular user found.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found regular user: ${regularUser.name} (${regularUser.email}) - ID: ${regularUser._id}`);
    
    // Find a project owned by this user
    const project = await Project.findOne({ user: regularUser._id });
    if (!project) {
      console.log('No project found for this user.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found project: ${project.name} (ID: ${project._id})\n`);
    
    // Simulate adding a comment to the project
    console.log('Testing adding a comment to project...');
    const commentText = 'This is a real-time test comment';
    const newComment = {
      text: commentText,
      user: regularUser._id
    };
    
    project.comments.unshift(newComment);
    await project.save();
    
    // Populate the comments with user information
    const updatedProject = await Project.findById(project._id).populate('comments.user', ['name']);
    console.log(`✅ Comment added: "${commentText}"\n`);
    
    // Simulate Socket.IO event emission
    console.log('Testing Socket.IO event emission...');
    console.log(`✅ Would emit 'newProjectComment' to room ${project._id}`);
    console.log(`   Comment data:`, updatedProject.comments[0]);
    
    // Test deleting the comment
    console.log('\nTesting deleting a comment...');
    const commentId = updatedProject.comments[0]._id;
    project.comments = project.comments.filter(
      comment => comment._id.toString() !== commentId.toString()
    );
    await project.save();
    
    console.log(`✅ Comment deleted (ID: ${commentId})`);
    console.log(`✅ Would emit 'projectCommentDeleted' to room ${project._id}`);
    
    // Clean up
    console.log('\n✅ Real-time comment functionality test completed!');
    
    mongoose.connection.close();
    server.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
    server.close();
  }
};

testRealTimeComments();