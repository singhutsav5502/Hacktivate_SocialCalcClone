const express = require('express');
const Session = require('../models/Session');
const DiffMatchPatch = require('diff-match-patch');
const dmp = new DiffMatchPatch();

const router = express.Router();

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
