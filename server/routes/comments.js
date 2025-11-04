const express = require('express');
const auth = require('../middleware/auth');
const {
  addComment,
  deleteComment
} = require('../controllers/commentController');

const router = express.Router();

// @route    POST api/:resourceType/:id/comment
// @desc     Add comment to project or task
// @access   Private
router.post('/:resourceType/:id/comment', auth, addComment);

// @route    DELETE api/:resourceType/:id/comment/:comment_id
// @desc     Delete comment from project or task
// @access   Private
router.delete('/:resourceType/:id/comment/:comment_id', auth, deleteComment);

module.exports = router;