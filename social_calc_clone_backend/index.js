const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors'); 
const User = require('./models/user')
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST']
  }
});

// Set up middleware
app.use(express.json());
app.set('io', io); // Store io instance in the app for access in routes

// Session route handlers
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/session', sessionRoutes);

// WebSocket event handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle the user joining a session
  socket.on('joinSession', async ({ sessionId, userId }) => {
    console.log(`User ${userId} joined session: ${sessionId}`);
    socket.join(sessionId);
  });

  // Handle session data updates
  socket.on('sessionDataUpdated', ({ sessionId, cellId, newValue }) => {
    console.log(`Data updated for cell ${cellId}: ${newValue}`);
    // Notify all users in the session
    socket.broadcast.to(sessionId).emit('sessionDataUpdated', { cellId, newValue });
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle user creation
  socket.on('createUser', async ({ username, email }) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ $or: [{ username }, { email }] });

      if (!user) {
        // Create new user
        user = new User({ username, email });
        await user.save();
      }

      // Send user data back to the client
      socket.emit('userCreated', { userId: user._id, username: user.username, email: user.email });
    } catch (error) {
      console.error('Error creating user:', error);
      socket.emit('error', 'Failed to create user');
    }
  });
});


// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_DB_URL).then(() => {
  console.log('Connected to MongoDB');
  server.listen(5000, () => {
    console.log('Server listening on port 5000');
  });
}).catch(err => console.error('Database connection error:', err));
