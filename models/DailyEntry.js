// models/DailyEntry.js
import mongoose from 'mongoose';

const taskEntrySchema = new mongoose.Schema({
  taskType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskType',
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  markedAt: {
    type: Date,
    default: null
  }
}, { _id: false });

const dailyEntrySchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  tasks: [taskEntrySchema],
  dailyFine: {
    type: Number,
    default: 0,
    min: 0,
    max: 200
  },
  fineCalculatedAt: {
    type: Date,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

dailyEntrySchema.index({ user: 1, date: 1 }, { unique: true });

dailyEntrySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.DailyEntry || mongoose.model('DailyEntry', dailyEntrySchema);
