const express = require('express');
const Session = require('../models/Session');
const User = require('../models/user')
const DiffMatchPatch = require('diff-match-patch');
const dmp = new DiffMatchPatch();

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { username, email } = req.body;

    // Check if a user with the given username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Create a new session
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const session = new Session({ sessionId, sessionData: new Map() });
    await session.save();

    // Create a new user
    const newUser = new User({ username, email });
    await newUser.save();

    // Add the new user to the session
    session.users.push(newUser._id);
    await session.save();

    res.status(201).json({ sessionId });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Endpoint to join an existing session
router.get('/join/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
  
    try {
      const session = await Session.findOne({ sessionId }).populate('users');
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
  
      res.status(200).json({ sessionId: session.sessionId, sessionData: session.sessionData });
    } catch (error) {
      console.error('Error joining session:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// Endpoint to update session data
router.post('/:sessionId/update', async (req, res) => {
  const { sessionId } = req.params;
  const { cellId, patch } = req.body;

  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
