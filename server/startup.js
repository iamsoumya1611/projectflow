#!/usr/bin/env node

// Startup script that ensures dependencies are installed before starting the server
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

console.log('=== ProjectFlow Server Startup ===');
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
  return new Promise((resolve, reject) => {
    console.log('Checking for dependencies...');
    
    // Check if node_modules exists
    const nodeModulesExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
    console.log('node_modules exists:', nodeModulesExists);
    
    // Check if package.json exists
    const packageJsonExists = fs.existsSync(path.join(process.cwd(), 'package.json'));
    console.log('package.json exists:', packageJsonExists);
    
    if (!packageJsonExists) {
      console.error('package.json not found!');
      reject(new Error('package.json not found'));
      return;
    }
    
    // If node_modules doesn't exist or express can't be required, install dependencies
    if (!nodeModulesExists || !canRequire('express')) {
      console.log('Installing dependencies...');
      
      // Try npm ci first (faster and more reliable)
      try {
        execSync('npm ci', { stdio: 'inherit' });
        console.log('Dependencies installed with npm ci');
        resolve();
        return;
      } catch (ciError) {
        console.warn('npm ci failed, trying npm install:', ciError.message);
        
        // Fallback to npm install
        try {
          execSync('npm install', { stdio: 'inherit' });
          console.log('Dependencies installed with npm install');
          resolve();
          return;
        } catch (installError) {
          console.error('npm install also failed:', installError.message);
          reject(new Error('Failed to install dependencies'));
          return;
        }
      }
    } else {
      console.log('Dependencies appear to be already installed');
      resolve();
    }
  });
}

// Function to start the server
function startServer() {
  console.log('Starting server...');
  
  // Verify express can be imported
  try {
    const express = require('express');
    console.log('Express imported successfully');
  } catch (err) {
    console.error('Failed to import express:', err.message);
    process.exit(1);
  }
  
  // Start the actual server
  require('./server.js');
}

// Main execution
async function main() {
  try {
    await installDependencies();
    startServer();
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();