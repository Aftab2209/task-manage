// models/TaskType.js
import mongoose from 'mongoose';

const taskTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  inputType: {
    type: String,
    enum: ['integer', 'decimal', 'boolean'],
    required: true
  },
  completionRule: {
    type: String,
    required: true,
  },
  fineIfFailed: {
    type: Number,
    required: true,
    default: 100
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},
{ collection: 'task_types' });

export default mongoose.models.TaskType || mongoose.model('TaskType', taskTypeSchema);
