// models/Todo.js
import mongoose from 'mongoose';
import './User.js'; // <-- ensures User model is registered before Todo

const subTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  description: {
    type: String,
    trim: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Dates
  dueDate: {
    type: Date,
    index: true
  },
  completedAt: {
    type: Date
  },
  
  // Organization
  category: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Sub-tasks
  subTasks: [subTaskSchema],
  
  // Links
  links: [{
    title: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  }],
  
  // Notes
  notes: {
    type: String,
    trim: true
  },
  
  // Active flag
  active: {
    type: Boolean,
    default: true
  }
},
{ 
  collection: 'todos',
  timestamps: true 
});

// Indexes for common queries
todoSchema.index({ userId: 1, status: 1 });
todoSchema.index({ userId: 1, dueDate: 1 });
todoSchema.index({ userId: 1, priority: 1 });

// Method to mark as completed
todoSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to check if overdue
todoSchema.methods.isOverdue = function() {
  return this.dueDate && this.status !== 'completed' && new Date() > this.dueDate;
};

// Virtual for completion percentage based on subtasks
todoSchema.virtual('completionPercentage').get(function() {
  if (!this.subTasks || this.subTasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  const completed = this.subTasks.filter(st => st.completed).length;
  return Math.round((completed / this.subTasks.length) * 100);
});

export default mongoose.models.Todo || mongoose.model('Todo', todoSchema);