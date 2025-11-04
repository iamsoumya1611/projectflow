import React from 'react';
import { Link } from 'react-router-dom';

const TaskItem = ({ task, onEdit, onDelete }) => {
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge class
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

  // Get status text
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

  // Get priority badge class
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

  return (
    <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/task/${task._id}`} className="text-lg font-medium text-white hover:text-[#4A90E2]">
              {task.title}
            </Link>
            <p className="mt-1 text-sm text-gray-400 line-clamp-2">
              {task.description}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(task)}
              className="text-gray-400 hover:text-[#4A90E2]"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="text-gray-400 hover:text-red-500"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(task.status)}`}>
            {getStatusText(task.status)}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-gray-400">Project</p>
            <p className="text-white">{task.project?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400">Assignee</p>
            <p className="text-white">{task.assignee?.name || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-gray-400">Due Date</p>
            <p className="text-white">{formatDate(task.dueDate)}</p>
          </div>
        </div>

        <div className="mt-4">
          <Link
            to={`/task/${task._id}`}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2D2D44] hover:bg-[#3a3a5a]"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;