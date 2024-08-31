const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors
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
  socket.on('joinSession', (sessionId) => {
    console.log(`User ${socket.id} joined session: ${sessionId}`);
    socket.join(sessionId); // Join the user to a session-specific room
  });

  // Handle session data updates
  socket.on('sessionDataUpdated', ({ cellId, newValue }) => {
    console.log(`Data updated for cell ${cellId}: ${newValue}`);
    // Notify all users in the session
    socket.broadcast.to(socket.room).emit('sessionDataUpdated', { cellId, newValue });
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_DB_URL).then(() => {
  console.log('Connected to MongoDB');
  server.listen(5000, () => {
    console.log('Server listening on port 5000');
  });
}).catch(err => console.error('Database connection error:', err));
