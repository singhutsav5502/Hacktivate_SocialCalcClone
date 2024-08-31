const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Adjust based on your CORS policy
    methods: ['GET', 'POST'],
  },
});

// Make io accessible globally
global.io = io;

app.use(express.json());
app.use('/api/session', sessionRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinSession', (sessionId) => {
    socket.join(sessionId);
    console.log(`Client ${socket.id} joined session ${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));