const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addComment,
  deleteComment
} = require('../controllers/projectController');

const router = express.Router();

// @route    GET api/projects
// @desc     Get all projects
// @access   Private
router.get('/', auth, getProjects);

// @route    GET api/projects/:id
// @desc     Get project by ID
// @access   Private
router.get('/:id', auth, getProjectById);

// @route    POST api/projects
// @desc     Create new project
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('startDate', 'Start date is required').not().isEmpty(),
      check('endDate', 'End date is required').not().isEmpty()
    ]
  ],
  createProject
);

// @route    PUT api/projects/:id
// @desc     Update project
// @access   Private
router.put('/:id', auth, updateProject);

// @route    DELETE api/projects/:id
// @desc     Delete project
// @access   Private
router.delete('/:id', auth, deleteProject);

// @route    POST api/projects/:id/comment
// @desc     Add comment to project
// @access   Private
router.post('/:id/comment', auth, addComment);

// @route    DELETE api/projects/:id/comment/:comment_id
// @desc     Delete comment from project
// @access   Private
router.delete('/:id/comment/:comment_id', auth, deleteComment);

module.exports = router;