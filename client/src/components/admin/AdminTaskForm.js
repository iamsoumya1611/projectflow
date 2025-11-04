import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AdminTaskForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo',
    submissionStatus: 'not_submitted'
  });
  
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProjectsAndUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          'x-auth-token': token
        };

        // Fetch projects
        const projectsRes = await fetch('/api/admin/projects', {
          headers
        });
        
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

        // Fetch users
        const usersRes = await fetch('/api/users', {
          headers
        });
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    const fetchTask = async () => {
      if (id) {
        setIsEditing(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/admin/tasks/${id}`, {
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            }
          });
          
          if (res.ok) {
            const task = await res.json();
            setFormData({
              title: task.title,
              description: task.description,
              project: task.project?._id || '',
              assignee: task.assignee?._id || '',
              priority: task.priority,
              dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
              status: task.status,
              submissionStatus: task.submissionStatus || 'not_submitted'
            });
            
            // Set existing attachments
            if (task.attachments) {
              setExistingAttachments(task.attachments);
            }
          }
        } catch (err) {
          console.error('Error fetching task:', err);
        }
      }
      setLoading(false);
    };

    fetchProjectsAndUsers();
    fetchTask();
  }, [id]);

  const { title, description, project, assignee, priority, dueDate, status, submissionStatus } = formData;

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
        const res = await fetch(`/api/admin/tasks/${id}/attachments/${attachmentId}`, {
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
      const url = isEditing ? `/api/admin/tasks/${id}` : '/api/admin/tasks';
      const method = isEditing ? 'PUT' : 'POST';
      
      // For new tasks, send as JSON
      if (!isEditing) {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          navigate('/admin/tasks');
        } else {
          const data = await res.json();
          alert(data.msg || 'Failed to save task');
        }
      } else {
        // For existing tasks, we need to handle both form data and file uploads
        // First update the task details
        const taskRes = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(formData)
        });
        
        if (!taskRes.ok) {
          const data = await taskRes.json();
          alert(data.msg || 'Failed to save task');
          return;
        }
        
        // Then upload files if any
        if (files.length > 0) {
          const formDataObj = new FormData();
          files.forEach(file => {
            formDataObj.append('attachments', file);
          });
          
          const attachmentRes = await fetch(`/api/admin/tasks/${id}/attachments`, {
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
        
        navigate('/admin/tasks');
      }
    } catch (err) {
      console.error('Error saving task:', err);
      alert('Failed to save task');
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
          onClick={() => navigate('/admin/tasks')}
          className="flex items-center text-[#4A90E2] hover:text-[#50E3C2] mb-4"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Admin Tasks
        </button>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h1>
      </div>
      
      <div className="bg-[#1F1F2E] rounded-lg border border-[#2D2D44] p-6">
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={onChange}
                required
                className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                placeholder="Enter task title"
              />
            </div>
            
            <div className="md:col-span-2">
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
                placeholder="Enter task description"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                Project *
              </label>
              <select
                name="project"
                value={project}
                onChange={onChange}
                required
                className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              >
                <option value="">Select project</option>
                {projects.map(proj => (
                  <option key={proj._id} value={proj._id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                Assignee
              </label>
              <select
                name="assignee"
                value={assignee}
                onChange={onChange}
                className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
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
                <option value="urgent">Urgent</option>
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
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                Submission Status
              </label>
              <select
                name="submissionStatus"
                value={submissionStatus}
                onChange={onChange}
                className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              >
                <option value="not_submitted">Not Submitted</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={dueDate}
                onChange={onChange}
                className="w-full bg-[#14141D] border border-[#2D2D44] rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              />
            </div>
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
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#4A90E2] hover:bg-[#3a7bc8] text-white font-medium rounded-md transition-colors duration-200"
            >
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTaskForm;