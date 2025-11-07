const mongoose = require('mongoose');

// Define the Task schema
const taskSchema = new mongoose.Schema({
  // Task title - required field
  title: {
    type: String,
    required: true
  },
  
  // Task description - optional field
  description: {
    type: String
  },
  
  // Reference to the project this task belongs to - required field
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // Reference to the user assigned to this task - optional field
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Reference to the user who created this task - required field
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reference to the user who reported this task - optional field
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Task status - can be one of the defined values, defaults to 'todo'
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo'
  },
  
  // Task priority - can be one of the defined values, defaults to 'medium'
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Task start date - optional field
  startDate: {
    type: Date
  },
  
  // Task due date - optional field
  dueDate: {
    type: Date
  },
  
  // Estimated hours to complete task - optional field
  estimatedHours: {
    type: Number
  },
  
  // Actual hours spent on task - optional field
  actualHours: {
    type: Number
  },
  
  // Submission status - indicates if the task has been submitted by team members
  submissionStatus: {
    type: String,
    enum: ['not_submitted', 'submitted'],
    default: 'not_submitted'
  },
  
  // Array of comments on the task
  comments: [{
    // Reference to the user who made the comment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Comment text - required field
    text: {
      type: String,
      required: true
    },
    // Date when comment was made - defaults to current date
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Array of file attachments for the task
  attachments: [{
    // Name of the attachment
    name: String,
    // URL to the attachment
    url: String,
    // Reference to the user who uploaded the attachment
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Date when attachment was uploaded - defaults to current date
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Date when task was created - defaults to current date
  date: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Task model
module.exports = mongoose.model('Task', taskSchema);