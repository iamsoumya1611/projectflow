#!/usr/bin/env node

// Entry point that handles dependency installation before loading the main server
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== ProjectFlow Server Entry Point ===');
console.log('Node.js version:', process.version);
console.log('Current working directory:', process.cwd());

// Function to check if a module can be required
function canRequire(moduleName) {
  try {
    require.resolve(moduleName);
    return true;
  } catch (err) {
    return false;
  }
}

// Function to install dependencies
function installDependencies() {
  console.log('Checking dependencies...');
  
  // Check if package.json exists
  if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
    console.error('package.json not found!');
    return false;
  }
  
  // Check if node_modules exists
  const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
  console.log('node_modules exists:', nodeModulesExists);
  
  // Try to require express
  if (!canRequire('express')) {
    console.log('Express not found, installing dependencies...');
    
    try {
      // Try npm ci first (faster and more reliable)
      console.log('Running npm ci...');
      execSync('npm ci', { stdio: 'inherit', cwd: __dirname });
      console.log('Dependencies installed with npm ci');
      return true;
    } catch (ciError) {
      console.warn('npm ci failed:', ciError.message);
      
      // Fallback to npm install
      try {
        console.log('Running npm install...');
        execSync('npm install', { stdio: 'inherit', cwd: __dirname });
        console.log('Dependencies installed with npm install');
        return true;
      } catch (installError) {
        console.error('npm install also failed:', installError.message);
        return false;
      }
    }
  } else {
    console.log('Express is already available');
    return true;
  }
}

// Main execution
function main() {
  // Install dependencies if needed
  if (!installDependencies()) {
    console.error('Failed to install dependencies');
    process.exit(1);
  }
  
  // Verify express can be imported
  try {
    const express = require('express');
    console.log('Express loaded successfully');
  } catch (err) {
    console.error('Failed to load express after installation:', err.message);
    process.exit(1);
  }
  
  // Load and start the main server
  console.log('Starting main server...');
  try {
    const { initializeServer } = require('./server.js');
    initializeServer();
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

// Run the main function
main();