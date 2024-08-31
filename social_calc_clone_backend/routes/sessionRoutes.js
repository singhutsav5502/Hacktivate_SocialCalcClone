const express = require('express');
const Session = require('../models/session');
const User = require('../models/user');
const DiffMatchPatch = require('diff-match-patch');
const AsyncLock = require('async-lock');
const dmp = new DiffMatchPatch();
const lock = new AsyncLock();

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { username, email } = req.body;

    // Check if both username and email are provided
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }

    // Check if a user with the given username or email already exists
    let existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    let userId;

    if (existingUser) {
      userId = existingUser._id;
    } else {
      // Create a new user
      const newUser = new User({ username, email });
      await newUser.save();
      userId = newUser._id;
    }

    // Create a new session
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const session = new Session({ sessionId, sessionData: new Map(), users: [userId] });
    await session.save();

    res.status(201).json({ sessionId, userId });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/join/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { username, email } = req.body;

  try {
    const session = await Session.findOne({ sessionId }).populate('users');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    let user = await User.findOne({ $or: [{ username }, { email }] });
    let userId;

    if (!user) {
      // Create a new user
      user = new User({ username, email });
      await user.save();
    }
    userId = user._id;

    // Add user to the session if not already present
    if (!session.users.some(u => u.toString() === userId.toString())) {
      session.users.push(userId);
      await session.save();
    }

    // Send the entire session data to the client
    res.status(200).json({
      sessionId: session.sessionId,
      sessionData: Array.from(session.sessionData.entries()).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {}),
      userId
    });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Endpoint to update session data
router.post('/update/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { sessionData } = req.body; // Entire sessionData should be sent from the client

  try {
    if (!Array.isArray(sessionData)) {
      return res.status(400).json({ message: 'Invalid sessionData format' });
    }

    // Convert array to Map
    const formattedSessionData = new Map(sessionData);

    await lock.acquire(sessionId, async () => {
      const session = await Session.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Update session data
      session.sessionData = formattedSessionData;
      await session.save();

      // Broadcast updated session data to all clients in the session
      global.io.to(sessionId).emit('sessionDataUpdated', {
        sessionData: Array.from(formattedSessionData.entries())
      });

      res.status(200).json({ message: 'Session data updated successfully' });
    });
  } catch (error) {
    console.error('Error updating session data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Socket event listeners for cell focus and unfocus
global.io.on('connection', (socket) => {
  socket.on('focusCell', ({ sessionId, cellId, username }) => {
    global.io.to(sessionId).emit('cellFocused', { cellId, username });
  });

  socket.on('unfocusCell', ({ sessionId, cellId, username }) => {
    global.io.to(sessionId).emit('cellUnfocused', { cellId, username });
  });
});

module.exports = router;