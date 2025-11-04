const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Configure multer for file uploads
const upload = multer({ storage: storage });

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      $or: [
        { user: req.user.id },
        { assignee: req.user.id }
      ]
    })
      .populate('project', ['name'])
      .populate('assignee', ['name'])
      .populate('user', ['name'])
      .sort({ date: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', ['name'])
      .populate('assignee', ['name'])
      .populate('user', ['name'])
      .populate('comments.user', ['name']);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Check if user is authorized to view this task
    if (task.user.toString() !== req.user.id && 
        task.assignee?.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Get tasks by project ID
// @route   GET /api/tasks/project/:project_id
// @access  Private
exports.getTasksByProject = async (req, res) => {
  try {
    // First check if the project exists and user has access to it
    const project = await Project.findById(req.params.project_id);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user is authorized to view this project
    if (project.user.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const tasks = await Task.find({ 
      project: req.params.project_id,
      $or: [
        { user: req.user.id },
        { assignee: req.user.id }
      ]
    })
      .populate('project', ['name'])
      .populate('assignee', ['name'])
      .populate('user', ['name'])
      .sort({ date: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create new task with file attachments
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, project, assignee, priority, status, startDate, dueDate, submissionStatus } = req.body;

    // Validate that project is a valid ObjectId
    if (!project) {
      return res.status(400).json({ msg: 'Project is required' });
    }

    // Validate date formats
    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({ msg: 'Invalid start date format' });
    }
    
    if (dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ msg: 'Invalid due date format' });
    }
    
    // Validate that due date is after start date
    if (startDate && dueDate) {
      const startDateObj = new Date(startDate);
      const dueDateObj = new Date(dueDate);
      
      if (dueDateObj < startDateObj) {
        return res.status(400).json({ msg: 'Due date must be after start date' });
      }
    }

    // Check if project exists and user has access to it
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(400).json({ msg: 'Project not found' });
    }

    // Check if user is authorized to create tasks in this project
    if (projectExists.user.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized to create tasks in this project' });
    }

    // Handle assignee
    let assigneeId = null;
    if (assignee === 'self') {
      assigneeId = req.user.id;
    } else if (assignee && assignee !== 'unassigned') {
      // Check if user exists and is valid
      if (mongoose.Types.ObjectId.isValid(assignee)) {
        const userExists = await User.findById(assignee);
        if (userExists) {
          assigneeId = assignee;
        }
      }
    }

    // Handle file attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          name: file.originalname,
          url: file.path,
          uploadedBy: req.user.id
        });
      });
    }

    const newTask = new Task({
      title,
      description,
      project,
      assignee: assigneeId,
      priority,
      status,
      startDate,
      dueDate,
      submissionStatus: submissionStatus || 'not_submitted',
      user: req.user.id,
      reporter: req.user.id,
      attachments
    });

    const task = await newTask.save();
    
    // Populate the task with project and assignee info
    const populatedTask = await Task.findById(task._id)
      .populate('project', ['name'])
      .populate('assignee', ['name'])
      .populate('user', ['name']);
      
    res.json(populatedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, project, assignee, priority, status, startDate, dueDate, submissionStatus } = req.body;

    // Build task object
    const taskFields = {};
    if (title) taskFields.title = title;
    if (description) taskFields.description = description;
    if (project) taskFields.project = project;
    if (priority) taskFields.priority = priority;
    if (status) taskFields.status = status;
    if (startDate) taskFields.startDate = startDate;
    if (dueDate) taskFields.dueDate = dueDate;
    if (submissionStatus) taskFields.submissionStatus = submissionStatus;

    // Handle assignee
    if (assignee === 'self') {
      taskFields.assignee = req.user.id;
    } else if (assignee === 'unassigned') {
      taskFields.assignee = null;
    } else if (assignee) {
      // Check if user exists and is valid
      if (mongoose.Types.ObjectId.isValid(assignee)) {
        const userExists = await User.findById(assignee);
        if (userExists) {
          taskFields.assignee = assignee;
        }
      }
    }

    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Check if user is authorized to update this task
    if (task.user.toString() !== req.user.id && 
        task.assignee?.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    );

    // Populate the task with project and assignee info
    const populatedTask = await Task.findById(task._id)
      .populate('project', ['name'])
      .populate('assignee', ['name'])
      .populate('user', ['name']);
      
    res.json(populatedTask);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Check if user is authorized to delete this task
    if (task.user.toString() !== req.user.id && 
        task.assignee?.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Task.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Check if user is authorized to comment on this task
    if (task.user.toString() !== req.user.id && 
        task.assignee?.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const newComment = {
      user: req.user.id,
      text
    };

    task.comments.unshift(newComment);

    await task.save();

    // Populate comments with user info
    const populatedTask = await Task.findById(req.params.id)
      .populate('comments.user', ['name']);

    res.json(populatedTask.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete comment from task
// @route   DELETE /api/tasks/:id/comment/:comment_id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Check if user is authorized to delete comments on this task
    if (task.user.toString() !== req.user.id && 
        task.assignee?.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Pull out comment
    const comment = task.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    // Check user authorization for deleting comment
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Remove comment
    task.comments = task.comments.filter(
      comment => comment.id !== req.params.comment_id
    );

    await task.save();

    res.json(task.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Upload attachments to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
exports.uploadAttachments = async (req, res) => {
  try {
    // Use multer middleware to handle file upload
    upload.array('attachments', 5)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ msg: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ msg: 'No files uploaded' });
      }

      // Find the task
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ msg: 'Task not found' });
      }

      // Check if user is authorized to update this task
      if (task.user.toString() !== req.user.id && 
          task.assignee?.toString() !== req.user.id && 
          req.user.role !== 'admin') {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      // Add attachments to task
      const attachments = req.files.map(file => ({
        name: file.originalname,
        url: file.path,
        uploadedBy: req.user.id
      }));

      task.attachments.push(...attachments);
      await task.save();

      // Populate attachments with user info
      const populatedTask = await Task.findById(req.params.id)
        .populate('attachments.uploadedBy', ['name']);

      res.json(populatedTask.attachments);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update task submission status
// @route   PUT /api/tasks/:id/submission
// @access  Private
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { submissionStatus } = req.body;

    // Validate submission status
    if (!['not_submitted', 'submitted'].includes(submissionStatus)) {
      return res.status(400).json({ msg: 'Invalid submission status' });
    }

    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Check if user is authorized to update this task
    if (task.user.toString() !== req.user.id && 
        task.assignee?.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update submission status
    task.submissionStatus = submissionStatus;
    await task.save();

    // Populate the task with project and assignee info
    const populatedTask = await Task.findById(task._id)
      .populate('project', ['name'])
      .populate('assignee', ['name'])
      .populate('user', ['name']);
      
    res.json(populatedTask);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete attachment from task
// @route   DELETE /api/tasks/:id/attachments/:attachment_id
// @access  Private
exports.deleteAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Check if user is authorized to update this task
    if (task.user.toString() !== req.user.id && 
        task.assignee?.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Pull out attachment
    const attachment = task.attachments.find(
      attachment => attachment.id === req.params.attachment_id
    );

    // Make sure attachment exists
    if (!attachment) {
      return res.status(404).json({ msg: 'Attachment does not exist' });
    }

    // Remove attachment
    task.attachments = task.attachments.filter(
      attachment => attachment.id !== req.params.attachment_id
    );

    await task.save();

    res.json({ msg: 'Attachment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};