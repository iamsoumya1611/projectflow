import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import Spinner from '../layout/Spinner';
import { AuthContext } from '../../context/authContext';
import { apiFetch } from '../../utils/apiHelper';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const { id: projectId } = useParams();
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [filters, setFilters] = useState({
    assignment: 'all',
    status: 'all',
    priority: 'all',
    project: 'all'
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch('/api/tasks', {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();

      if (res.ok) {
        setTasks(data);
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
      const res = await apiFetch('/api/projects', {
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
      const res = await apiFetch('/api/users', {
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

  const addTask = (task) => {
    setTasks([task, ...tasks]);
  };

  const updateTask = (updatedTask) => {
    setTasks(tasks.map(task =>
      task._id === updatedTask._id ? updatedTask : task
    ));
  };

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch(`/api/tasks/${id}`, {
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

  const editTask = (task) => {
    setCurrentTask(task);
    setShowForm(true);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      assignment: 'all',
      status: 'all',
      priority: 'all',
      project: 'all'
    });
  };

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    // Assignment filter
    if (filters.assignment === 'assigned_to_me' && (!task.assignee || task.assignee._id !== user.id)) {
      return false;
    }
    if (filters.assignment === 'created_by_me' && task.user !== user.id) {
      return false;
    }

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

    // Project ID from URL
    if (projectId && (!task.project || task.project._id !== projectId)) {
      return false;
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Tasks</h1>
          <p className="text-gray-400 mt-2">Manage and track all your tasks</p>
        </div>
        <button
          onClick={() => {
            setCurrentTask(null);
            setShowForm(true);
          }}
          className="mt-4 md:mt-0 bg-[#4A90E2] hover:bg-[#3a7bc8] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-[#4A90E2]/20"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
          </svg>
          Submit Progress
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
            <label className="block text-sm font-medium text-gray-400 mb-1">Assignment</label>
            <select
              value={filters.assignment}
              onChange={(e) => handleFilterChange('assignment', e.target.value)}
              className="w-full bg-[#14141D] border border-[#2D2D44] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="assigned_to_me">Assigned to Me</option>
              <option value="created_by_me">Created by Me</option>
            </select>
          </div>

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
        </div>
      </div>

      {showForm ? (
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44] p-6 mb-8">
          <TaskForm
            task={currentTask}
            projects={projects}
            users={users}
            onSuccess={currentTask ? updateTask : addTask}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map(task => (
            <TaskItem
              key={task._id}
              task={task}
              onEdit={editTask}
              onDelete={deleteTask}
            />
          ))}
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
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#4A90E2] hover:bg-[#3a7bc8] transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-[#4A90E2]/20"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
              </svg>
              Submit Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;