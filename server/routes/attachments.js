const express = require('express');
const auth = require('../middleware/auth');
const {
  uploadAttachment,
  getAttachment,
  deleteAttachment
} = require('../controllers/attachmentController');

const router = express.Router();

// @route    POST api/attachments/upload
// @desc     Upload attachment
// @access   Private
router.post('/upload', auth, uploadAttachment);

// @route    GET api/attachments/:filename
// @desc     Get attachment
// @access   Private
router.get('/:filename', auth, getAttachment);

// @route    DELETE api/attachments/:filename
// @desc     Delete attachment
// @access   Private
router.delete('/:filename', auth, deleteAttachment);

module.exports = router;