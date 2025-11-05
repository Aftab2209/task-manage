// models/SpecialDay.js
import mongoose from 'mongoose';

const specialDaySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['weekend', 'holiday', 'personal', 'other'],
    default: 'holiday'
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
{ collection: 'special_days' });

// Index for fast date lookups
specialDaySchema.index({ date: 1, active: 1 });

export default mongoose.models.SpecialDay || mongoose.model('SpecialDay', specialDaySchema);