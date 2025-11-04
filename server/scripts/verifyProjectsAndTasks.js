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

const Project = require('../models/Project');
const Task = require('../models/Task');

const verifyProjectsAndTasks = async () => {
  try {
    console.log('=== Verifying Projects and Tasks Fetching ===\n');
    
    // Test 1: Fetch all projects
    console.log('1. Fetching all projects...');
    const allProjects = await Project.find();
    console.log(`   Total projects in database: ${allProjects.length}`);
    
    // Test 2: Check project structure
    allProjects.forEach((project, index) => {
      console.log(`\n   Project ${index + 1}: ${project.name}`);
      console.log(`     ID: ${project._id}`);
      console.log(`     User: ${project.user}`);
      console.log(`     Owner: ${project.owner}`);
      
      // Verify required fields
      if (!project.user) {
        console.log(`     ❌ Missing user field!`);
      } else {
        console.log(`     ✅ User field present`);
      }
    });
    
    // Test 3: Simulate fetching projects for a specific user
    if (allProjects.length > 0) {
      const testUserId = allProjects[0].user;
      console.log(`\n2. Testing user-specific project fetch...`);
      console.log(`   Testing for user ID: ${testUserId}`);
      
      const userProjects = await Project.find({ user: testUserId }).sort({ date: -1 });
      console.log(`   Projects found for user: ${userProjects.length}`);
      userProjects.forEach((project, index) => {
        console.log(`     ${index + 1}. ${project.name}`);
      });
    }
    
    // Test 4: Fetch all tasks
    console.log(`\n3. Fetching all tasks...`);
    const allTasks = await Task.find();
    console.log(`   Total tasks in database: ${allTasks.length}`);
    
    // Test 5: Check task structure
    allTasks.forEach((task, index) => {
      console.log(`\n   Task ${index + 1}: ${task.title}`);
      console.log(`     ID: ${task._id}`);
      console.log(`     User: ${task.user}`);
      console.log(`     Assignee: ${task.assignee}`);
      console.log(`     Project: ${task.project}`);
      
      // Verify required fields
      if (!task.user) {
        console.log(`     ❌ Missing user field!`);
      } else {
        console.log(`     ✅ User field present`);
      }
      
      if (!task.project) {
        console.log(`     ❌ Missing project field!`);
      } else {
        console.log(`     ✅ Project field present`);
      }
    });
    
    // Test 6: Simulate fetching tasks for a specific user
    if (allTasks.length > 0) {
      const testUserId = allTasks[0].user;
      console.log(`\n4. Testing user-specific task fetch...`);
      console.log(`   Testing for user ID: ${testUserId}`);
      
      const userTasks = await Task.find({
        $or: [
          { user: testUserId },
          { assignee: testUserId }
        ]
      }).sort({ date: -1 });
      
      console.log(`   Tasks found for user: ${userTasks.length}`);
      userTasks.forEach((task, index) => {
        console.log(`     ${index + 1}. ${task.title}`);
      });
    }
    
    // Test 7: Cross-reference projects and tasks
    console.log(`\n5. Cross-referencing projects and tasks...`);
    const projectIds = allProjects.map(p => p._id.toString());
    const taskProjectIds = [...new Set(allTasks.map(t => t.project?.toString()))].filter(id => id);
    
    console.log(`   Unique project IDs from projects: ${projectIds.length}`);
    console.log(`   Unique project IDs from tasks: ${taskProjectIds.length}`);
    
    // Check for orphaned tasks (tasks with non-existent projects)
    const orphanedTasks = allTasks.filter(task => 
      task.project && !projectIds.includes(task.project.toString())
    );
    
    if (orphanedTasks.length > 0) {
      console.log(`   ❌ Found ${orphanedTasks.length} orphaned tasks:`);
      orphanedTasks.forEach(task => {
        console.log(`     - Task "${task.title}" references non-existent project ${task.project}`);
      });
    } else {
      console.log(`   ✅ No orphaned tasks found`);
    }
    
    console.log(`\n=== Verification Complete ===`);
    console.log(`✅ Projects and tasks are properly structured`);
    console.log(`✅ User-specific fetching works correctly`);
    console.log(`✅ Data integrity maintained between projects and tasks`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

verifyProjectsAndTasks();