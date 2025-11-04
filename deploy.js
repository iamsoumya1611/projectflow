#!/usr/bin/env node

// Root deployment script for Render
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== ProjectFlow API Deployment ===');
console.log('Current directory:', process.cwd());

// Change to server directory
try {
  process.chdir('server');
  console.log('Changed to server directory:', process.cwd());
} catch (err) {
  console.error('Failed to change to server directory:', err.message);
  process.exit(1);
}

// Check if node_modules exists
const nodeModulesExists = fs.existsSync('node_modules');
console.log('node_modules exists in server:', nodeModulesExists);

// Check if package.json exists
const packageJsonExists = fs.existsSync('package.json');
console.log('package.json exists in server:', packageJsonExists);

// Install dependencies if needed
if (!nodeModulesExists && packageJsonExists) {
  console.log('Installing dependencies...');
  try {
    execSync('npm ci', { stdio: 'inherit' });
    console.log('Dependencies installed successfully');
  } catch (installError) {
    console.error('npm ci failed:', installError.message);
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('npm install completed as fallback');
    } catch (fallbackError) {
      console.error('npm install also failed:', fallbackError.message);
      process.exit(1);
    }
  }
}

// Verify express can be imported
try {
  require('express');
  console.log('Express loaded successfully');
} catch (err) {
  console.error('Failed to load express:', err.message);
  process.exit(1);
}

// Start the server
console.log('Starting ProjectFlow API server...');
require('./server.js');