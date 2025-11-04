import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../layout/Spinner';
import { apiFetch } from '../../utils/apiHelper';

const AdminProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    owner: 'all'
  });

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch('/api/admin/projects', {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();

      if (res.ok) {
        // Populate attachments with user info
        const projectsWithAttachments = await Promise.all(data.map(async (project) => {
          if (project.attachments && project.attachments.length > 0) {
            // Fetch user info for each attachment
            const attachmentsWithUsers = await Promise.all(project.attachments.map(async (attachment) => {
              if (attachment.uploadedBy) {
                try {
                  const userRes = await apiFetch(`/api/users/${attachment.uploadedBy}`, {
                    headers: {
                      'x-auth-token': token
                    }
                  });
                  if (userRes.ok) {
                    const userData = await userRes.json();
                    return { ...attachment, uploadedBy: userData };
                  }
                } catch (err) {
                  console.error('Error fetching user data:', err);
                }
              }
              return attachment;
            }));
            return { ...project, attachments: attachmentsWithUsers };
          }
          return project;
        }));
        setProjects(projectsWithAttachments);
      } else {
        setError(data.msg || 'Failed to fetch projects');
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
      const res = await apiFetch('/api/users', {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();

      if (res.ok) {
        setUsers(data);
      } else {
        console.error('Failed to fetch users:', data.msg);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const deleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch(`/api/admin/projects/${id}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token
          }
        });

        if (res.ok) {
          setProjects(projects.filter(project => project._id !== id));
        } else {
          const data = await res.json();
          setError(data.msg || 'Failed to delete project');
        }
      } catch (err) {
        console.error(err);
        setError('Server error. Please try again.');
      }
    }
  };

  const deleteAttachment = async (projectId, attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch(`/api/admin/projects/${projectId}/attachments/${attachmentId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token
          }
        });

        if (res.ok) {
          // Update the project in state to remove the attachment
          setProjects(projects.map(project => {
            if (project._id === projectId) {
              return {
                ...project,
                attachments: project.attachments.filter(attachment => attachment._id !== attachmentId)
              };
            }
            return project;
          }));
        } else {
          const data = await res.json();
          setError(data.msg || 'Failed to delete attachment');
        }
      } catch (err) {
        console.error(err);
        setError('Server error. Please try again.');
      }
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      owner: 'all'
    });
  };

  // Filter projects based on selected filters
  const filteredProjects = projects.filter(project => {
    // Status filter
    if (filters.status !== 'all' && project.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority !== 'all' && project.priority !== filters.priority) {
      return false;
    }

    // Owner filter
    if (filters.owner !== 'all') {
      if (filters.owner === 'no_owner' && project.owner) {
        return false;
      }
      if (filters.owner !== 'no_owner' && (!project.owner || project.owner._id !== filters.owner)) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Create Projects</h1>
          <p className="text-gray-400 mt-2">Manage all projects in the system</p>
        </div>
        <button
          onClick={() => navigate('/admin/projects/new')}
          className="mt-4 md:mt-0 bg-[#4A90E2] hover:bg-[#3a7bc8] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-[#4A90E2]/20"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Project
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
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
      )}

      {/* Filters */}
      <div className="bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44] p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Filter Projects</h2>
          <button
            onClick={clearFilters}
            className="mt-2 md:mt-0 text-sm text-[#4A90E2] hover:text-[#50E3C2] transition-colors duration-200"
          >
            Clear all filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-[#14141D] border border-[#2D2D44] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full bg-[#14141D] border border-[#2D2D44] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Owner</label>
            <select
              value={filters.owner}
              onChange={(e) => handleFilterChange('owner', e.target.value)}
              className="w-full bg-[#14141D] border border-[#2D2D44] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
            >
              <option value="all">All Owners</option>
              <option value="no_owner">No Owner</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2D2D44]">
              <thead className="bg-[#14141D]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Project</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Owner</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Date Range</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Attachments</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#1F1F2E] divide-y divide-[#2D2D44]">
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-[#14141D]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{project.name}</div>
                      <div className="text-sm text-[#A0A0B0]">{project.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0B0]">
                      {project.owner?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0B0]">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0B0]">
                      {project.attachments && project.attachments.length > 0 ? (
                        <div>
                          <div className="text-sm">{project.attachments.length} file(s)</div>
                          <div className="mt-1 space-y-1">
                            {project.attachments.slice(0, 2).map((attachment) => (
                              <div key={attachment._id} className="flex items-center justify-between bg-[#14141D] p-2 rounded">
                                <a 
                                  href={attachment.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[#4A90E2] hover:text-[#50E3C2] text-xs truncate flex-1 mr-2"
                                  title={attachment.name}
                                >
                                  {attachment.name}
                                </a>
                                <button
                                  onClick={() => deleteAttachment(project._id, attachment._id)}
                                  className="text-red-500 hover:text-red-400 text-xs"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ))}
                            {project.attachments.length > 2 && (
                              <div className="text-xs text-[#A0A0B0]">
                                +{project.attachments.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#A0A0B0]">No attachments</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/admin/projects/edit/${project._id}`)}
                        className="text-[#4A90E2] hover:text-[#3a7bc8] mr-3"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => deleteProject(project._id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44] p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#2D2D44]">
            <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mt-6 text-xl font-medium text-white">No projects found</h3>
          <p className="mt-2 text-gray-400">
            {filteredProjects.length === 0 && projects.length > 0
              ? "No projects match your current filters."
              : "Get started by creating your first project."}
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigate('/admin/projects/new')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#4A90E2] hover:bg-[#3a7bc8] transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-[#4A90E2]/20"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;