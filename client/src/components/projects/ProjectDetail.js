import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TaskItem from '../tasks/TaskItem';
import Spinner from '../layout/Spinner';
import { apiFetch } from '../../utils/apiHelper';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch(`/api/projects/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setProject(data);
      } else {
        setError(data.msg || 'Failed to fetch project');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch(`/api/tasks/project/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setTasks(data);
      } else {
        console.error('Failed to fetch tasks:', data.msg);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setCommentLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch(`/api/projects/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ text: newComment })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setProject({
          ...project,
          comments: data
        });
        setNewComment('');
      } else {
        setError(data.msg || 'Failed to add comment');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch(`/api/projects/${id}/comment/${commentId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token
          }
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setProject({
            ...project,
            comments: data
          });
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
      case 'not_started':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'on_hold':
        return 'On Hold';
      case 'completed':
        return 'Completed';
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

  if (!project) {
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
              Project not found
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <Link to="/projects" className="text-[#4A90E2] hover:text-[#50E3C2] flex items-center">
          <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </Link>
      </div>

      <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <p className="mt-2 text-gray-400">{project.description}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Priority</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(project.priority)}`}>
                {project.priority?.charAt(0).toUpperCase() + project.priority?.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-400">Created Date</p>
              <p className="text-white">{formatDate(project.date)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] mb-6">
        <div className="px-6 py-5 border-b border-[#2D2D44]">
          <h2 className="text-lg font-medium text-white">Tasks</h2>
        </div>
        <div className="p-6">
          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {tasks.map(task => (
                <TaskItem key={task._id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">No tasks</h3>
              <p className="mt-1 text-sm text-gray-400">This project doesn't have any tasks yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44]">
        <div className="px-6 py-5 border-b border-[#2D2D44]">
          <h2 className="text-lg font-medium text-white">Comments</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleAddComment} className="mb-6">
            <div>
              <label htmlFor="comment" className="sr-only">
                Add a comment
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="block w-full rounded-md border border-gray-600 bg-[#2D2D44] text-white shadow-sm focus:border-[#4A90E2] focus:ring-[#4A90E2] sm:text-sm"
                placeholder="Add a comment..."
              />
            </div>
            <div className="mt-3">
              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4A90E2] hover:bg-[#3a7bc8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2] disabled:opacity-50"
              >
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>

          {project.comments && project.comments.length > 0 ? (
            <div className="space-y-4">
              {[...project.comments].reverse().map((comment) => (
                <div key={comment._id} className="bg-[#2D2D44] rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{comment.user?.name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(comment.date).toLocaleDateString()} at {new Date(comment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {user && (user.id === comment.user?._id || user.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="mt-2 text-gray-300">
                    {comment.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">No comments</h3>
              <p className="mt-1 text-sm text-gray-400">Be the first to comment on this project.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;