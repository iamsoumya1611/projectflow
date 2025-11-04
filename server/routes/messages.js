const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');
const { encryptMessage, decryptMessage } = require('../utils/encryption');

const router = express.Router();

// @route    GET api/messages
// @desc     Get all messages (global chat)
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('user', ['name'])
      .sort({ date: -1 })
      .limit(50); // Limit to last 50 messages
    
    // Decrypt messages if they are encrypted and mark as read
    const decryptedMessages = messages.map(msg => {
      // Mark message as read by current user
      if (!msg.readBy.includes(req.user.id)) {
        msg.readBy.push(req.user.id);
      }
      
      if (msg.isEncrypted && msg.encryptedText) {
        const decryptedText = decryptMessage(msg.encryptedText);
        return {
          ...msg.toObject(),
          text: decryptedText || msg.text // Fallback to original text if decryption fails
        };
      }
      return msg;
    });
    
    // Save the updated read status
    await Promise.all(messages.map(msg => msg.save()));
    
    res.json(decryptedMessages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/messages/unread
// @desc     Get unread message count for current user
// @access   Private
router.get('/unread', auth, async (req, res) => {
  try {
    // Get messages where the current user is a recipient and hasn't read it
    const count = await Message.countDocuments({
      recipients: req.user.id,
      readBy: { $ne: req.user.id }
    });
    
    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/messages
// @desc     Send a message
// @access   Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Get all users except the sender
      const users = await User.find({ _id: { $ne: req.user.id } }, '_id');
      const recipientIds = users.map(user => user._id);
      
      // Encrypt the message
      const encryptedText = encryptMessage(req.body.text);
      
      const newMessage = new Message({
        text: req.body.text,
        encryptedText: encryptedText,
        user: req.user.id,
        isEncrypted: true,
        recipients: recipientIds,
        readBy: [req.user.id] // Sender has read their own message
      });

      const message = await newMessage.save();
      
      // Populate user info
      await message.populate('user', ['name']);
      
      // Emit socket event for real-time notification
      const io = req.app.get('io');
      if (io) {
        // Notify all recipients except the sender
        recipientIds.forEach(recipientId => {
          io.to(recipientId.toString()).emit('newNotification', {
            ...message.toObject(),
            text: req.body.text // Send decrypted text for real-time display
          });
        });
        
        // Also emit to global chat room for real-time display
        io.to('globalChat').emit('messageReceived', {
          ...message.toObject(),
          text: req.body.text
        });
      }
      
      res.json(message);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    PUT api/messages/:id/read
// @desc     Mark message as read
// @access   Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }
    
    // Check if user is a recipient
    if (!message.recipients.includes(req.user.id)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Add user to readBy array if not already there
    if (!message.readBy.includes(req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();
    }
    
    res.json({ msg: 'Message marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE api/messages/:id
// @desc     Delete a message (admin or message owner only)
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Check if user is admin or owns the message
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && message.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Message.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Message removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;