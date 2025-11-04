import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../utils/apiHelper';

const AdminProjectForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'medium',
    status: 'not_started',
    owner: ''
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch('/api/users', {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        });
        
        if (res.ok) {
          const usersData = await res.json();
          setUsers(usersData);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    const fetchProject = async () => {
      if (id) {
        setIsEditing(true);
        try {
          const token = localStorage.getItem('token');
          const res = await apiFetch(`/api/admin/projects/${id}`, {
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            }
          });
          
          if (res.ok) {
            const project = await res.json();
            setFormData({
              name: project.name,
              description: project.description,
              startDate: project.startDate.split('T')[0],
              endDate: project.endDate.split('T')[0],
              priority: project.priority,
              status: project.status,
              owner: project.owner?._id || ''
            });
            
            // Set existing attachments
            if (project.attachments) {
              setExistingAttachments(project.attachments);
            }
          }
        } catch (err) {
          console.error('Error fetching project:', err);
        }
      }
      setLoading(false);
    };

    fetchUsers();
    fetchProject();
  }, [id]);

  const { name, description, startDate, endDate, priority, status, owner } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const removeExistingAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch(`/api/admin/projects/${id}/attachments/${attachmentId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token
          }
        });

        if (res.ok) {
          setExistingAttachments(existingAttachments.filter(attachment => attachment._id !== attachmentId));
        } else {
          const data = await res.json();
          alert(data.msg || 'Failed to delete attachment');
        }
      } catch (err) {
        console.error('Error deleting attachment:', err);
        alert('Failed to delete attachment');
      }
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = `/api/admin/projects/${id}`;
      const method = isEditing ? 'PUT' : 'POST';
      
      // For new projects, send as JSON
      if (!isEditing) {
        const res = await apiFetch('/api/admin/projects', {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          navigate('/admin/projects');
        } else {
          const data = await res.json();
          alert(data.msg || 'Failed to save project');
        }
      } else {
        // For existing projects, we need to handle both form data and file uploads
        // First update the project details
        const projectRes = await apiFetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(formData)
        });
        
        if (!projectRes.ok) {
          const data = await projectRes.json();
          alert(data.msg || 'Failed to save project');
          return;
        }
        
        // Then upload files if any
        if (files.length > 0) {
          const formDataObj = new FormData();
          files.forEach(file => {
            formDataObj.append('attachments', file);
          });
          
          const attachmentRes = await apiFetch(`/api/admin/projects/${id}/attachments`, {
            method: 'POST',
            headers: {
              'x-auth-token': token
            },
            body: formDataObj
          });
          
          if (!attachmentRes.ok) {
            const data = await attachmentRes.json();
            alert(data.msg || 'Failed to upload attachments');
          }
        }
        
        navigate('/admin/projects');
      }
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Failed to save project');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A90E2]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/projects')}
          className="flex items-center text-[#4A90E2] hover:text-[#50E3C2] mb-4"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Admin Projects
        </button>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </h1>
      </div>
      
      <div className="bg-[#1F1F2E] rounded-lg border border-[#2D2D44] p-6">
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                required
                className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                Owner
              </label>
              <select
                name="owner"
                value={owner}
                onChange={onChange}
                className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              >
                <option value="">Select owner</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={startDate}
                onChange={onChange}
                required
                className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={endDate}
                onChange={onChange}
                required
                className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={priority}
                onChange={onChange}
                className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                Status
              </label>
              <select
                name="status"
                value={status}
                onChange={onChange}
                className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={description}
              onChange={onChange}
              required
              rows="4"
              className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              placeholder="Enter project description"
            ></textarea>
          </div>
          
          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
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
            
            {/* Existing Attachments */}
            {existingAttachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Existing Attachments:</h4>
                <ul className="space-y-2">
                  {existingAttachments.map((attachment) => (
                    <li key={attachment._id} className="flex items-center justify-between text-sm text-gray-400 bg-[#1F1F2E] p-2 rounded">
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#4A90E2] hover:text-[#50E3C2] truncate flex-1 mr-2"
                        title={attachment.name}
                      >
                        {attachment.name}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(attachment._id)}
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
            
            {/* New Files */}
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">New Files:</h4>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between text-sm text-gray-400 bg-[#1F1F2E] p-2 rounded">
                      <span className="truncate flex-1 mr-2">{file.name}</span>
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
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/projects')}
              className="px-4 py-2 border border-[#2D2D44] text-[#A0A0B0] rounded-md hover:bg-[#14141D]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#3a7bc8]"
            >
              {isEditing ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProjectForm;