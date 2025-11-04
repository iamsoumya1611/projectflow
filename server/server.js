console.log('Loading server.js module...');

const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

console.log('Required modules loaded');

// Defer express require until after dependency installation
let express;
let app;

function initializeServer() {
  console.log('Initializing server...');
  
  try {
    // Now we can safely require express
    console.log('Requiring express...');
    express = require('express');
    console.log('Express required successfully');
    
    app = express();
    console.log('Express app created');

    // Connect to database
    console.log('Connecting to database...');
    connectDB();
    console.log('Database connection initiated');

    // Init middleware
    console.log('Initializing middleware...');
    app.use(express.json({ extended: false }));
    console.log('Middleware initialized');

    // Enable CORS for all requests
    console.log('Setting up CORS...');
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://projectflow.vercel.app', 'https://your-vercel-frontend-url.vercel.app'] 
        : "http://localhost:3000",
      credentials: true
    }));
    console.log('CORS configured');

    // Serve static files from uploads directory
    console.log('Setting up static file serving...');
    app.use('/uploads', express.static('uploads'));
    console.log('Static file serving configured');

    // Create HTTP server and Socket.IO instance
    console.log('Creating HTTP server and Socket.IO instance...');
    const server = http.createServer(app);
    const io = socketIo(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? 'https://projectflow-api.vercel.app/' : "*",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });
    console.log('HTTP server and Socket.IO instance created');

    // Store io instance in app locals so routes can access it
    app.set('io', io);
    console.log('Socket.IO instance stored');

    // Test endpoint
    console.log('Setting up test endpoint...');
    app.get('/api/test', (req, res) => {
      res.json({ msg: 'Server is running' });
    });
    console.log('Test endpoint configured');

    // Define routes
    console.log('Setting up routes...');
    app.use('/users', require('./routes/users'));
    app.use('/auth', require('./routes/auth'));
    app.use('/projects', require('./routes/projects'));
    app.use('/tasks', require('./routes/tasks'));
    app.use('/analytics', require('./routes/analytics'));
    app.use('/admin', require('./routes/admin'));
    app.use('/messages', require('./routes/messages'));
    app.use('/comments', require('./routes/comments'));
    app.use('/profile', require('./routes/profiles'));
    console.log('Routes configured');

    // Socket.IO connection handling
    console.log('Setting up Socket.IO connection handling...');
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
    console.log('Socket.IO connection handling configured');

    // Serve static assets in production
    console.log('Setting up production static assets...');
    if (process.env.NODE_ENV === 'production') {
      // Set static folder
      app.use(express.static('client/build'));

      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
      });
    }
    console.log('Production static assets configured');

    const PORT = process.env.PORT || 5000;
    console.log(`Starting server on port ${PORT}...`);

    server.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
    
    console.log('Server initialization completed successfully');
  } catch (error) {
    console.error('Error during server initialization:', error);
    throw error;
  }
}

// Export the initialization function
console.log('Server module loaded and exported');
module.exports = { initializeServer };