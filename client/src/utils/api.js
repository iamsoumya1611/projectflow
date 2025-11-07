import { apiFetch } from './apiHelper';

// Generic API fetch function
const apiFetchWrapper = async (endpoint, options = {}) => {
  // Log the request for debugging
  console.log('API Request:', { endpoint, options });
  
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
    const response = await apiFetch(endpoint, mergedOptions);
    
    // Log the response for debugging
    console.log('API Response:', { endpoint, status: response.status, statusText: response.statusText });
    
    // Check if response has content before trying to parse as JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'API request failed');
      }
      
      return { data, response };
    } else {
      // Handle non-JSON responses (like HTML error pages)
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${text}`);
      }
      // Return text content for non-JSON responses
      return { data: { text }, response };
    }
  } catch (error) {
    console.error('API Error:', { endpoint, error });
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    return apiFetchWrapper('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  register: async (userData) => {
    return apiFetchWrapper('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Project API functions
export const projectAPI = {
  getAll: async (token) => {
    return apiFetchWrapper('/api/projects', {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  getById: async (id, token) => {
    return apiFetchWrapper(`/api/projects/${id}`, {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  create: async (projectData, token) => {
    return apiFetchWrapper('/api/projects', {
      method: 'POST',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(projectData),
    });
  },
  
  update: async (id, projectData, token) => {
    return apiFetchWrapper(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(projectData),
    });
  },
  
  delete: async (id, token) => {
    return apiFetchWrapper(`/api/projects/${id}`, {
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
    return apiFetchWrapper('/api/tasks', {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  getByProject: async (projectId, token) => {
    return apiFetchWrapper(`/api/tasks/project/${projectId}`, {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  create: async (taskData, token) => {
    return apiFetchWrapper('/api/tasks', {
      method: 'POST',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(taskData),
    });
  },
  
  update: async (id, taskData, token) => {
    return apiFetchWrapper(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(taskData),
    });
  },
  
  delete: async (id, token) => {
    return apiFetchWrapper(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    });
  },
};

export default apiFetchWrapper;