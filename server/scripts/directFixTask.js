require('dotenv').config();
const mongoose = require('mongoose');

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const directFixTask = async () => {
  try {
    console.log('Directly fixing tasks with missing user field...');
    
    // Get the tasks collection directly
    const tasksCollection = mongoose.connection.collection('tasks');
    
    // Find tasks with missing user field
    const tasks = await tasksCollection.find({ user: { $exists: false } }).toArray();
    console.log(`Found ${tasks.length} tasks with missing user field`);
    
    for (const task of tasks) {
      console.log(`Fixing task: ${task.title}`);
      console.log(`  Current assignee field: ${task.assignee}`);
      
      // If assignee exists, set user to assignee
      if (task.assignee) {
        // Update the task directly
        const result = await tasksCollection.updateOne(
          { _id: task._id },
          { $set: { user: task.assignee } }
        );
        console.log(`  Updated ${result.modifiedCount} task(s)`);
      } else {
        console.log(`  Task has no assignee, cannot fix automatically`);
        continue;
      }
    }
    
    console.log('Task fixing completed');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

directFixTask();