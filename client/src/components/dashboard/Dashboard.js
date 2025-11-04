import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { apiFetch } from '../../utils/apiHelper';
import Spinner from '../layout/Spinner';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({});
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch dashboard analytics
        const analyticsRes = await apiFetch('/analytics/dashboard', {
          headers: {
            'x-auth-token': token
          }
        });
        const analyticsData = await analyticsRes.json();
        
        if (analyticsRes.ok) {
          setAnalytics(analyticsData);
        } else {
          setError(analyticsData.msg || 'Failed to fetch analytics');
        }
        
        // Fetch user-specific tasks
        const tasksRes = await apiFetch('/tasks', {
          headers: {
            'x-auth-token': token
          }
        });
        const tasksData = await tasksRes.json();
        
        if (tasksRes.ok) {
          // Filter tasks to show only assigned tasks or created tasks
          const filteredTasks = tasksData.filter(task => 
            (task.assignee && task.assignee._id === user.id) || 
            task.user === user.id
          );
          setUserTasks(filteredTasks.slice(0, 5)); // Show only first 5 tasks
        } else {
          console.error('Failed to fetch tasks:', tasksData.msg);
        }
      } catch (err) {
        console.error(err);
        setError('Server error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
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
    <div className="p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back, {user?.name || 'User'}! Here's what's happening with your tasks today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Projects Card */}
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg p-6 border border-[#2D2D44] hover:border-[#4A90E2] transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Your Projects</h3>
              <p className="text-3xl font-bold text-white mt-2">{analytics?.projectStats?.total || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-[#4A90E2] bg-opacity-20">
              <svg className="h-8 w-8 text-[#4A90E2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-400">Completed: </span>
              <span className="ml-2 text-white font-medium">{analytics?.projectStats?.completed || 0}</span>
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg p-6 border border-[#2D2D44] hover:border-[#50E3C2] transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Your Tasks</h3>
              <p className="text-3xl font-bold text-white mt-2">{userTasks.length || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-[#50E3C2] bg-opacity-20">
              <svg className="h-8 w-8 text-[#50E3C2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-400">Completed: </span>
              <span className="ml-2 text-white font-medium">
                {userTasks.filter(task => task.status === 'done').length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg p-6 border border-[#2D2D44] hover:border-[#7ED321] transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Task Completion</h3>
              <p className="text-3xl font-bold text-white mt-2">
                {userTasks.length > 0 
                  ? Math.round((userTasks.filter(task => task.status === 'done').length / userTasks.length) * 100) 
                  : 0}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-[#7ED321] bg-opacity-20">
              <svg className="h-8 w-8 text-[#7ED321]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 w-full bg-[#2D2D44] rounded-full h-2">
            <div 
              className="bg-[#7ED321] h-2 rounded-full" 
              style={{ 
                width: `${userTasks.length > 0 
                  ? Math.round((userTasks.filter(task => task.status === 'done').length / userTasks.length) * 100) 
                  : 0}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg p-6 border border-[#2D2D44] hover:border-[#F5A623] transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Recent Tasks</h3>
              <p className="text-3xl font-bold text-white mt-2">{userTasks.length || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-[#F5A623] bg-opacity-20">
              <svg className="h-8 w-8 text-[#F5A623]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-400">Assigned: </span>
              <span className="ml-2 text-white font-medium">
                {userTasks.filter(task => task.assignee && task.assignee._id === user.id).length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44]">
            <div className="px-6 py-5 border-b border-[#2D2D44] flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Your Recent Tasks</h3>
              <Link to="/tasks" className="text-[#4A90E2] hover:text-[#50E3C2] text-sm">
                View All
              </Link>
            </div>
            <div className="p-6">
              {userTasks.length > 0 ? (
                <div className="space-y-4">
                  {userTasks.map(task => (
                    <div key={task._id} className="flex items-center justify-between p-4 bg-[#2D2D44] rounded-lg">
                      <div className="flex-1 min-w-0">
                        <Link to={`/tasks/${task._id}`} className="text-white font-medium hover:text-[#4A90E2] truncate block">
                          {task.title}
                        </Link>
                        <p className="text-gray-400 text-sm truncate">
                          {task.project?.name || 'No Project'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'done' ? 'bg-green-500' : 
                          task.status === 'in_progress' ? 'bg-blue-500' : 
                          task.status === 'review' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}>
                          {task.status === 'done' ? 'Done' : 
                           task.status === 'in_progress' ? 'In Progress' : 
                           task.status === 'review' ? 'Review' : 'To Do'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'urgent' ? 'bg-red-500' : 
                          task.priority === 'high' ? 'bg-orange-500' : 
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-white">No tasks</h3>
                  <p className="mt-1 text-sm text-gray-400">You don't have any tasks assigned to you yet.</p>
                  <div className="mt-6">
                    <Link
                      to="/tasks"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#4A90E2] hover:bg-[#3a7bc8]"
                    >
                      View All Tasks
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44]">
          <div className="px-6 py-5 border-b border-[#2D2D44]">
            <h3 className="text-lg font-medium text-white">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Link
                to="/tasks"
                className="flex items-center p-3 bg-[#2D2D44] rounded-lg hover:bg-[#3a3a5a] transition-colors duration-200 group"
              >
                <div className="p-2 rounded-full bg-[#4A90E2] bg-opacity-20 group-hover:bg-opacity-30">
                  <svg className="h-5 w-5 text-[#4A90E2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span className="ml-3 text-white font-medium">View Tasks</span>
              </Link>
              <Link
                to="/projects"
                className="flex items-center p-3 bg-[#2D2D44] rounded-lg hover:bg-[#3a3a5a] transition-colors duration-200 group"
              >
                <div className="p-2 rounded-full bg-[#50E3C2] bg-opacity-20 group-hover:bg-opacity-30">
                  <svg className="h-5 w-5 text-[#50E3C2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="ml-3 text-white font-medium">View Projects</span>
              </Link>
              <Link
                to="/reports"
                className="flex items-center p-3 bg-[#2D2D44] rounded-lg hover:bg-[#3a3a5a] transition-colors duration-200 group"
              >
                <div className="p-2 rounded-full bg-[#F5A623] bg-opacity-20 group-hover:bg-opacity-30">
                  <svg className="h-5 w-5 text-[#F5A623]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="ml-3 text-white font-medium">View Reports</span>
              </Link>
              <Link
                to="/chat"
                className="flex items-center p-3 bg-[#2D2D44] rounded-lg hover:bg-[#3a3a5a] transition-colors duration-200 group"
              >
                <div className="p-2 rounded-full bg-[#9B59B6] bg-opacity-20 group-hover:bg-opacity-30">
                  <svg className="h-5 w-5 text-[#9B59B6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="ml-3 text-white font-medium">Team Chat</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;