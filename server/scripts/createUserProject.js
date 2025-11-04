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

const createUserProject = async () => {
  try {
    console.log('Creating project for regular user...\n');
    
    // Find the regular user
    const regularUser = await User.findOne({ role: 'user' });
    if (!regularUser) {
      console.log('No regular user found.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found regular user: ${regularUser.name} (${regularUser.email}) - ID: ${regularUser._id}`);
    
    // Check if user already has projects
    const existingProjects = await Project.find({ user: regularUser._id });
    if (existingProjects.length > 0) {
      console.log(`User already has ${existingProjects.length} project(s).`);
      mongoose.connection.close();
      return;
    }
    
    // Create a new project for the regular user
    const newProject = new Project({
      name: 'Sample Project',
      description: 'This is a sample project created for testing purposes.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      user: regularUser._id,
      owner: regularUser._id,
      status: 'in_progress',
      priority: 'medium'
    });
    
    const savedProject = await newProject.save();
    console.log(`\n✅ Project created successfully!`);
    console.log(`Project Name: ${savedProject.name}`);
    console.log(`Project ID: ${savedProject._id}`);
    console.log(`Project Owner: ${savedProject.owner}`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

createUserProject();