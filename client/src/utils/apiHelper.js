/**
 * Constructs the full API URL based on the environment
 * @param {string} endpoint - The API endpoint (e.g., '/users/profile')
 * @returns {string} The full URL to use for API calls
 */
export const getApiUrl = (endpoint) => {
  if (process.env.NODE_ENV === 'development') {
    // In development, prepend the backend URL directly to bypass proxy issues
    return `http://localhost:5000${endpoint}`;
  } else {
    // In production, use relative URLs (will be handled by proxy or same origin)
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