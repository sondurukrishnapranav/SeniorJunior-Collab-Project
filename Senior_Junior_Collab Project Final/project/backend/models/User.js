const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['junior', 'senior'], required: true },
  skills: { type: [String], default: [] },
  experience: { type: String, default: '' },
  

  profilePicturePath: { type: String, default: '' },
  resumePath: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  projectsCompleted: { type: Number, default: 0, required: true },

  isVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  verificationExpires: { type: Date },
  passwordResetOTP: { type: String },
  passwordResetExpires: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);