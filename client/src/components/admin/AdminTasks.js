import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from '../layout/Spinner';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    project: 'all',
    assignee: 'all'
  });

  useEffect(() => {
    fetchAdminTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchAdminTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/tasks', {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();

      if (res.ok) {
        // Populate attachments with user info
        const tasksWithAttachments = await Promise.all(data.map(async (task) => {
          if (task.attachments && task.attachments.length > 0) {
            // Fetch user info for each attachment
            const attachmentsWithUsers = await Promise.all(task.attachments.map(async (attachment) => {
              if (attachment.uploadedBy) {
                try {
                  const userRes = await fetch(`/api/users/${attachment.uploadedBy}`, {
                    headers: {
                      'x-auth-token': token
                    }
                  });
                  if (userRes.ok) {
                    const userData = await userRes.json();
                    return { ...attachment, uploadedBy: userData };
                  }
                } catch (err) {
                  console.error('Error fetching user data:', err);
                }
              }
              return attachment;
            }));
            return { ...task, attachments: attachmentsWithUsers };
          }
          return task;
        }));
        setTasks(tasksWithAttachments);
      } else {
        setError(data.msg || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/projects', {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();

      if (res.ok) {
        setProjects(data);
      } else {
        console.error('Failed to fetch projects:', data.msg);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();

      if (res.ok) {
        setUsers(data);
      } else {
        console.error('Failed to fetch users:', data.msg);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/tasks/${id}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token
          }
        });

        if (res.ok) {
          setTasks(tasks.filter(task => task._id !== id));
        } else {
          const data = await res.json();
          setError(data.msg || 'Failed to delete task');
        }
      } catch (err) {
        console.error(err);
        setError('Server error. Please try again.');
      }
    }
  };

  const deleteAttachment = async (taskId, attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/tasks/${taskId}/attachments/${attachmentId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token
          }
        });

        if (res.ok) {
          // Update the task in state to remove the attachment
          setTasks(tasks.map(task => {
            if (task._id === taskId) {
              return {
                ...task,
                attachments: task.attachments.filter(attachment => attachment._id !== attachmentId)
              };
            }
            return task;
          }));
        } else {
          const data = await res.json();
          setError(data.msg || 'Failed to delete attachment');
        }
      } catch (err) {
        console.error(err);
        setError('Server error. Please try again.');
      }
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      project: 'all',
      assignee: 'all'
    });
  };

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Project filter
    if (filters.project !== 'all' && (!task.project || task.project._id !== filters.project)) {
      return false;
    }

    // Assignee filter
    if (filters.assignee !== 'all') {
      if (filters.assignee === 'unassigned' && task.assignee) {
        return false;
      }
      if (filters.assignee !== 'unassigned' && (!task.assignee || task.assignee._id !== filters.assignee)) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Tasks</h1>
          <p className="text-gray-400 mt-2">Manage all tasks in the system</p>
        </div>
        <button
          onClick={() => navigate('/admin/tasks/new')}
          className="mt-4 md:mt-0 bg-[#4A90E2] hover:bg-[#3a7bc8] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-[#4A90E2]/20"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Task
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
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
      )}

      {/* Filters */}
      <div className="bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44] p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Filter Tasks</h2>
          <button
            onClick={clearFilters}
            className="mt-2 md:mt-0 text-sm text-[#4A90E2] hover:text-[#50E3C2] transition-colors duration-200"
          >
            Clear all filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-[#14141D] border border-[#2D2D44] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full bg-[#14141D] border border-[#2D2D44] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Project</label>
            <select
              value={filters.project}
              onChange={(e) => handleFilterChange('project', e.target.value)}
              className="w-full bg-[#14141D] border border-[#2D2D44] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Assignee</label>
            <select
              value={filters.assignee}
              onChange={(e) => handleFilterChange('assignee', e.target.value)}
              className="w-full bg-[#14141D] border border-[#2D2D44] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2D2D44]">
              <thead className="bg-[#14141D]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Task</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Project</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Assignee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Due Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Attachments</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#1F1F2E] divide-y divide-[#2D2D44]">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-[#14141D]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{task.title}</div>
                      <div className="text-sm text-[#A0A0B0]">{task.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0B0]">
                      {task.project?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0B0]">
                      {task.assignee?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0B0]">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0B0]">
                      {task.attachments && task.attachments.length > 0 ? (
                        <div>
                          <div className="text-sm">{task.attachments.length} file(s)</div>
                          <div className="mt-1 space-y-1">
                            {task.attachments.slice(0, 2).map((attachment) => (
                              <div key={attachment._id} className="flex items-center justify-between bg-[#14141D] p-2 rounded">
                                <a 
                                  href={attachment.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[#4A90E2] hover:text-[#50E3C2] text-xs truncate flex-1 mr-2"
                                  title={attachment.name}
                                >
                                  {attachment.name}
                                </a>
                                <button
                                  onClick={() => deleteAttachment(task._id, attachment._id)}
                                  className="text-red-500 hover:text-red-400 text-xs"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ))}
                            {task.attachments.length > 2 && (
                              <div className="text-xs text-[#A0A0B0]">
                                +{task.attachments.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#A0A0B0]">No attachments</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/admin/tasks/edit/${task._id}`)}
                        className="text-[#4A90E2] hover:text-[#3a7bc8] mr-3"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44] p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#2D2D44]">
            <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-6 text-xl font-medium text-white">No tasks found</h3>
          <p className="mt-2 text-gray-400">
            {filteredTasks.length === 0 && tasks.length > 0
              ? "No tasks match your current filters."
              : "Get started by creating your first task."}
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigate('/admin/tasks/new')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#4A90E2] hover:bg-[#3a7bc8] transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-[#4A90E2]/20"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;