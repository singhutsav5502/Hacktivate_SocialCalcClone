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
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { sessions: session.sessionId } },
      { new: true }
    );
    res.status(201).json({ sessionId, userId });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to update session data
router.post('/update/:sessionId', async (req, res) => {
  const { senderId } = req.body;
  const { sessionId } = req.params;
  const { sessionData } = req.body; // Entire sessionData should be sent from the client
  const { rows, columns, type } = req.body;

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
        sessionData: Array.from(formattedSessionData.entries()),
        rows: rows,
        columns: columns,
        senderId,
        type
      });

      res.status(200).json({ message: 'Session data updated successfully' });
    });
  } catch (error) {
    console.error('Error updating session data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get session information for a user
router.post('/getSessions', async (req, res) => {
  const { username, email } = req.body;

  try {
    // Find the user by username and email
    const user = await User.findOne({ username, email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the list of session IDs the user can join (from the user's sessions array)
    const sessionIds = user.sessions;

    // Find sessions by session IDs and populate the users field with their usernames
    const sessions = await Session.find({ sessionId: { $in: sessionIds } })
      .populate('users', 'username') // Populate only the username field of the users
      .select('sessionId createdAt users'); // Select the fields you want to return

    // Transform the sessions data to return creation time and usernames
    const sessionInfo = sessions.map(session => ({
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      users: session.users.map(user => user.username) // Extract usernames
    }));

    // Return the session information
    res.status(200).json({ sessions: sessionInfo });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
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