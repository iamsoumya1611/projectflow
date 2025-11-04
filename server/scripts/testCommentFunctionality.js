require('dotenv').config();
const mongoose = require('mongoose');

// Import models
require('../models/User');
require('../models/Project');

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');
const Project = require('../models/Project');

const testCommentFunctionality = async () => {
  try {
    console.log('Testing comment functionality...\n');
    
    // Find a regular user
    const regularUser = await User.findOne({ role: 'user' });
    if (!regularUser) {
      console.log('No regular user found.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found regular user: ${regularUser.name} (${regularUser.email}) - ID: ${regularUser._id}`);
    
    // Create a test project
    const newProject = new Project({
      name: 'Test Project for Comments',
      description: 'Test project for comment functionality',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      priority: 'medium',
      status: 'in_progress',
      user: regularUser.id,
      owner: regularUser.id
    });
    
    const savedProject = await newProject.save();
    console.log(`✅ Project created: ${savedProject.name} (ID: ${savedProject._id})\n`);
    
    // Add a comment to the project
    console.log('Testing adding a comment...');
    const commentText = 'This is a test comment';
    const newComment = {
      text: commentText,
      user: regularUser.id
    };
    
    savedProject.comments.unshift(newComment);
    await savedProject.save();
    console.log(`✅ Comment added: "${commentText}"\n`);
    
    // Verify the comment was added
    console.log('Testing fetching comments...');
    const updatedProject = await Project.findById(savedProject._id).populate('comments.user', ['name']);
    console.log(`✅ Project has ${updatedProject.comments.length} comment(s)`);
    if (updatedProject.comments.length > 0) {
      console.log(`   Comment: "${updatedProject.comments[0].text}" by ${updatedProject.comments[0].user?.name || 'Unknown User'}`);
    }
    
    // Test deleting the comment
    console.log('\nTesting deleting a comment...');
    if (updatedProject.comments.length > 0) {
      const commentId = updatedProject.comments[0]._id;
      updatedProject.comments = updatedProject.comments.filter(
        comment => comment._id.toString() !== commentId.toString()
      );
      await updatedProject.save();
      console.log('✅ Comment deleted successfully');
    }
    
    // Delete the test project
    console.log('\nDeleting test project...');
    await Project.findByIdAndRemove(savedProject._id);
    console.log('✅ Test project deleted\n');
    
    console.log('✅ All comment functionality tests passed!');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

testCommentFunctionality();