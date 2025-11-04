require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

const testAdminRoutes = async () => {
  try {
    console.log('Testing admin routes...\n');
    
    // Find an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found admin user: ${adminUser.name} (${adminUser.email})`);
    
    // Generate a token for the admin user
    const payload = {
      user: {
        id: adminUser.id
      }
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: 360000
    });
    
    console.log(`Generated token: ${token}\n`);
    
    // Test creating a project
    console.log('Testing project creation...');
    const newProject = new Project({
      name: 'Test Project',
      description: 'Test project for admin routes',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      user: adminUser.id,
      owner: adminUser.id
    });
    
    const savedProject = await newProject.save();
    console.log(`Project created successfully: ${savedProject.name} (ID: ${savedProject._id})\n`);
    
    // Test fetching all projects
    console.log('Testing fetching all projects...');
    const allProjects = await Project.find();
    console.log(`Found ${allProjects.length} projects\n`);
    
    // Test fetching the specific project
    console.log('Testing fetching specific project...');
    const fetchedProject = await Project.findById(savedProject._id);
    console.log(`Fetched project: ${fetchedProject.name}\n`);
    
    // Test updating the project
    console.log('Testing project update...');
    const updatedProject = await Project.findByIdAndUpdate(
      savedProject._id,
      { $set: { name: 'Updated Test Project' } },
      { new: true }
    );
    console.log(`Project updated: ${updatedProject.name}\n`);
    
    // Test deleting the project
    console.log('Testing project deletion...');
    await Project.findByIdAndRemove(savedProject._id);
    console.log('Project deleted successfully\n');
    
    console.log('✅ All admin route tests passed!');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

testAdminRoutes();