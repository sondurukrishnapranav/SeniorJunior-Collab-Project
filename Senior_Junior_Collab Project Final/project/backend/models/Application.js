const mongoose = require('mongoose');

const { Schema } = mongoose;

const ApplicationSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  juniorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, required: true },
  resumePath: { type: String },
  portfolioUrl: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'reviewing', 'accepted', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);