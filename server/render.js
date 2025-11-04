#!/usr/bin/env node

// Render-specific entry point that ensures dependencies are installed
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Render Entry Point ===');

// Function to check if a module can be required
function canRequire(moduleName) {
  try {
    require.resolve(moduleName);
    return true;
  } catch (err) {
    return false;
  }
}

// Install dependencies if express is not available
if (!canRequire('express')) {
  console.log('Express not found, installing dependencies...');
  
  try {
    // Check if package.json exists
    if (fs.existsSync(path.join(__dirname, 'package.json'))) {
      console.log('Running npm ci...');
      execSync('npm ci', { stdio: 'inherit', cwd: __dirname });
      console.log('Dependencies installed');
    }
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    // Continue anyway, let the original error occur
  }
}

// Now load the main server
console.log('Loading main server...');
require('./server.js');