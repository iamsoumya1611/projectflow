import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import Spinner from '../layout/Spinner';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchTask();
    fetchUsers();
  }, [id]);

  const fetchTask = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setTask(data);
        setComments(data.comments || []);
      } else {
        setError(data.msg || 'Failed to fetch task');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
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
        console.error(data.msg || 'Failed to fetch users');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ text: commentText })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setComments(data);
        setCommentText('');
      } else {
        setError(data.msg || 'Failed to add comment');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/tasks/${id}/comment/${commentId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token
          }
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setComments(data);
        } else {
          setError(data.msg || 'Failed to delete comment');
        }
      } catch (err) {
        console.error(err);
        setError('Server error. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'review':
        return 'bg-yellow-500';
      case 'done':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'urgent':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const canEditTask = () => {
    if (!user || !task) return false;
    return user.id === task.user._id || user.id === task.assignee?._id || user.role === 'admin';
  };

  const canDeleteComment = (comment) => {
    if (!user || !comment) return false;
    return user.id === comment.user._id || user.role === 'admin';
  };

  // Handle file download
  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (!task) {
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
              Task not found
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
          <h1 className="text-2xl font-bold text-white">{task.title}</h1>
          <p className="text-gray-400 mt-2">{task.description}</p>
        </div>
        <div className="mt-4 md:mt-0">
          {canEditTask() && (
            <Link
              to={`/tasks/edit/${task._id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4A90E2] hover:bg-[#3a7bc8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2]"
            >
              Edit Task
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6">
            <h2 className="text-lg font-medium text-white mb-4">Task Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Project</p>
                <p className="text-white">{task.project?.name || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Assignee</p>
                <p className="text-white">{task.assignee?.name || 'Unassigned'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Reporter</p>
                <p className="text-white">{task.reporter?.name || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Priority</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
                  {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Start Date</p>
                <p className="text-white">{formatDate(task.startDate)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Due Date</p>
                <p className="text-white">{formatDate(task.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="mt-6 bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6">
              <h2 className="text-lg font-medium text-white mb-4">Attachments</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {task.attachments.map((attachment) => (
                  <div key={attachment._id} className="border border-[#2D2D44] rounded-lg p-3 bg-[#2D2D44]">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-[#4A90E2] flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{attachment.name}</p>
                        <p className="text-xs text-gray-400">
                          {attachment.uploadedBy?.name || 'Unknown user'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(attachment.url, attachment.name)}
                        className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-[#4A90E2] hover:bg-[#3a7bc8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2]"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-6 bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6">
            <h2 className="text-lg font-medium text-white mb-4">Comments</h2>
            
            <form onSubmit={handleAddComment} className="mb-6">
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-300">
                  Add a comment
                </label>
                <div className="mt-1">
                  <textarea
                    id="comment"
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="shadow-sm focus:ring-[#4A90E2] focus:border-[#4A90E2] block w-full sm:text-sm border border-gray-600 bg-[#2D2D44] text-white rounded-md"
                    placeholder="Write your comment here..."
                  />
                </div>
                <div className="mt-3">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#4A90E2] hover:bg-[#3a7bc8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2]"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </form>
            
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="border border-[#2D2D44] rounded-lg p-4 bg-[#2D2D44]">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-[#4A90E2] flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white">{comment.user?.name || 'Unknown User'}</h4>
                          <div className="flex items-center text-xs text-gray-400">
                            <span>{new Date(comment.date).toLocaleDateString()}</span>
                            <span className="mx-1">•</span>
                            <span>{new Date(comment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-300">
                          <p>{comment.text}</p>
                        </div>
                      </div>
                      {canDeleteComment(comment) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="ml-2 flex-shrink-0 text-gray-400 hover:text-red-500"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6 sticky top-6">
            <h2 className="text-lg font-medium text-white mb-4">Task Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Created</p>
                <p className="text-white">{formatDate(task.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Last Updated</p>
                <p className="text-white">{formatDate(task.date)}</p>
              </div>
            </div>
            
            {canEditTask() && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this task?')) {
                      // Handle task deletion
                    }
                  }}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;