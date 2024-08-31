const express = require('express');
const Session = require('../models/Session');
const User = require('../models/user');
const DiffMatchPatch = require('diff-match-patch');
const AsyncLock = require('async-lock');
const dmp = new DiffMatchPatch();
const lock = new AsyncLock();

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { username, email } = req.body;

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

    res.status(200).json({ sessionId: session.sessionId, sessionData: session.sessionData, userId });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to update session data
router.post('/update/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { cellId, patch } = req.body;

  try {
    await lock.acquire(sessionId, async () => {
      const session = await Session.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Apply delta patch to get the new value
      const oldValue = session.sessionData.get(cellId)?.value || '';
      const [newValue] = dmp.patch_apply(patch, oldValue);
      const isFormula = newValue.startsWith('=');
      const computedValue = isFormula ? evaluateFormula(newValue.slice(1), session.sessionData) : newValue;

      // Update the session data
      session.sessionData.set(cellId, { value: newValue, computedValue });
      await session.save();

      // Notify all users in the session about the update
      global.io.to(sessionId).emit('sessionDataUpdated', { cellId, newValue, computedValue });

      res.status(200).json({ message: 'Cell updated successfully' });
    });
  } catch (error) {
    console.error(error);
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