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
    console.log(`Module '${moduleName}' can be resolved`);
    return true;
  } catch (err) {
    console.log(`Module '${moduleName}' cannot be resolved:`, err.message);
    return false;
  }
}

// Function to install dependencies
function installDependencies() {
  console.log('Checking dependencies...');
  
  // Check if package.json exists
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found at:', packageJsonPath);
    return false;
  }
  console.log('package.json found');
  
  // Check package.json contents
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('Package name:', packageJson.name);
    console.log('Dependencies:', Object.keys(packageJson.dependencies || {}));
  } catch (err) {
    console.error('Error reading package.json:', err.message);
  }
  
  // Check if node_modules exists
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  const nodeModulesExists = fs.existsSync(nodeModulesPath);
  console.log('node_modules exists:', nodeModulesExists);
  
  if (nodeModulesExists) {
    console.log('node_modules contents (first 10 items):');
    try {
      const items = fs.readdirSync(nodeModulesPath);
      console.log(items.slice(0, 10));
    } catch (err) {
      console.error('Error reading node_modules:', err.message);
    }
  }
  
  // Try to require express
  console.log('Checking if express can be required...');
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
  console.log('Starting main execution...');
  
  // Install dependencies if needed
  console.log('Installing dependencies if needed...');
  const depsInstalled = installDependencies();
  if (!depsInstalled) {
    console.error('Failed to install dependencies');
    process.exit(1);
  }
  console.log('Dependencies check completed');
  
  // Verify express can be imported
  console.log('Verifying express can be imported...');
  try {
    const express = require('express');
    console.log('Express loaded successfully');
  } catch (err) {
    console.error('Failed to load express after installation:', err);
    process.exit(1);
  }
  
  // Load and start the main server
  console.log('Loading main server...');
  try {
    const { initializeServer } = require('./server.js');
    console.log('Server module loaded, initializing...');
    initializeServer();
    console.log('Server initialization completed');
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('About to run main function...');
// Run the main function
main();
console.log('Main function completed');