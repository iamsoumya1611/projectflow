const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Get project stats for the current user only
    const totalProjects = await Project.countDocuments({ user: req.user.id });
    const completedProjects = await Project.countDocuments({ 
      user: req.user.id, 
      status: 'completed' 
    });
    
    // Get task stats for the current user (both assigned and created)
    const totalTasks = await Task.countDocuments({ 
      $or: [
        { user: req.user.id },
        { assignee: req.user.id }
      ]
    });
    
    const completedTasks = await Task.countDocuments({ 
      $or: [
        { user: req.user.id },
        { assignee: req.user.id }
      ],
      status: 'done' 
    });
    
    // Calculate completion rates
    const projectCompletionRate = totalProjects > 0 
      ? Math.round((completedProjects / totalProjects) * 100) 
      : 0;
      
    const taskCompletionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    // Get team members count (for admin users only)
    let teamMembersCount = 0;
    if (req.user.role === 'admin') {
      teamMembersCount = await User.countDocuments();
    }
    
    res.json({
      projectStats: {
        total: totalProjects,
        completed: completedProjects
      },
      taskStats: {
        total: totalTasks,
        completed: completedTasks
      },
      projectCompletionRate,
      taskCompletionRate,
      teamMembersCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get projects analytics
// @route   GET /api/analytics/projects
// @access  Private
exports.getProjectsAnalytics = async (req, res) => {
  try {
    // Get all projects for the user
    const projects = await Project.find({ user: req.user.id })
      .populate('user', ['name'])
      .sort({ date: -1 });
    
    // Group projects by status
    const projectsByStatus = {
      not_started: projects.filter(project => project.status === 'not_started'),
      in_progress: projects.filter(project => project.status === 'in_progress'),
      on_hold: projects.filter(project => project.status === 'on_hold'),
      completed: projects.filter(project => project.status === 'completed')
    };
    
    // Group projects by priority
    const projectsByPriority = {
      low: projects.filter(project => project.priority === 'low'),
      medium: projects.filter(project => project.priority === 'medium'),
      high: projects.filter(project => project.priority === 'high'),
      urgent: projects.filter(project => project.priority === 'urgent')
    };
    
    // Get overdue projects
    const currentDate = new Date();
    const overdueProjects = projects.filter(project => {
      return project.endDate && new Date(project.endDate) < currentDate && project.status !== 'completed';
    });
    
    res.json({
      total: projects.length,
      projectsByStatus,
      projectsByPriority,
      overdue: overdueProjects,
      projects: projects.slice(0, 10) // Return first 10 projects for recent list
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get tasks analytics
// @route   GET /api/analytics/tasks
// @access  Private
exports.getTasksAnalytics = async (req, res) => {
  try {
    // Get all tasks for the user (both created and assigned)
    const tasks = await Task.find({ 
      $or: [
        { user: req.user.id },
        { assignee: req.user.id }
      ]
    })
      .populate('project', ['name'])
      .populate('user', ['name'])
      .populate('assignee', ['name'])
      .sort({ date: -1 });
    
    // Group tasks by status
    const tasksByStatus = {
      todo: tasks.filter(task => task.status === 'todo'),
      in_progress: tasks.filter(task => task.status === 'in_progress'),
      review: tasks.filter(task => task.status === 'review'),
      done: tasks.filter(task => task.status === 'done')
    };
    
    // Group tasks by priority
    const tasksByPriority = {
      low: tasks.filter(task => task.priority === 'low'),
      medium: tasks.filter(task => task.priority === 'medium'),
      high: tasks.filter(task => task.priority === 'high'),
      urgent: tasks.filter(task => task.priority === 'urgent')
    };
    
    // Get overdue tasks
    const currentDate = new Date();
    const overdueTasks = tasks.filter(task => {
      return task.dueDate && new Date(task.dueDate) < currentDate && task.status !== 'done';
    });
    
    // Get tasks assigned to user
    const assignedTasks = tasks.filter(task => 
      task.assignee && task.assignee._id.toString() === req.user.id
    );
    
    // Get tasks created by user
    const createdTasks = tasks.filter(task => 
      task.user._id.toString() === req.user.id
    );
    
    res.json({
      total: tasks.length,
      tasksByStatus,
      tasksByPriority,
      overdue: overdueTasks,
      assigned: assignedTasks,
      created: createdTasks,
      tasks: tasks.slice(0, 10) // Return first 10 tasks for recent list
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};