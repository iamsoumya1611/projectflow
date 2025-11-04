const config = {
  // For development, use the local backend
  // For production, use the deployed backend URL
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_BASE_URL || 'YOUR_DEPLOYED_BACKEND_URL' 
    : 'http://localhost:5000'
};

export default config;