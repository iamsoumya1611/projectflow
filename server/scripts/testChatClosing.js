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

const testChatClosing = async () => {
  try {
    console.log('Testing chat closing functionality...\n');
    
    // Find a user
    const user = await User.findOne();
    if (!user) {
      console.log('No user found.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`Found user: ${user.name} (${user.email}) - ID: ${user._id}`);
    
    // Get other users as recipients
    const users = await User.find({ _id: { $ne: user._id } }, '_id');
    const recipientIds = users.map(u => u._id);
    console.log(`Found ${recipientIds.length} recipient(s)`);
    
    // Create a test message
    console.log('\nCreating a test message...');
    const testMessage = new Message({
      text: 'Test message for chat closing functionality',
      user: user._id,
      recipients: recipientIds,
      readBy: [] // No one has read it yet
    });
    
    const savedMessage = await testMessage.save();
    console.log(`✅ Test message created (ID: ${savedMessage._id})`);
    
    // Check unread count for a recipient
    console.log('\nChecking unread count for recipient...');
    const recipient = await User.findById(recipientIds[0]);
    if (recipient) {
      const unreadCount = await Message.countDocuments({
        recipients: recipient._id,
        readBy: { $ne: recipient._id }
      });
      console.log(`Unread count for ${recipient.name}: ${unreadCount}`);
    }
    
    // Mark message as read
    console.log('\nMarking message as read...');
    savedMessage.readBy.push(recipientIds[0]);
    await savedMessage.save();
    console.log('✅ Message marked as read');
    
    // Check unread count again
    console.log('\nChecking unread count after marking as read...');
    if (recipient) {
      const unreadCount = await Message.countDocuments({
        recipients: recipient._id,
        readBy: { $ne: recipient._id }
      });
      console.log(`Unread count for ${recipient.name}: ${unreadCount}`);
    }
    
    console.log('\n✅ Chat closing functionality test completed!');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

testChatClosing();