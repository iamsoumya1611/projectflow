import { decodeToken } from './jwt';

// Set user authentication token in localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Get user authentication token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const decoded = decodeToken(token);
    if (!decoded) return false;
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Get user ID from token
export const getUserId = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded ? decoded.user.id : null;
};

// Get user role from token
export const getUserRole = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded ? decoded.user.role : null;
};

// Check if user is admin
export const isAdmin = () => {
  const role = getUserRole();
  return role === 'admin';
};

// Logout user
export const logout = (navigate) => {
  localStorage.removeItem('token');
  if (navigate) {
    navigate('/login');
  }
};

// Setup default headers for API requests
export const setupAxiosHeaders = (axiosInstance) => {
  const token = getAuthToken();
  if (token) {
    axiosInstance.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axiosInstance.defaults.headers.common['x-auth-token'];
  }
};