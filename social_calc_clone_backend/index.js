const express = require('express');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/user');
const Session = require('./models/session');
require('dotenv').config();

const app = express();

// Load SSL certificates
const privateKey = fs.readFileSync('./certs/private.key', 'utf8');
const certificate = fs.readFileSync('./certs/certificate.crt', 'utf8');
const ca = fs.readFileSync('./certs/ca_bundle.crt', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

// Create HTTPS server
const server = https.createServer(credentials, app);

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

// Set global.io
global.io = io;

// Set up middleware
app.use(express.json());
app.set('io', io); // Store io instance in the app for access in routes

// Session route handlers
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/session', sessionRoutes);

// Helper function to get column labels
const getColumnLabel = (index) => {
  let label = '';
  let i = index;
  while (i >= 0) {
    label = String.fromCharCode((i % 26) + 65) + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
};

// WebSocket event handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle the user joining a session
  socket.on('joinSession', async ({ sessionId, userId, username, email }) => {
    console.log(`User ${userId} joined session: ${sessionId}`);
    socket.join(sessionId);

    try {
      // Fetch the user by username and email
      const user = await User.findOne({ username, email });

      if (!user) {
        console.error('User not found');
        return;
      }

      // Add the user ID to the session's users array
      const session = await Session.findOne({ sessionId });

      if (session) {
        if (!session.users.includes(user._id)) {
          session.users.push(user._id);
          await session.save();
        }

        // Send the entire session data to the newly joined user
        socket.emit('sessionData', {
          sessionId: session.sessionId,
          rows: session.rows,
          columns: session.columns,
          sessionData: Array.from(session.sessionData.entries()).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {})
        });
      }
    } catch (error) {
      console.error('Error processing join session:', error);
    }
  });

  // Handle row addition
  socket.on('addRow', async ({ sessionId, senderId }) => {
    try {
      const session = await Session.findOne({ sessionId });
      if (!session) {
        console.error('Session not found');
        return;
      }

      const newRowCount = session.rows + 1;
      session.rows = newRowCount;

      for (let colIndex = 0; colIndex < session.columns; colIndex++) {
        const cellId = `${getColumnLabel(colIndex)}${newRowCount}`;
        session.sessionData.set(cellId, '');
      }

      await session.save();

      io.to(sessionId).emit('sessionDataUpdated', {
        sessionData: Array.from(session.sessionData.entries()),
        rows: session.rows,
        columns: session.columns,
        senderId
      });
    } catch (error) {
      console.error('Error adding row:', error);
    }
  });

  // Handle column addition
  socket.on('addColumn', async ({ sessionId, senderId }) => {
    try {
      const session = await Session.findOne({ sessionId });
      if (!session) {
        console.error('Session not found');
        return;
      }

      const newColCount = session.columns + 1;
      session.columns = newColCount;

      for (let rowIndex = 1; rowIndex <= session.rows; rowIndex++) {
        const cellId = `${getColumnLabel(newColCount - 1)}${rowIndex}`;
        session.sessionData.set(cellId, '');
      }

      await session.save();

      io.to(sessionId).emit('sessionDataUpdated', {
        sessionData: Array.from(session.sessionData.entries()),
        rows: session.rows,
        columns: session.columns,
        senderId
      });
    } catch (error) {
      console.error('Error adding column:', error);
    }
  });

  // Handle cell focus
  socket.on('focusCell', ({ sessionId, cellId, username }) => {
    console.log(`User ${username} focused on cell ${cellId} in session ${sessionId}`);
    io.to(sessionId).emit('cellFocused', { cellId, username });
  });

  // Handle cell unfocus
  socket.on('unfocusCell', ({ sessionId, cellId, username }) => {
    console.log(`User ${username} unfocused from cell ${cellId} in session ${sessionId}`);
    io.to(sessionId).emit('cellUnfocused', { cellId, username });
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
  server.listen(5000, '0.0.0.0', () => {
    console.log('Server listening on port 5000');
  });
}).catch(err => console.error('Database connection error:', err));