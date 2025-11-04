import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import Spinner from '../layout/Spinner';
import ProjectItem from './ProjectItem';
import ProjectForm from './ProjectForm';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setProjects(data);
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

  const addProject = (project) => {
    setProjects([project, ...projects]);
  };

  const updateProject = (updatedProject) => {
    setProjects(projects.map(project => 
      project._id === updatedProject._id ? updatedProject : project
    ));
  };

  const deleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/projects/${id}`, {
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

  const editProject = (project) => {
    setCurrentProject(project);
    setShowForm(true);
  };

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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-2">Manage all your projects in one place</p>
        </div>
        <button
          onClick={() => {
            setCurrentProject(null);
            setShowForm(true);
          }}
          className="mt-4 md:mt-0 bg-[#4A90E2] hover:bg-[#3a7bc8] text-white px-6 py-3 rounded-lg flex items-center transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-[#4A90E2]/20"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Project
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

      {showForm ? (
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44] p-6 mb-8">
          <ProjectForm
            project={currentProject}
            onSuccess={currentProject ? updateProject : addProject}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectItem
              key={project._id}
              project={project}
              onEdit={editProject}
              onDelete={deleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44] p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#2D2D44]">
            <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mt-6 text-xl font-medium text-white">No projects yet</h3>
          <p className="mt-2 text-gray-400">Get started by creating your first project.</p>
          <div className="mt-8">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#4A90E2] hover:bg-[#3a7bc8] transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-[#4A90E2]/20"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create your first project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;