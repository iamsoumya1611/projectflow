/**
 * Constructs the full API URL based on the environment
 * @param {string} endpoint - The API endpoint (e.g., '/users/profile')
 * @returns {string} The full URL to use for API calls
 */
export const getApiUrl = (endpoint) => {
  // Use REACT_APP_API_BASE_URL if available (for production)
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  
  if (apiBaseUrl && apiBaseUrl !== 'YOUR_DEPLOYED_BACKEND_URL') {
    // In production with a configured backend URL
    return `${apiBaseUrl}${endpoint}`;
  } else if (process.env.NODE_ENV === 'development') {
    // In development, use relative URLs to leverage proxy
    return endpoint;
  } else {
    // Fallback for production without configured backend URL
    return endpoint;
  }
};

/**
 * Wrapper for fetch that automatically constructs the correct API URL
 * @param {string} endpoint - The API endpoint (e.g., '/users/profile')
 * @param {object} options - Fetch options
 * @returns {Promise} The fetch promise
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  return fetch(url, options);
};

export default getApiUrl;