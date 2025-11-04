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

const Analytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await apiFetch(`/api/analytics/dashboard`, {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setAnalytics(data);
      } else {
        setError(data.msg || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Chart data configurations
  const projectStatusData = {
    labels: ['Not Started', 'In Progress', 'On Hold', 'Completed'],
    datasets: [
      {
        label: 'Projects',
        data: [
          analytics?.projectsByStatus?.not_started?.length || 0,
          analytics?.projectsByStatus?.in_progress?.length || 0,
          analytics?.projectsByStatus?.on_hold?.length || 0,
          analytics?.projectsByStatus?.completed?.length || 0
        ],
        backgroundColor: [
          'rgba(74, 144, 226, 0.7)',
          'rgba(80, 227, 194, 0.7)',
          'rgba(245, 166, 35, 0.7)',
          'rgba(126, 211, 33, 0.7)'
        ],
        borderColor: [
          'rgba(74, 144, 226, 1)',
          'rgba(80, 227, 194, 1)',
          'rgba(245, 166, 35, 1)',
          'rgba(126, 211, 33, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const taskPriorityData = {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [
      {
        label: 'Tasks',
        data: [
          analytics?.tasksByPriority?.low?.length || 0,
          analytics?.tasksByPriority?.medium?.length || 0,
          analytics?.tasksByPriority?.high?.length || 0,
          analytics?.tasksByPriority?.urgent?.length || 0
        ],
        backgroundColor: [
          'rgba(74, 144, 226, 0.7)',
          'rgba(80, 227, 194, 0.7)',
          'rgba(245, 166, 35, 0.7)',
          'rgba(208, 2, 27, 0.7)'
        ],
        borderColor: [
          'rgba(74, 144, 226, 1)',
          'rgba(80, 227, 194, 1)',
          'rgba(245, 166, 35, 1)',
          'rgba(208, 2, 27, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const taskStatusData = {
    labels: ['To Do', 'In Progress', 'Review', 'Done'],
    datasets: [
      {
        label: 'Tasks',
        data: [
          analytics?.tasksByStatus?.todo?.length || 0,
          analytics?.tasksByStatus?.in_progress?.length || 0,
          analytics?.tasksByStatus?.review?.length || 0,
          analytics?.tasksByStatus?.done?.length || 0
        ],
        backgroundColor: [
          'rgba(74, 144, 226, 0.7)',
          'rgba(80, 227, 194, 0.7)',
          'rgba(245, 166, 35, 0.7)',
          'rgba(126, 211, 33, 0.7)'
        ],
        borderColor: [
          'rgba(74, 144, 226, 1)',
          'rgba(80, 227, 194, 1)',
          'rgba(245, 166, 35, 1)',
          'rgba(126, 211, 33, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Projects Completed',
        data: [10, 15, 20, 25, 30, 35],
        borderColor: 'rgba(74, 144, 226, 1)',
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        tension: 0.4
      },
      {
        label: 'Tasks Completed',
        data: [50, 75, 100, 125, 150, 175],
        borderColor: 'rgba(80, 227, 194, 1)',
        backgroundColor: 'rgba(80, 227, 194, 0.2)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#FFFFFF'
        }
      },
      title: {
        display: true,
        color: '#FFFFFF'
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#A0A0B0'
        },
        grid: {
          color: '#2D2D44'
        }
      },
      y: {
        ticks: {
          color: '#A0A0B0'
        },
        grid: {
          color: '#2D2D44'
        }
      }
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

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-gray-400">Comprehensive insights into your project and task performance</p>
      </div>

      {/* Time Range Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex space-x-2 mb-4 sm:mb-0">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeRange === 'week'
                  ? 'bg-[#4A90E2] text-white'
                  : 'bg-[#2D2D44] text-gray-300 hover:bg-[#3a3a5a]'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeRange === 'month'
                  ? 'bg-[#4A90E2] text-white'
                  : 'bg-[#2D2D44] text-gray-300 hover:bg-[#3a3a5a]'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeRange === 'all'
                  ? 'bg-[#4A90E2] text-white'
                  : 'bg-[#2D2D44] text-gray-300 hover:bg-[#3a3a5a]'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-[#2D2D44]">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-[#4A90E2] text-[#4A90E2]'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-[#4A90E2] text-[#4A90E2]'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                  <p className="text-2xl font-semibold text-white">{analytics?.projectStats?.total || 0}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <span className="text-gray-400">Completed: </span>
                  <span className="ml-2 text-white">{analytics?.projectStats?.completed || 0}</span>
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
                  <p className="text-2xl font-semibold text-white">{analytics?.taskStats?.total || 0}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <span className="text-gray-400">Completed: </span>
                  <span className="ml-2 text-white">{analytics?.taskStats?.completed || 0}</span>
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
                  <p className="text-2xl font-semibold text-white">{analytics?.projectCompletionRate || 0}%</p>
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
                  <p className="text-2xl font-semibold text-white">{analytics?.taskCompletionRate || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#1F1F2E] rounded-lg shadow p-6 border border-[#2D2D44]">
              <h3 className="text-lg font-medium text-white mb-4">Project Status Distribution</h3>
              <Pie data={projectStatusData} options={chartOptions} />
            </div>
            <div className="bg-[#1F1F2E] rounded-lg shadow p-6 border border-[#2D2D44]">
              <h3 className="text-lg font-medium text-white mb-4">Task Priority Distribution</h3>
              <Pie data={taskPriorityData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-[#1F1F2E] rounded-lg shadow p-6 border border-[#2D2D44] mb-8">
            <h3 className="text-lg font-medium text-white mb-4">Completion Trends</h3>
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div>
          <div className="bg-[#1F1F2E] rounded-lg shadow p-6 border border-[#2D2D44] mb-8">
            <h3 className="text-lg font-medium text-white mb-4">Project Status Distribution</h3>
            <Bar data={projectStatusData} options={chartOptions} />
          </div>
          
          <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#2D2D44]">
              <h3 className="text-lg font-medium text-white">Project Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#2D2D44]">
                <thead className="bg-[#2D2D44]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Project
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Completion
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#1F1F2E] divide-y divide-[#2D2D44]">
                  {analytics?.projects?.map((project) => (
                    <tr key={project._id} className="hover:bg-[#2D2D44]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{project.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          project.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {project.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {project.taskCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div 
                              className="h-full bg-[#4A90E2] rounded-full"
                              style={{ width: `${project.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-400">{project.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#1F1F2E] rounded-lg shadow p-6 border border-[#2D2D44]">
              <h3 className="text-lg font-medium text-white mb-4">Task Status Distribution</h3>
              <Bar data={taskStatusData} options={chartOptions} />
            </div>
            <div className="bg-[#1F1F2E] rounded-lg shadow p-6 border border-[#2D2D44]">
              <h3 className="text-lg font-medium text-white mb-4">Task Priority Distribution</h3>
              <Bar data={taskPriorityData} options={chartOptions} />
            </div>
          </div>
          
          <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#2D2D44]">
              <h3 className="text-lg font-medium text-white">Task Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#2D2D44]">
                <thead className="bg-[#2D2D44]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Task
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Project
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#1F1F2E] divide-y divide-[#2D2D44]">
                  {analytics?.tasks?.map((task) => (
                    <tr key={task._id} className="hover:bg-[#2D2D44]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{task.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {task.project?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.status === 'done' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ')}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;