// models/FineLedger.js
import mongoose from 'mongoose';

const fineLedgerSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  totalFine: {
    type: Number,
    required: true,
    min: 0,
    max: 200
  },
  tasksFailed: [{
    type: String
  }],
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

fineLedgerSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.models.FineLedger || mongoose.model('FineLedger', fineLedgerSchema);
