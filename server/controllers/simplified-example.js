// This is a simplified example controller to help entry-level developers understand the pattern

const ExampleModel = require('../models/ExampleModel'); // This would be a real model
const { validationResult } = require('express-validator');

// @desc    Get all items
// @route   GET /api/items
// @access  Private
exports.getItems = async (req, res) => {
  try {
    // Fetch items from database
    const items = await ExampleModel.find({ user: req.user.id }).sort({ date: -1 });
    
    // Send response
    res.json(items);
  } catch (err) {
    // Handle errors
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Private
exports.getItemById = async (req, res) => {
  try {
    // Find item by ID
    const item = await ExampleModel.findById(req.params.id);

    // Check if item exists
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    // Check if user is authorized
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Send response
    res.json(item);
  } catch (err) {
    // Handle errors
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private
exports.createItem = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from request body
    const { name, description } = req.body;

    // Create new item
    const newItem = new ExampleModel({
      name,
      description,
      user: req.user.id
    });

    // Save to database
    const item = await newItem.save();
    
    // Send response
    res.json(item);
  } catch (err) {
    // Handle errors
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from request body
    const { name, description } = req.body;

    // Build item object
    const itemFields = {};
    if (name) itemFields.name = name;
    if (description) itemFields.description = description;

    // Find item by ID
    let item = await ExampleModel.findById(req.params.id);

    // Check if item exists
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    // Check if user is authorized
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update item
    item = await ExampleModel.findByIdAndUpdate(
      req.params.id,
      { $set: itemFields },
      { new: true }
    );

    // Send response
    res.json(item);
  } catch (err) {
    // Handle errors
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = async (req, res) => {
  try {
    // Find item by ID
    const item = await ExampleModel.findById(req.params.id);

    // Check if item exists
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    // Check if user is authorized
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete item
    await ExampleModel.findByIdAndRemove(req.params.id);

    // Send response
    res.json({ msg: 'Item removed' });
  } catch (err) {
    // Handle errors
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found' });
    }
    res.status(500).send('Server Error');
  }
};