// Generic API fetch function
const apiFetch = async (endpoint, options = {}) => {
  // Construct full URL based on environment
  let url;
  
  if (process.env.NODE_ENV === 'development') {
    // In development, prepend the backend URL directly to bypass proxy issues
    url = `http://localhost:5000${endpoint}`;
  } else {
    // In production, use relative URLs (will be handled by proxy or same origin)
    url = endpoint;
  }
  
  // Log the request for debugging
  console.log('API Request:', { url, options });
  
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
    
    // Log the response for debugging
    console.log('API Response:', { url, status: response.status, statusText: response.statusText });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'API request failed');
    }
    
    return { data, response };
  } catch (error) {
    console.error('API Error:', { url, error });
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  register: async (userData) => {
    return apiFetch('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Project API functions
export const projectAPI = {
  getAll: async (token) => {
    return apiFetch('/projects', {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  getById: async (id, token) => {
    return apiFetch(`/projects/${id}`, {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  create: async (projectData, token) => {
    return apiFetch('/projects', {
      method: 'POST',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(projectData),
    });
  },
  
  update: async (id, projectData, token) => {
    return apiFetch(`/projects/${id}`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(projectData),
    });
  },
  
  delete: async (id, token) => {
    return apiFetch(`/projects/${id}`, {
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
    return apiFetch('/tasks', {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  getByProject: async (projectId, token) => {
    return apiFetch(`/tasks/project/${projectId}`, {
      headers: {
        'x-auth-token': token,
      },
    });
  },
  
  create: async (taskData, token) => {
    return apiFetch('/tasks', {
      method: 'POST',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(taskData),
    });
  },
  
  update: async (id, taskData, token) => {
    return apiFetch(`/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
      },
      body: JSON.stringify(taskData),
    });
  },
  
  delete: async (id, token) => {
    return apiFetch(`/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    });
  },
};

export default apiFetch;