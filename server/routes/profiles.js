const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getUserProjects,
  getUserTasks
} = require('../controllers/profileController');

const router = express.Router();

// @route    GET api/profile
// @desc     Get current user profile
// @access   Private
router.get('/', auth, getProfile);

// @route    PUT api/profile
// @desc     Update user profile
// @access   Private
router.put(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail()
    ]
  ],
  updateProfile
);

// @route    GET api/profile/projects
// @desc     Get user's projects
// @access   Private
router.get('/projects', auth, getUserProjects);

// @route    GET api/profile/tasks
// @desc     Get user's tasks
// @access   Private
router.get('/tasks', auth, getUserTasks);

module.exports = router;