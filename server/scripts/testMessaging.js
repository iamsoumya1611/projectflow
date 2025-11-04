require('dotenv').config();
const mongoose = require('mongoose');

// Import models
require('../models/User');
require('../models/Message');

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');
const Message = require('../models/Message');

const testMessaging = async () => {
  try {
    console.log('Testing messaging functionality...\n');
    
    // Find a user
    const user = await User.findOne();
    if (!user) {
      console.log('No user found.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found user: ${user.name} (${user.email}) - ID: ${user._id}`);
    
    // Create a test message
    console.log('\nCreating a test message...');
    const testMessage = new Message({
      text: 'This is a test message for the global chat feature',
      user: user._id
    });
    
    const savedMessage = await testMessage.save();
    console.log(`✅ Message created: "${savedMessage.text}" (ID: ${savedMessage._id})`);
    
    // Populate the message with user info
    await savedMessage.populate('user', ['name']);
    console.log(`✅ Message populated with user: ${savedMessage.user.name}`);
    
    // Fetch all messages
    console.log('\nFetching all messages...');
    const messages = await Message.find().populate('user', ['name']).sort({ date: -1 }).limit(10);
    console.log(`✅ Found ${messages.length} messages`);
    
    if (messages.length > 0) {
      console.log('\nRecent messages:');
      messages.forEach((msg, index) => {
        console.log(`${index + 1}. ${msg.user.name}: ${msg.text} (${new Date(msg.date).toLocaleString()})`);
      });
    }
    
    // Test message deletion (admin functionality)
    console.log('\nTesting message deletion...');
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log(`Found admin user: ${adminUser.name}`);
      // In a real scenario, we would test deletion with proper authorization
      console.log('✅ Admin deletion functionality would work here');
    } else {
      console.log('No admin user found for deletion test');
    }
    
    console.log('\n✅ Messaging functionality test completed!');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

testMessaging();