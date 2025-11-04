import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/apiHelper';

const ProjectForm = ({ project, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    startDate: project?.startDate ? project.startDate.split('T')[0] : '',
    endDate: project?.endDate ? project.endDate.split('T')[0] : '',
    priority: project?.priority || 'medium',
    status: project?.status || 'not_started'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { name, description, startDate, endDate, priority, status } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const url = project ? `/api/projects/${project._id}` : '/api/projects';
      const method = project ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');
      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess(data);
        onCancel();
      } else {
        setErrors({ general: data.msg || 'Failed to save project' });
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
        {project ? 'Edit Project' : 'Create New Project'}
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
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Project Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={onChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.name ? 'border-red-500' : 'border-gray-600'
            } bg-[#2D2D44] text-white shadow-sm focus:border-[#4A90E2] focus:ring-[#4A90E2] sm:text-sm`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={description}
            onChange={onChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.description ? 'border-red-500' : 'border-gray-600'
            } bg-[#2D2D44] text-white shadow-sm focus:border-[#4A90E2] focus:ring-[#4A90E2] sm:text-sm`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={startDate}
              onChange={onChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.startDate ? 'border-red-500' : 'border-gray-600'
              } bg-[#2D2D44] text-white shadow-sm focus:border-[#4A90E2] focus:ring-[#4A90E2] sm:text-sm`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={endDate}
              onChange={onChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.endDate ? 'border-red-500' : 'border-gray-600'
              } bg-[#2D2D44] text-white shadow-sm focus:border-[#4A90E2] focus:ring-[#4A90E2] sm:text-sm`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-300">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={priority}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-[#2D2D44] text-white shadow-sm focus:border-[#4A90E2] focus:ring-[#4A90E2] sm:text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
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
              className="mt-1 block w-full rounded-md border border-gray-600 bg-[#2D2D44] text-white shadow-sm focus:border-[#4A90E2] focus:ring-[#4A90E2] sm:text-sm"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
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
              <span>{project ? 'Update Project' : 'Create Project'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;