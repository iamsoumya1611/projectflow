const Project = require('../models/Project');
const Task = require('../models/Task');
const { body, validationResult } = require('express-validator');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .populate('user', ['name'])
      .populate('owner', ['name'])
      .sort({ date: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('user', ['name'])
      .populate('owner', ['name'])
      .populate('comments.user', ['name']);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user is authorized to view this project
    if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate, priority, status } = req.body;

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
      priority,
      status,
      user: req.user.id,
      owner: req.user.id
    });

    const project = await newProject.save();
    
    // Populate the project with user info
    const populatedProject = await Project.findById(project._id)
      .populate('user', ['name'])
      .populate('owner', ['name']);
      
    res.json(populatedProject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate, priority, status } = req.body;

    // Build project object
    const projectFields = {};
    if (name) projectFields.name = name;
    if (description) projectFields.description = description;
    if (startDate) projectFields.startDate = startDate;
    if (endDate) projectFields.endDate = endDate;
    if (priority) projectFields.priority = priority;
    if (status) projectFields.status = status;

    let project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Check if user is authorized to update this project
    if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: projectFields },
      { new: true }
    );

    // Populate the project with user info
    const populatedProject = await Project.findById(project._id)
      .populate('user', ['name'])
      .populate('owner', ['name']);
      
    res.json(populatedProject);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user is authorized to delete this project
    if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });

    await Project.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Add comment to project
// @route   POST /api/projects/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    const newComment = {
      user: req.user.id,
      text
    };

    project.comments.unshift(newComment);

    await project.save();

    // Populate comments with user info
    const populatedProject = await Project.findById(req.params.id)
      .populate('comments.user', ['name']);

    res.json(populatedProject.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete comment from project
// @route   DELETE /api/projects/:id/comment/:comment_id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Pull out comment
    const comment = project.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    // Check user authorization
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Remove comment
    project.comments = project.comments.filter(
      comment => comment.id !== req.params.comment_id
    );

    await project.save();

    res.json(project.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};