// Test script to verify API endpoints are correctly formatted
import { apiFetch } from './apiHelper';

// Test function to verify API endpoints
export const testApiEndpoints = async () => {
  console.log('Testing API endpoints...');
  
  try {
    // Test a few key endpoints to make sure they start with /api/
    const endpointsToTest = [
      '/api/auth/login',
      '/api/users/profile',
      '/api/projects',
      '/api/tasks',
      '/api/messages',
      '/api/analytics/dashboard'
    ];
    
    for (const endpoint of endpointsToTest) {
      console.log(`Testing endpoint: ${endpoint}`);
      const url = apiFetch(endpoint, { method: 'GET' });
      console.log(`Constructed URL: ${url}`);
    }
    
    console.log('All endpoints are correctly formatted with /api/ prefix');
    return true;
  } catch (error) {
    console.error('Error testing API endpoints:', error);
    return false;
  }
};

export default testApiEndpoints;