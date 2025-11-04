#!/usr/bin/env node

// Script to verify deployment environment and install dependencies if needed
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Render Deployment Verification ===');
console.log('Current working directory:', process.cwd());
console.log('Directory contents:', fs.readdirSync(process.cwd()));

// Check if node_modules exists
const nodeModulesExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
console.log('node_modules exists:', nodeModulesExists);

// Check if package.json exists
const packageJsonExists = fs.existsSync(path.join(process.cwd(), 'package.json'));
console.log('package.json exists:', packageJsonExists);

if (packageJsonExists) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('Package name:', packageJson.name);
    console.log('Dependencies:', Object.keys(packageJson.dependencies || {}));
  } catch (err) {
    console.error('Error reading package.json:', err.message);
  }
}

// If node_modules doesn't exist, try to install dependencies
if (!nodeModulesExists && packageJsonExists) {
  console.log('Installing dependencies...');
  try {
    execSync('npm ci', { stdio: 'inherit' });
    console.log('Dependencies installed successfully');
  } catch (installError) {
    console.error('Failed to install dependencies:', installError.message);
    // Try npm install as fallback
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('Dependencies installed with npm install');
    } catch (fallbackError) {
      console.error('Fallback npm install also failed:', fallbackError.message);
      process.exit(1);
    }
  }
}

// Try to require express to verify it's available
try {
  require('express');
  console.log('Express loaded successfully');
} catch (err) {
  console.error('Failed to load express:', err.message);
  process.exit(1);
}

// Start the actual server
console.log('Starting server...');
require('./server.js');