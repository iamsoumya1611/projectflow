import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TaskForm = ({ task, projects, users, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignee: 'self',
    priority: 'medium',
    status: 'todo',
    startDate: '',
    dueDate: '',
    submissionStatus: 'not_submitted'
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project: task.project?._id || '',
        assignee: task.assignee?._id || 'self',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        submissionStatus: task.submissionStatus || 'not_submitted'
      });
    }
  }, [task]);

  const { title, description, project, assignee, priority, status, startDate, dueDate, submissionStatus } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!project) {
      newErrors.project = 'Project is required';
    }

    // Convert string dates to Date objects for comparison
    if (startDate && dueDate) {
      const startDateObj = new Date(startDate);
      const dueDateObj = new Date(dueDate);
      
      if (isNaN(startDateObj.getTime()) || isNaN(dueDateObj.getTime())) {
        newErrors.startDate = 'Invalid date format';
        newErrors.dueDate = 'Invalid date format';
      } else if (startDateObj > dueDateObj) {
        newErrors.dueDate = 'Due date must be after start date';
      }
    }

    // Validate file uploads
    if (files.length > 5) {
      newErrors.files = 'You can only upload up to 5 files';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const url = task ? `/api/tasks/${task._id}` : '/api/tasks';
      const method = task ? 'PUT' : 'POST';

      // Handle assignee value properly
      let assigneeValue = null;
      if (assignee === 'self') {
        assigneeValue = 'self';
      } else if (assignee === 'unassigned') {
        assigneeValue = 'unassigned';
      } else if (assignee) {
        assigneeValue = assignee;
      }

      // Create FormData for file uploads
      const formDataObj = new FormData();
      formDataObj.append('title', title);
      formDataObj.append('description', description);
      formDataObj.append('project', project);
      formDataObj.append('assignee', assigneeValue);
      formDataObj.append('priority', priority);
      formDataObj.append('status', status);
      formDataObj.append('startDate', startDate);
      formDataObj.append('dueDate', dueDate);
      
      // For team members submitting progress, set submission status to submitted
      const finalSubmissionStatus = task ? 'submitted' : submissionStatus;
      formDataObj.append('submissionStatus', finalSubmissionStatus);
      
      // Add user property for task creation
      if (!task) {
        const token = localStorage.getItem('token');
        const userRes = await fetch('/api/auth/me', {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          formDataObj.append('user', userData.id);
        }
      }

      // Add files to formData
      files.forEach(file => {
        formDataObj.append('attachments', file);
      });

      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'x-auth-token': token
        },
        body: formDataObj
      });

      const data = await res.json();

      if (res.ok) {
        // If this is a progress submission (existing task), also update submission status
        if (task) {
          await fetch(`/api/tasks/${task._id}/submission`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({ submissionStatus: 'submitted' })
          });
        }
        
        onSuccess(data);
        onCancel();
      } else {
        setErrors({ general: data.msg || 'Failed to save task' });
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44] p-6">
      <h2 className="text-xl font-bold text-white mb-6">
        {task ? 'Update Task Progress' : 'Submit Task Progress'}
      </h2>

      {errors.general && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {errors.general}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* For team members, we'll keep all fields editable */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">
            Task Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={onChange}
            // Removed readOnly restriction - now editable for all tasks
            className={`p-2 mt-1 block w-full rounded-md border ${
              errors.title ? 'border-red-500' : 'border-gray-600'
            } bg-[#2D2D44] text-white shadow-sm focus:border-[#4A90E2] focus:ring-[#4A90E2] sm:text-sm`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            Progress Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={5}
            value={description}
            onChange={onChange}
            placeholder="Describe the progress made on this task..."
            className={`p-2 mt-1 block w-full rounded-md border ${
              errors.description ? 'border-red-500' : 'border-gray-600'
            } bg-[#2D2D44] text-white shadow-sm focus:border-[#4A90E2] focus:ring-[#4A90E2] sm:text-sm`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-300">
              Project
            </label>
            <select
              id="project"
              name="project"
              value={project}
              onChange={onChange}
              // Removed disabled restriction - now selectable for all tasks
              className={`p-2 mt-1 block w-full rounded-md border ${
                errors.project ? 'border-red-500' : 'border-gray-600'
              } bg-[#2D2D44] text-white shadow-sm focus:border-[#4A90E2] focus:ring-[#4A90E2] sm:text-sm`}
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.project && (
              <p className="mt-1 text-sm text-red-500">{errors.project}</p>
            )}
            {errors.files && (
              <p className="mt-1 text-sm text-red-500">{errors.files}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={onChange}
              className="p-2 mt-1 block w-full rounded-md border border-gray-600 bg-[#2D2D44] text-white shadow-sm focus:border-[#4A90E2] focus:ring-[#4A90E2] sm:text-sm"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Attachments
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md bg-[#2D2D44]">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-[#4A90E2] hover:text-[#3a7bc8]"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-400">
                PNG, JPG, PDF up to 5 files
              </p>
            </div>
          </div>
          
          {/* File List */}
          {files.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Files:</h4>
              <ul className="space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between text-sm text-gray-400 bg-[#1F1F2E] p-2 rounded">
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-600 text-sm font-medium rounded-md text-white bg-[#1F1F2E] hover:bg-[#2D2D44]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4A90E2] hover:bg-[#3a7bc8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2] disabled:opacity-50"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <span>{task ? 'Update Progress' : 'Submit Progress'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;