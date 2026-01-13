const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  supervisor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deadline: { type: Date, required: true },
  maxAttempts: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'submited', 'graded', 'expired'], default: 'pending' },
  grade: { type: Number, min: 0, max: 20 }
});

module.exports = mongoose.model('Project', projectSchema); 