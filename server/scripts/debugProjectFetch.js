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

const debugProjectFetch = async () => {
  try {
    console.log('Debugging project fetch...\n');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Check if there are any projects
    const allProjects = await Project.find({});
    console.log(`\nTotal projects in database: ${allProjects.length}`);
    
    if (allProjects.length > 0) {
      console.log('\nProject details:');
      allProjects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name} (ID: ${project._id})`);
        console.log(`   User: ${project.user}`);
        console.log(`   Owner: ${project.owner}`);
      });
    }
    
    // Check for projects with missing user fields
    const projectsWithoutUser = await Project.find({ user: { $exists: false } });
    if (projectsWithoutUser.length > 0) {
      console.log(`\n⚠️  Found ${projectsWithoutUser.length} projects with missing user field:`);
      projectsWithoutUser.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.name} (ID: ${project._id})`);
      });
    } else {
      console.log('\n✅ All projects have user fields');
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

debugProjectFetch();