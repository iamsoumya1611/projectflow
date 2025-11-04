// Test script to verify that the auto-install approach works
console.log('Testing direct import approach...');

// This should trigger the auto-install if dependencies are missing
require('./server.js');

console.log('Test completed successfully');