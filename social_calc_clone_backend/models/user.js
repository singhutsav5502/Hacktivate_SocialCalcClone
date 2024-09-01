const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  sessions: [{ type: String }], // Sessions the user owns, stored as strings
});

const User = mongoose.model('User', userSchema);
module.exports = User;
