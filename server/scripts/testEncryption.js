require('dotenv').config();
const mongoose = require('mongoose');
const { encryptMessage, decryptMessage } = require('../utils/encryption');

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

const testEncryption = async () => {
  try {
    console.log('Testing encryption functionality...\n');
    
    // Test encryption/decryption
    const originalText = "This is a secret message for testing encryption";
    console.log(`Original text: ${originalText}`);
    
    // Encrypt the message
    const encryptedText = encryptMessage(originalText);
    console.log(`Encrypted text: ${encryptedText}`);
    
    // Decrypt the message
    const decryptedText = decryptMessage(encryptedText);
    console.log(`Decrypted text: ${decryptedText}`);
    
    // Verify they match
    if (originalText === decryptedText) {
      console.log('✅ Encryption/Decryption test PASSED');
    } else {
      console.log('❌ Encryption/Decryption test FAILED');
    }
    
    // Find a user
    const user = await User.findOne();
    if (!user) {
      console.log('No user found.');
      mongoose.connection.close();
      return;
    }
    
    console.log(`\nFound user: ${user.name} (${user.email}) - ID: ${user._id}`);
    
    // Get other users as recipients
    const users = await User.find({ _id: { $ne: user._id } }, '_id');
    const recipientIds = users.map(u => u._id);
    console.log(`Found ${recipientIds.length} recipient(s)`);
    
    // Create an encrypted message
    console.log('\nCreating an encrypted message...');
    const testMessage = new Message({
      text: originalText,
      encryptedText: encryptedText,
      user: user._id,
      isEncrypted: true,
      recipients: recipientIds,
      readBy: [user._id] // Sender has read their own message
    });
    
    const savedMessage = await testMessage.save();
    console.log(`✅ Encrypted message created (ID: ${savedMessage._id})`);
    
    // Populate the message with user info
    await savedMessage.populate('user', ['name']);
    console.log(`✅ Message populated with user: ${savedMessage.user.name}`);
    
    // Fetch and decrypt the message
    console.log('\nFetching and decrypting the message...');
    const fetchedMessage = await Message.findById(savedMessage._id).populate('user', ['name']);
    
    if (fetchedMessage.isEncrypted && fetchedMessage.encryptedText) {
      const decryptedFetchedText = decryptMessage(fetchedMessage.encryptedText);
      console.log(`Decrypted fetched message: ${decryptedFetchedText}`);
      
      if (originalText === decryptedFetchedText) {
        console.log('✅ Database encryption/decryption test PASSED');
      } else {
        console.log('❌ Database encryption/decryption test FAILED');
      }
    }
    
    console.log('\n✅ Encryption functionality test completed!');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
};

testEncryption();