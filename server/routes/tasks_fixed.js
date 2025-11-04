const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

const router = express.Router();

// @route    GET api/tasks
// @desc     Get all tasks
// @access   Private
router.get('/', auth, taskController.getTasks);

// @route    GET api/tasks/:id
// @desc     Get task by ID
// @access   Private
router.get('/:id', auth, taskController.getTaskById);

// @route    GET api/tasks/project/:project_id
// @desc     Get tasks by project ID
// @access   Private
router.get('/project/:project_id', auth, taskController.getTasksByProject);

// @route    POST api/tasks
// @desc     Create new task
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('project', 'Project is required').not().isEmpty()
    ]
  ],
  taskController.createTask
);

// @route    PUT api/tasks/:id
// @desc     Update task
// @access   Private
router.put('/:id', auth, taskController.updateTask);

// @route    DELETE api/tasks/:id
// @desc     Delete task
// @access   Private
router.delete('/:id', auth, taskController.deleteTask);

// @route    POST api/tasks/:id/comment
// @desc     Add comment to task
// @access   Private
router.post('/:id/comment', auth, taskController.addComment);

// @route    DELETE api/tasks/:id/comment/:comment_id
// @desc     Delete comment from task
// @access   Private
router.delete('/:id/comment/:comment_id', auth, taskController.deleteComment);

module.exports = router;