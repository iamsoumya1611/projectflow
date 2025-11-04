import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import Spinner from '../layout/Spinner';
import { apiFetch } from '../../utils/apiHelper';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Reporting = () => {
  const [analytics, setAnalytics] = useState({
    dashboard: {},
    projects: {},
    tasks: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch dashboard analytics
      const dashboardRes = await apiFetch('/api/analytics/dashboard', {
        headers: {
          'x-auth-token': token
        }
      });
      const dashboardData = await dashboardRes.json();
      
      // Fetch project analytics
      const projectsRes = await apiFetch('/api/analytics/projects', {
        headers: {
          'x-auth-token': token
        }
      });
      const projectsData = await projectsRes.json();
      
      // Fetch task analytics
      const tasksRes = await apiFetch('/api/analytics/tasks', {
        headers: {
          'x-auth-token': token
        }
      });
      const tasksData = await tasksRes.json();
      
      if (dashboardRes.ok && projectsRes.ok && tasksRes.ok) {
        setAnalytics({
          dashboard: dashboardData,
          projects: projectsData,
          tasks: tasksData
        });
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
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

  // Project status chart data
  const projectStatusData = {
    labels: ['Not Started', 'In Progress', 'On Hold', 'Completed'],
    datasets: [
      {
        label: 'Projects',
        data: [
          analytics.projects.projectsByStatus.not_started?.length || 0,
          analytics.projects.projectsByStatus.in_progress?.length || 0,
          analytics.projects.projectsByStatus.on_hold?.length || 0,
          analytics.projects.projectsByStatus.completed?.length || 0
        ],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          'rgba(156, 163, 175, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Task status chart data
  const taskStatusData = {
    labels: ['To Do', 'In Progress', 'Review', 'Done'],
    datasets: [
      {
        label: 'Tasks',
        data: [
          analytics.tasks.tasksByStatus.todo?.length || 0,
          analytics.tasks.tasksByStatus.in_progress?.length || 0,
          analytics.tasks.tasksByStatus.review?.length || 0,
          analytics.tasks.tasksByStatus.done?.length || 0
        ],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          'rgba(156, 163, 175, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Task priority chart data
  const taskPriorityData = {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [
      {
        label: 'Tasks',
        data: [
          analytics.tasks.tasksByPriority.low?.length || 0,
          analytics.tasks.tasksByPriority.medium?.length || 0,
          analytics.tasks.tasksByPriority.high?.length || 0,
          analytics.tasks.tasksByPriority.urgent?.length || 0
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Project completion trend data (mock data for demonstration)
  const projectTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Completed Projects',
        data: [2, 5, 7, 10, 12, 15],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.1
      }
    ]
  };

  // Task completion trend data (mock data for demonstration)
  const taskTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Completed Tasks',
        data: [15, 28, 42, 56, 72, 95],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-gray-400">Insights into your project and task performance</p>
        </div>
        <div className="mt-4 md:mt-0">
          <label htmlFor="timeRange" className="mr-2 text-gray-400">Time Range:</label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#1F1F2E] border border-[#2D2D44] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#2D2D44] mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-[#4A90E2] text-[#4A90E2]'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-[#4A90E2] text-[#4A90E2]'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-[#4A90E2] text-[#4A90E2]'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Tasks
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1F1F2E] rounded-lg shadow p-6 border border-[#2D2D44]">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#4A90E2] bg-opacity-20">
                  <svg className="h-6 w-6 text-[#4A90E2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-400">Total Projects</h3>
                  <p className="text-2xl font-semibold text-white">{analytics.dashboard.projectStats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1F1F2E] rounded-lg shadow p-6 border border-[#2D2D44]">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#50E3C2] bg-opacity-20">
                  <svg className="h-6 w-6 text-[#50E3C2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-400">Total Tasks</h3>
                  <p className="text-2xl font-semibold text-white">{analytics.dashboard.taskStats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1F1F2E] rounded-lg shadow p-6 border border-[#2D2D44]">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#7ED321] bg-opacity-20">
                  <svg className="h-6 w-6 text-[#7ED321]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-400">Project Completion</h3>
                  <p className="text-2xl font-semibold text-white">{analytics.dashboard.projectCompletionRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1F1F2E] rounded-lg shadow p-6 border border-[#2D2D44]">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#F5A623] bg-opacity-20">
                  <svg className="h-6 w-6 text-[#F5A623]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-400">Task Completion</h3>
                  <p className="text-2xl font-semibold text-white">{analytics.dashboard.taskCompletionRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6">
              <h3 className="text-lg font-medium text-white mb-4">Project Status Distribution</h3>
              <Bar data={projectStatusData} />
            </div>
            <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6">
              <h3 className="text-lg font-medium text-white mb-4">Task Status Distribution</h3>
              <Bar data={taskStatusData} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6">
              <h3 className="text-lg font-medium text-white mb-4">Task Priority Distribution</h3>
              <Pie data={taskPriorityData} />
            </div>
            <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6">
              <h3 className="text-lg font-medium text-white mb-4">Completion Trends</h3>
              <Line 
                data={projectTrendData} 
                options={{
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div>
          <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6 mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Projects by Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Not Started</h4>
                <p className="text-2xl font-semibold text-white">{analytics.projects.projectsByStatus.not_started?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">In Progress</h4>
                <p className="text-2xl font-semibold text-white">{analytics.projects.projectsByStatus.in_progress?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">On Hold</h4>
                <p className="text-2xl font-semibold text-white">{analytics.projects.projectsByStatus.on_hold?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Completed</h4>
                <p className="text-2xl font-semibold text-white">{analytics.projects.projectsByStatus.completed?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6">
            <h3 className="text-lg font-medium text-white mb-4">Projects by Priority</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Low</h4>
                <p className="text-2xl font-semibold text-white">{analytics.projects.projectsByPriority.low?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Medium</h4>
                <p className="text-2xl font-semibold text-white">{analytics.projects.projectsByPriority.medium?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">High</h4>
                <p className="text-2xl font-semibold text-white">{analytics.projects.projectsByPriority.high?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Urgent</h4>
                <p className="text-2xl font-semibold text-white">{analytics.projects.projectsByPriority.urgent?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div>
          <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6 mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Tasks by Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">To Do</h4>
                <p className="text-2xl font-semibold text-white">{analytics.tasks.tasksByStatus.todo?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">In Progress</h4>
                <p className="text-2xl font-semibold text-white">{analytics.tasks.tasksByStatus.in_progress?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Review</h4>
                <p className="text-2xl font-semibold text-white">{analytics.tasks.tasksByStatus.review?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Done</h4>
                <p className="text-2xl font-semibold text-white">{analytics.tasks.tasksByStatus.done?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6">
            <h3 className="text-lg font-medium text-white mb-4">Tasks by Priority</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Low</h4>
                <p className="text-2xl font-semibold text-white">{analytics.tasks.tasksByPriority.low?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Medium</h4>
                <p className="text-2xl font-semibold text-white">{analytics.tasks.tasksByPriority.medium?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">High</h4>
                <p className="text-2xl font-semibold text-white">{analytics.tasks.tasksByPriority.high?.length || 0}</p>
              </div>
              <div className="bg-[#2D2D44] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Urgent</h4>
                <p className="text-2xl font-semibold text-white">{analytics.tasks.tasksByPriority.urgent?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reporting;