import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/apiHelper';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          'x-auth-token': token
        };

        // Fetch users
        const usersRes = await apiFetch('/api/admin/users', {
          headers
        });
        const usersData = await usersRes.json();
        setUsers(usersData);

        // Fetch projects
        const projectsRes = await apiFetch('/api/admin/projects', {
          headers
        });
        const projectsData = await projectsRes.json();
        setProjects(projectsData);

        // Fetch tasks
        const tasksRes = await apiFetch('/api/admin/tasks', {
          headers
        });
        const tasksData = await tasksRes.json();
        setTasks(tasksData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all their projects and tasks.')) {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        });

        if (res.ok) {
          setUsers(users.filter(user => user._id !== userId));
        } else {
          const data = await res.json();
          alert(data.msg || 'Failed to delete user');
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user');
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch(`/api/admin/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        });

        if (res.ok) {
          setProjects(projects.filter(project => project._id !== projectId));
        } else {
          const data = await res.json();
          alert(data.msg || 'Failed to delete project');
        }
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project');
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch(`/api/admin/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        });

        if (res.ok) {
          setTasks(tasks.filter(task => task._id !== taskId));
        } else {
          const data = await res.json();
          alert(data.msg || 'Failed to delete task');
        }
      } catch (err) {
        console.error('Error deleting task:', err);
        alert('Failed to delete task');
      }
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(user => user._id === userId ? updatedUser : user));
      } else {
        const data = await res.json();
        alert(data.msg || 'Failed to update user role');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-[#A0A0B0]">Manage users, projects, and tasks</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1F1F2E] rounded-lg p-6 border border-[#2D2D44]">
          <div className="flex items-center">
            <div className="rounded-full bg-[#4A90E2] p-3">
              <i className="fas fa-users text-white"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[#A0A0B0]">Total Users</p>
              <p className="text-2xl font-semibold text-white">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1F1F2E] rounded-lg p-6 border border-[#2D2D44]">
          <div className="flex items-center">
            <div className="rounded-full bg-[#50E3C2] p-3">
              <i className="fas fa-project-diagram text-white"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[#A0A0B0]">Total Projects</p>
              <p className="text-2xl font-semibold text-white">{projects.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1F1F2E] rounded-lg p-6 border border-[#2D2D44]">
          <div className="flex items-center">
            <div className="rounded-full bg-[#BD10E0] p-3">
              <i className="fas fa-tasks text-white"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[#A0A0B0]">Total Tasks</p>
              <p className="text-2xl font-semibold text-white">{tasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Users</h2>
        </div>
        <div className="bg-[#1F1F2E] rounded-lg border border-[#2D2D44] overflow-hidden">
          <table className="min-w-full divide-y divide-[#2D2D44]">
            <thead className="bg-[#14141D]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#1F1F2E] divide-y divide-[#2D2D44]">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-[#14141D]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#4A90E2] flex items-center justify-center">
                          <span className="text-white font-medium">{user.name.charAt(0)}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0B0]">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleUserRoleChange(user._id, e.target.value)}
                      className="bg-[#14141D] text-white border border-[#2D2D44] rounded-md px-2 py-1 text-sm"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
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

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <button
            onClick={() => navigate('/admin/projects/new')}
            className="bg-[#4A90E2] hover:bg-[#3a7bc8] text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            <i className="fas fa-plus mr-2"></i>New Project
          </button>
        </div>
        <div className="bg-[#1F1F2E] rounded-lg border border-[#2D2D44] overflow-hidden">
          <table className="min-w-full divide-y divide-[#2D2D44]">
            <thead className="bg-[#14141D]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Project</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Owner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#1F1F2E] divide-y divide-[#2D2D44]">
              {projects.map((project) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => navigate(`/admin/projects/edit/${project._id}`)}
                      className="text-[#4A90E2] hover:text-[#3a7bc8] mr-3"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project._id)}
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

      {/* Tasks Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Tasks</h2>
          <button
            onClick={() => navigate('/admin/tasks/new')}
            className="bg-[#4A90E2] hover:bg-[#3a7bc8] text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            <i className="fas fa-plus mr-2"></i>New Task
          </button>
        </div>
        <div className="bg-[#1F1F2E] rounded-lg border border-[#2D2D44] overflow-hidden">
          <table className="min-w-full divide-y divide-[#2D2D44]">
            <thead className="bg-[#14141D]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Task</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Project</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Assignee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Submission</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0B0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#1F1F2E] divide-y divide-[#2D2D44]">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-[#14141D]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{task.title}</div>
                    <div className="text-sm text-[#A0A0B0]">{task.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0B0]">
                    {task.project?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0B0]">
                    {task.assignee?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.submissionStatus === 'submitted' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.submissionStatus === 'submitted' ? 'Submitted' : 'Not Submitted'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => navigate(`/admin/tasks/edit/${task._id}`)}
                      className="text-[#4A90E2] hover:text-[#3a7bc8] mr-3"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
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
    </div>
  );
};

export default AdminDashboard;