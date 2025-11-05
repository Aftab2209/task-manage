// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false  // Don't include password in queries by default for security
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  collection: 'users' 
});

export default mongoose.models.User || mongoose.model('User', userSchema);