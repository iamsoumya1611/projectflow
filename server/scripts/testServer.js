const http = require('http');

// Test the test endpoint
const testOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/test',
  method: 'GET'
};

const testReq = http.request(testOptions, res => {
  console.log(`Test endpoint status: ${res.statusCode}`);
  
  res.on('data', d => {
    process.stdout.write(`Test response: ${d}\n`);
  });
});

testReq.on('error', error => {
  console.error('Test endpoint error:', error.message);
});

testReq.end();

// Test the tasks endpoint (this will fail without a token)
const tasksOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/tasks',
  method: 'GET'
};

const tasksReq = http.request(tasksOptions, res => {
  console.log(`Tasks endpoint status: ${res.statusCode}`);
  
  res.on('data', d => {
    process.stdout.write(`Tasks response: ${d}\n`);
  });
});

tasksReq.on('error', error => {
  console.error('Tasks endpoint error:', error.message);
});

tasksReq.end();