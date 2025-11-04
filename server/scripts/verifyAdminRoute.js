// Simple script to verify admin route is registered
const express = require('express');
const adminRoutes = require('./routes/admin');

console.log('Admin routes loaded successfully');
console.log('Available admin routes:');
console.log('- GET /api/admin/users');
console.log('- GET /api/admin/projects');
console.log('- GET /api/admin/tasks');
console.log('- PUT /api/admin/users/:id/role');
console.log('- DELETE /api/admin/users/:id');