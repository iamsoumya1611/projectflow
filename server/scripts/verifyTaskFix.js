require('dotenv').config();
const { MongoClient } = require('mongodb');

const verifyTaskFix = async () => {
  try {
    console.log('Verifying task fix using native MongoDB driver...');
    
    // Connect to database
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const tasksCollection = db.collection('tasks');
    
    // Find all tasks
    const tasks = await tasksCollection.find({}).toArray();
    console.log(`Found ${tasks.length} tasks`);
    
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title}`);
      console.log(`   User: ${task.user}`);
      console.log(`   Assignee: ${task.assignee}`);
      console.log('---');
    });
    
    await client.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
};

verifyTaskFix();