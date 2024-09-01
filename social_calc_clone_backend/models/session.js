const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  sessionData: { type: Map, of: String, default: {} },
  rows: { type: Number, default: 52 },
  columns: { type: Number, default: 52 },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true // Add this line to enable timestamps
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;