// Test file to verify dependencies can be required
try {
  require('express');
  require('cors');
  require('mongoose');
  require('bcryptjs');
  require('jsonwebtoken');
  console.log('All dependencies loaded successfully');
} catch (error) {
  console.error('Failed to load dependencies:', error.message);
  process.exit(1);
}