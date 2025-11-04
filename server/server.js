const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Init middleware
app.use(express.json({ extended: false }));

// Enable CORS for development
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: "*",
    credentials: true
  }));
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Store io instance in app locals so routes can access it
app.set('io', io);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ msg: 'Server is running' });
});

// Define routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/profile', require('./routes/profiles'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a project room
  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
    console.log(`Client ${socket.id} joined project room ${projectId}`);
  });

  // Join a task room
  socket.on('joinTask', (taskId) => {
    socket.join(taskId);
    console.log(`Client ${socket.id} joined task room ${taskId}`);
  });

  // Join user-specific room for notifications
  socket.on('joinUserRoom', (userId) => {
    socket.join(userId);
    console.log(`Client ${socket.id} joined user room ${userId}`);
  });

  // Join global chat room
  socket.on('joinGlobalChat', () => {
    socket.join('globalChat');
    console.log(`Client ${socket.id} joined global chat room`);
  });

  // Handle new project comment
  socket.on('projectComment', (data) => {
    // Broadcast to all clients in the project room except sender
    socket.to(data.projectId).emit('newProjectComment', data);
  });

  // Handle new task comment
  socket.on('taskComment', (data) => {
    // Broadcast to all clients in the task room except sender
    socket.to(data.taskId).emit('newTaskComment', data);
  });

  // Handle project comment deletion
  socket.on('deleteProjectComment', (data) => {
    // Broadcast to all clients in the project room except sender
    socket.to(data.projectId).emit('projectCommentDeleted', data);
  });

  // Handle task comment deletion
  socket.on('deleteTaskComment', (data) => {
    // Broadcast to all clients in the task room except sender
    socket.to(data.taskId).emit('taskCommentDeleted', data);
  });

  // Handle new global message
  socket.on('newMessage', async (data) => {
    try {
      // If this is a direct socket message, we need to save it to the database
      // and then broadcast it properly
      const Message = require('./models/Message');
      const User = require('./models/User');
      
      // Get all users except the sender
      const users = await User.find({ _id: { $ne: data.user._id } }, '_id');
      const recipientIds = users.map(user => user._id);
      
      const newMessage = new Message({
        text: data.text,
        user: data.user._id,
        isEncrypted: false,
        recipients: recipientIds,
        readBy: [data.user._id] // Sender has read their own message
      });

      const message = await newMessage.save();
      
      // Populate user info
      await message.populate('user', ['name']);
      
      // Broadcast to all clients in the global chat room except sender
      socket.to('globalChat').emit('messageReceived', {
        ...message.toObject(),
        text: data.text
      });
    } catch (err) {
      console.error('Error handling direct socket message:', err);
    }
  });

  // Handle message deletion
  socket.on('deleteMessage', (data) => {
    // Broadcast to all clients in the global chat room except sender
    socket.to('globalChat').emit('messageDeleted', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));