const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  getCurrentUser
} = require('../controllers/userController');

const router = express.Router();

// @route    GET api/users
// @desc     Get all users
// @access   Private
router.get('/', auth, getUsers);

// @route    GET api/users/profile
// @desc     Get current user profile
// @access   Private
router.get('/profile', auth, getCurrentUser);

// @route    GET api/users/:id
// @desc     Get user by ID
// @access   Private
router.get('/:id', auth, getUserById);

// @route    POST api/users/register
// @desc     Register user
// @access   Public
router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  registerUser
);

// @route    POST api/users/login
// @desc     Login user
// @access   Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  loginUser
);

module.exports = router;
