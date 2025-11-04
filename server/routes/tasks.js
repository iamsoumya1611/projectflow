const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getTasks,
  getTaskById,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
  uploadAttachments,
  deleteAttachment,
  updateSubmissionStatus
} = require('../controllers/taskController');
const upload = require('../middleware/upload');

const router = express.Router();

// @route    GET api/tasks
// @desc     Get all tasks
// @access   Private
router.get('/', auth, getTasks);

// @route    GET api/tasks/:id
// @desc     Get task by ID
// @access   Private
router.get('/:id', auth, getTaskById);

// @route    GET api/tasks/project/:project_id
// @desc     Get tasks by project ID
// @access   Private
router.get('/project/:project_id', auth, getTasksByProject);

// @route    POST api/tasks
// @desc     Create new task
// @access   Private
router.post(
  '/',
  [
    auth,
    upload.array('attachments', 5),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('project', 'Project is required').not().isEmpty()
    ]
  ],
  createTask
);

// @route    PUT api/tasks/:id
// @desc     Update task
// @access   Private
router.put(
  '/:id',
  [
    auth,
    upload.array('attachments', 5),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('project', 'Project is required').not().isEmpty()
    ]
  ],
  updateTask
);

// @route    PUT api/tasks/:id/submission
// @desc     Update task submission status
// @access   Private
router.put(
  '/:id/submission',
  auth,
  updateSubmissionStatus
);

// @route    DELETE api/tasks/:id
// @desc     Delete task
// @access   Private
router.delete('/:id', auth, deleteTask);

// @route    POST api/tasks/:id/comment
// @desc     Add comment to task
// @access   Private
router.post(
  '/:id/comment',
  [
    auth,
    [check('text', 'Text is required').not().isEmpty()]
  ],
  addComment
);

// @route    DELETE api/tasks/:id/comment/:comment_id
// @desc     Delete comment from task
// @access   Private
router.delete('/:id/comment/:comment_id', auth, deleteComment);

// @route    POST api/tasks/:id/attachments
// @desc     Upload attachments to task
// @access   Private
router.post(
  '/:id/attachments',
  [auth, upload.array('attachments', 5)],
  uploadAttachments
);

// @route    DELETE api/tasks/:id/attachments/:attachment_id
// @desc     Delete attachment from task
// @access   Private
router.delete('/:id/attachments/:attachment_id', auth, deleteAttachment);

module.exports = router;