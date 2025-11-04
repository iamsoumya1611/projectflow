import config from './config';

const API_BASE_URL = config.API_BASE_URL;

// Generic API fetch function
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'API request failed');
    }
    
    return { data, response };
  } catch (error) {
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    return apiFetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  register: async (userData) => {
    return apiFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Project API functions
export const projectAPI = {
  getAll: async (token) => {
    return apiFetch('/api/projects', {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  getById: async (id, token) => {
    return apiFetch(`/api/projects/${id}`, {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  create: async (projectData, token) => {
    return apiFetch('/api/projects', {
      method: 'POST',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(projectData),
    });
  },
  
  update: async (id, projectData, token) => {
    return apiFetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(projectData),
    });
  },
  
  delete: async (id, token) => {
    return apiFetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    });
  },
};

// Task API functions
export const taskAPI = {
  getAll: async (token) => {
    return apiFetch('/api/tasks', {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  getByProject: async (projectId, token) => {
    return apiFetch(`/api/tasks/project/${projectId}`, {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  create: async (taskData, token) => {
    return apiFetch('/api/tasks', {
      method: 'POST',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(taskData),
    });
  },
  
  update: async (id, taskData, token) => {
    return apiFetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(taskData),
    });
  },
  
  delete: async (id, token) => {
    return apiFetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    });
  },
};

export default apiFetch;