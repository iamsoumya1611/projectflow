const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/admin');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const router = express.Router();

// Import multer for file uploads
const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Configure multer for file uploads
const upload = multer({ storage: storage });

// @route    GET api/admin/users
// @desc     Get all users
// @access   Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/admin/projects
// @desc     Get all projects
// @access   Private (Admin only)
router.get('/projects', adminAuth, async (req, res) => {
  try {
    const projects = await Project.find().populate('owner', ['name']);
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/admin/projects/:id
// @desc     Get project by ID
// @access   Private (Admin only)
router.get('/projects/:id', adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', ['name']).populate('comments.user', ['name']);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/admin/projects
// @desc     Create new project (admin only)
// @access   Private (Admin only)
router.post('/projects', adminAuth, async (req, res) => {
  const { name, description, startDate, endDate, priority, status, owner } = req.body;

  try {
    // Validate required fields
    if (!name || !description || !startDate || !endDate) {
      return res.status(400).json({ msg: 'Name, description, start date, and end date are required' });
    }

    // Handle owner
    let ownerId = req.user.id; // Default to admin creating the project
    if (owner && mongoose.Types.ObjectId.isValid(owner)) {
      // Check if user exists
      const userExists = await User.findById(owner);
      if (userExists) {
        ownerId = owner;
      }
    }
    
    // Validate date formats
    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({ msg: 'Invalid start date format' });
    }
    
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({ msg: 'Invalid end date format' });
    }
    
    // Validate that end date is after start date
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      if (endDateObj < startDateObj) {
        return res.status(400).json({ msg: 'End date must be after start date' });
      }
    }

    const newProject = new Project({
      name,
      description,
      startDate,
      endDate,
      priority: priority || 'medium',
      status: status || 'not_started',
      user: ownerId,
      owner: ownerId
    });

    const project = await newProject.save();
    
    // Populate the project with owner info
    const populatedProject = await Project.findById(project._id).populate('owner', ['name']);
      
    res.json(populatedProject);
  } catch (err) {
    console.error('Admin project creation error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid data provided', error: err.message });
    }
    res.status(500).send('Server error');
  }
});

// @route    PUT api/admin/projects/:id
// @desc     Update any project (admin only)
// @access   Private (Admin only)
router.put('/projects/:id', adminAuth, async (req, res) => {
  const { name, description, startDate, endDate, priority, status, owner } = req.body;

  // Build project object
  const projectFields = {};
  if (name) projectFields.name = name;
  if (description) projectFields.description = description;
  if (startDate) projectFields.startDate = startDate;
  if (endDate) projectFields.endDate = endDate;
  if (priority) projectFields.priority = priority;
  if (status) projectFields.status = status;
  if (owner && mongoose.Types.ObjectId.isValid(owner)) {
    // Check if user exists
    const userExists = await User.findById(owner);
    if (userExists) {
      projectFields.user = owner;
      projectFields.owner = owner;
    }
  }

  try {
    let project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ msg: 'Project not found' });

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: projectFields },
      { new: true }
    );

    // Populate the project with owner info
    const populatedProject = await Project.findById(project._id).populate('owner', ['name']);
    
    res.json(populatedProject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/admin/projects/:id/attachments
// @desc     Upload attachments to project (admin only)
// @access   Private (Admin only)
router.post('/projects/:id/attachments', adminAuth, upload.array('attachments', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    // Find the project
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Add attachments to project
    const attachments = req.files.map(file => ({
      name: file.originalname,
      url: file.path,
      uploadedBy: req.user.id
    }));

    project.attachments.push(...attachments);
    await project.save();

    // Populate attachments with user info
    const populatedProject = await Project.findById(req.params.id)
      .populate('attachments.uploadedBy', ['name']);

    res.json(populatedProject.attachments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE api/admin/projects/:id/attachments/:attachment_id
// @desc     Delete attachment from project (admin only)
// @access   Private (Admin only)
router.delete('/projects/:id/attachments/:attachment_id', adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Pull out attachment
    const attachment = project.attachments.find(
      attachment => attachment.id === req.params.attachment_id
    );

    // Make sure attachment exists
    if (!attachment) {
      return res.status(404).json({ msg: 'Attachment does not exist' });
    }

    // Remove attachment
    project.attachments = project.attachments.filter(
      attachment => attachment.id !== req.params.attachment_id
    );

    await project.save();

    res.json({ msg: 'Attachment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/admin/tasks
// @desc     Get all tasks
// @access   Private (Admin only)
router.get('/tasks', adminAuth, async (req, res) => {
  try {
    const tasks = await Task.find().populate('project', ['name']).populate('assignee', ['name']);
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/admin/tasks
// @desc     Create new task (admin only)
// @access   Private (Admin only)
router.post('/tasks', adminAuth, async (req, res) => {
  const { title, description, project, assignee, priority, dueDate, status, submissionStatus } = req.body;

  try {
    // Validate that project is a valid ObjectId
    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({ msg: 'Valid project ID is required' });
    }

    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(400).json({ msg: 'Project not found' });
    }

    // Handle assignee
    let assigneeId = null;
    if (assignee && mongoose.Types.ObjectId.isValid(assignee)) {
      // Check if user exists
      const userExists = await User.findById(assignee);
      if (userExists) {
        assigneeId = assignee;
      }
    }
    
    // Validate date formats
    if (dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ msg: 'Invalid due date format' });
    }

    const newTask = new Task({
      title,
      description,
      project,
      assignee: assigneeId,
      priority: priority || 'medium',
      dueDate,
      status: status || 'todo',
      submissionStatus: submissionStatus || 'not_submitted',
      user: req.user.id, // Admin creating the task
      reporter: req.user.id
    });

    const task = await newTask.save();
    
    // Populate the task with project and assignee info
    const populatedTask = await Task.findById(task._id)
      .populate('project', ['name'])
      .populate('assignee', ['name']);
      
    // Emit socket event to notify the assigned user
    if (assigneeId) {
      const io = req.app.get('io');
      if (io) {
        io.emit('newTaskAssigned', {
          userId: assigneeId,
          task: populatedTask
        });
      }
    }
      
    res.json(populatedTask);
  } catch (err) {
    console.error('Admin task creation error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid data provided', error: err.message });
    }
    res.status(500).send('Server error');
  }
});

// @route    POST api/admin/tasks/:id/attachments
// @desc     Upload attachments to task (admin only)
// @access   Private (Admin only)
router.post('/tasks/:id/attachments', adminAuth, upload.array('attachments', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    // Find the task
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
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
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE api/admin/tasks/:id/attachments/:attachment_id
// @desc     Delete attachment from task (admin only)
// @access   Private (Admin only)
router.delete('/tasks/:id/attachments/:attachment_id', adminAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
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
    res.status(500).send('Server error');
  }
});

// @route    PUT api/admin/users/:id/role
// @desc     Update user role
// @access   Private (Admin only)
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Prevent removing admin role from self
    if (user.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ msg: 'Cannot remove admin role from yourself' });
    }
    
    user.role = role;
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE api/admin/users/:id
// @desc     Delete user
// @access   Private (Admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ msg: 'Cannot delete yourself' });
    }
    
    // Delete user's projects
    await Project.deleteMany({ user: req.params.id });
    
    // Delete user's tasks
    await Task.deleteMany({ user: req.params.id });
    
    // Delete user
    await User.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE api/admin/projects/:id
// @desc     Delete any project (admin only)
// @access   Private (Admin only)
router.delete('/projects/:id', adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    // Delete project and all associated tasks
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE api/admin/tasks/:id
// @desc     Delete any task (admin only)
// @access   Private (Admin only)
router.delete('/tasks/:id', adminAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    
    await Task.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;