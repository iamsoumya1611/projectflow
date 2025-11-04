import React, { useState, useEffect } from 'react';
import Spinner from '../layout/Spinner';
import { apiFetch } from '../../utils/apiHelper';

const GanttChart = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch projects
      const projectsRes = await apiFetch('/api/projects', {
        headers: {
          'x-auth-token': token
        }
      });
      const projectsData = await projectsRes.json();
      
      // Fetch tasks
      const tasksRes = await apiFetch('/api/tasks', {
        headers: {
          'x-auth-token': token
        }
      });
      const tasksData = await tasksRes.json();
      
      if (projectsRes.ok && tasksRes.ok) {
        setProjects(projectsData);
        setTasks(tasksData);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle project expansion
  const toggleProject = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // Get tasks for a specific project
  const getProjectTasks = (projectId) => {
    return tasks.filter(task => task.project && task.project._id === projectId);
  };

  // Calculate project duration
  const calculateProjectDuration = (project) => {
    const projectTasks = getProjectTasks(project._id);
    if (projectTasks.length === 0) return { start: null, end: null, duration: 0 };
    
    let startDate = project.startDate ? new Date(project.startDate) : new Date();
    let endDate = project.endDate ? new Date(project.endDate) : new Date();
    
    // Override with task dates if they exist and are more extreme
    projectTasks.forEach(task => {
      if (task.startDate) {
        const taskStart = new Date(task.startDate);
        if (taskStart < startDate) startDate = taskStart;
      }
      if (task.dueDate) {
        const taskEnd = new Date(task.dueDate);
        if (taskEnd > endDate) endDate = taskEnd;
      }
    });
    
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return { start: startDate, end: endDate, duration };
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'bg-gray-500',
      'in_progress': 'bg-blue-500',
      'on_hold': 'bg-yellow-500',
      'completed': 'bg-green-500',
      'todo': 'bg-gray-500',
      'in_progress': 'bg-blue-500',
      'review': 'bg-yellow-500',
      'done': 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  // Calculate task position on timeline
  const calculateTaskPosition = (task, projectStart, projectEnd) => {
    if (!task.startDate || !task.dueDate || !projectStart || !projectEnd) {
      return { left: 0, width: 0 };
    }
    
    const projectDuration = projectEnd - projectStart;
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.dueDate);
    
    const left = ((taskStart - projectStart) / projectDuration) * 100;
    const width = ((taskEnd - taskStart) / projectDuration) * 100;
    
    return { left: Math.max(0, left), width: Math.max(0, width) };
  };

  // Filter tasks based on time range
  const filterTasksByTimeRange = (tasks, startDate, endDate) => {
    if (timeRange === 'all') return tasks;
    
    const now = new Date();
    let rangeStart, rangeEnd;
    
    switch (timeRange) {
      case 'month':
        rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
        rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        rangeStart = new Date(now.getFullYear(), quarter * 3, 1);
        rangeEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'year':
        rangeStart = new Date(now.getFullYear(), 0, 1);
        rangeEnd = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return tasks;
    }
    
    return tasks.filter(task => {
      const taskStart = task.startDate ? new Date(task.startDate) : null;
      const taskEnd = task.dueDate ? new Date(task.dueDate) : null;
      
      // Check if task overlaps with the time range
      return (
        (taskStart && taskStart >= rangeStart && taskStart <= rangeEnd) ||
        (taskEnd && taskEnd >= rangeStart && taskEnd <= rangeEnd) ||
        (taskStart && taskEnd && taskStart <= rangeStart && taskEnd >= rangeEnd)
      );
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Timelines</h1>
          <p className="text-gray-400">Visualize project schedules and task dependencies</p>
        </div>
        <div className="mt-4 md:mt-0">
          <label htmlFor="timeRange" className="mr-2 text-gray-400">Time Range:</label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#1F1F2E] border border-[#2D2D44] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">No projects</h3>
          <p className="mt-1 text-sm text-gray-400">Get started by creating a new project.</p>
        </div>
      ) : (
        <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2D2D44]">
              <thead className="bg-[#2D2D44]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Dates
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#1F1F2E] divide-y divide-[#2D2D44]">
                {projects.map((project) => {
                  const duration = calculateProjectDuration(project);
                  const projectTasks = getProjectTasks(project._id);
                  const filteredTasks = filterTasksByTimeRange(projectTasks, duration.start, duration.end);
                  const completedTasks = filteredTasks.filter(task => task.status === 'done' || task.status === 'completed').length;
                  const progress = filteredTasks.length > 0 ? Math.round((completedTasks / filteredTasks.length) * 100) : 0;
                  
                  return (
                    <React.Fragment key={project._id}>
                      <tr className="hover:bg-[#2D2D44]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#4A90E2] flex items-center justify-center">
                              <span className="text-white font-medium">
                                {project.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{project.name}</div>
                              <div className="text-sm text-gray-400">{filteredTasks.length} tasks</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-48 h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#4A90E2] rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{progress}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {duration.start ? formatDate(duration.start) : 'N/A'} - {duration.end ? formatDate(duration.end) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleProject(project._id)}
                            className="text-[#4A90E2] hover:text-[#3A7BC8]"
                          >
                            {expandedProjects.has(project._id) ? 'Collapse' : 'Expand'}
                          </button>
                        </td>
                      </tr>
                      {expandedProjects.has(project._id) && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 bg-[#2D2D44]">
                            <div className="ml-12">
                              <h4 className="text-sm font-medium text-white mb-2">Tasks Timeline</h4>
                              {filteredTasks.length === 0 ? (
                                <p className="text-sm text-gray-400">No tasks for this project in the selected time range</p>
                              ) : (
                                <div className="space-y-4">
                                  {/* Project timeline visualization */}
                                  <div className="bg-[#1F1F2E] rounded p-4">
                                    <div className="relative h-12 bg-gray-800 rounded mb-2 overflow-hidden">
                                      {filteredTasks.map((task, index) => {
                                        if (!task.startDate || !task.dueDate) return null;
                                        
                                        const position = calculateTaskPosition(task, duration.start, duration.end);
                                        
                                        return (
                                          <div
                                            key={task._id}
                                            className={`absolute top-1 h-10 rounded ${getStatusColor(task.status)} opacity-80 flex items-center px-2 text-xs text-white`}
                                            style={{
                                              left: `${position.left}%`,
                                              width: `${position.width}%`
                                            }}
                                            title={`${task.title} (${formatDate(task.startDate)} - ${formatDate(task.dueDate)})`}
                                          >
                                            <span className="truncate">{task.title}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                      <span>{duration.start ? formatDate(duration.start) : 'Start'}</span>
                                      <span>{duration.end ? formatDate(duration.end) : 'End'}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Task list */}
                                  <h4 className="text-sm font-medium text-white mb-2">Tasks</h4>
                                  <div className="space-y-2">
                                    {filteredTasks.map((task) => (
                                      <div key={task._id} className="flex items-center justify-between bg-[#1F1F2E] rounded p-3">
                                        <div className="flex items-center">
                                          <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)} mr-3`}></div>
                                          <div>
                                            <div className="text-sm font-medium text-white">{task.title}</div>
                                            <div className="text-xs text-gray-400">
                                              {task.startDate ? `Start: ${formatDate(task.startDate)}` : ''}
                                              {task.startDate && task.dueDate ? ' | ' : ''}
                                              {task.dueDate ? `Due: ${formatDate(task.dueDate)}` : ''}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {task.assignee ? task.assignee.name : 'Unassigned'}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;