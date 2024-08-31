const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  sessionData: { 
    type: Map, 
    of: String // Each value in the Map is a string
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users in this session
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
