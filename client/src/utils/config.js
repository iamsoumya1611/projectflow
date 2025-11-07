const config = {
  // For development, use empty string when using proxy
  // For production, use the deployed backend URL
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_BASE_URL || 'https://projectflow-api.onrender.com'
    : ''
};

export default config;