const express = require('express');
const auth = require('../middleware/auth');
const {
  getDashboardAnalytics,
  getProjectsAnalytics,
  getTasksAnalytics
} = require('../controllers/analyticsController');

const router = express.Router();

// @route    GET api/analytics/dashboard
// @desc     Get dashboard analytics
// @access   Private
router.get('/dashboard', auth, getDashboardAnalytics);

// @route    GET api/analytics/projects
// @desc     Get projects analytics
// @access   Private
router.get('/projects', auth, getProjectsAnalytics);

// @route    GET api/analytics/tasks
// @desc     Get tasks analytics
// @access   Private
router.get('/tasks', auth, getTasksAnalytics);

module.exports = router;