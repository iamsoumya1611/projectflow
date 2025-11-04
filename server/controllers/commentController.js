const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Add comment to project or task
// @route   POST /api/:resourceType/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { resourceType, id } = req.params;

    let resource;
    let modelName;

    // Determine the resource type
    if (resourceType === 'projects') {
      resource = await Project.findById(id);
      modelName = 'Project';
    } else if (resourceType === 'tasks') {
      resource = await Task.findById(id);
      modelName = 'Task';
    } else {
      return res.status(400).json({ msg: 'Invalid resource type' });
    }

    if (!resource) {
      return res.status(404).json({ msg: `${modelName} not found` });
    }

    const newComment = {
      user: req.user.id,
      text
    };

    resource.comments.unshift(newComment);

    await resource.save();

    // Populate comments with user info
    const populatedResource = await resource.constructor.findById(id)
      .populate('comments.user', ['name']);

    res.json(populatedResource.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete comment from project or task
// @route   DELETE /api/:resourceType/:id/comment/:comment_id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const { resourceType, id, comment_id } = req.params;

    let resource;
    let modelName;

    // Determine the resource type
    if (resourceType === 'projects') {
      resource = await Project.findById(id);
      modelName = 'Project';
    } else if (resourceType === 'tasks') {
      resource = await Task.findById(id);
      modelName = 'Task';
    } else {
      return res.status(400).json({ msg: 'Invalid resource type' });
    }

    if (!resource) {
      return res.status(404).json({ msg: `${modelName} not found` });
    }

    // Pull out comment
    const comment = resource.comments.find(
      comment => comment.id === comment_id
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
    resource.comments = resource.comments.filter(
      comment => comment.id !== comment_id
    );

    await resource.save();

    res.json(resource.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};