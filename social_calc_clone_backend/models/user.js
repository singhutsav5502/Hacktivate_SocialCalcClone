const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }], // Sessions the user is part of
});

const User = mongoose.model('User', userSchema);
module.exports = User;