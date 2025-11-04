require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

const verifyProjectOwnership = async () => {
  try {
    console.log('Verifying project ownership...\n');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user._id}`);
    });
    
    // Check projects
    const allProjects = await Project.find({});
    console.log(`\nTotal projects in database: ${allProjects.length}`);
    
    if (allProjects.length > 0) {
      console.log('\nProject details:');
      for (let i = 0; i < allProjects.length; i++) {
        const project = allProjects[i];
        console.log(`${i + 1}. ${project.name} (ID: ${project._id})`);
        console.log(`   User: ${project.user}`);
        console.log(`   Owner: ${project.owner}`);
        
        // Find the user who owns this project
        const projectUser = await User.findById(project.user);
        if (projectUser) {
          console.log(`   User Name: ${projectUser.name}`);
          
          // Generate a token for this user
          const payload = {
            user: {
              id: projectUser.id
            }
          };
          
          const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
            expiresIn: 360000
          });
          
          console.log(`   Test Token: ${token}`);
        } else {
          console.log(`   User not found!`);
        }
        console.log('');
      }
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

verifyProjectOwnership();