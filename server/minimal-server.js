// Minimal Express server for testing
console.log('Starting minimal server...');

try {
  const express = require('express');
  const app = express();
  const port = process.env.PORT || 3001;
  
  app.get('/', (req, res) => {
    res.json({ message: 'Minimal server is running!', timestamp: new Date().toISOString() });
  });
  
  app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint working!', express: 'loaded' });
  });
  
  app.listen(port, () => {
    console.log(`Minimal server listening at http://localhost:${port}`);
  });
} catch (error) {
  console.error('Failed to start minimal server:', error.message);
  process.exit(1);
}