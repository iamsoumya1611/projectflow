#!/usr/bin/env node

// Force installation script that cleans and reinstalls dependencies
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Force Dependency Installation ===');

try {
  // Remove node_modules if it exists
  if (fs.existsSync('node_modules')) {
    console.log('Removing existing node_modules...');
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  
  // Remove package-lock.json if it exists
  if (fs.existsSync('package-lock.json')) {
    console.log('Removing package-lock.json...');
    fs.unlinkSync('package-lock.json');
  }
  
  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Dependencies installed successfully');
  
  // Verify express can be required
  console.log('Verifying express...');
  const express = require('express');
  console.log('Express loaded successfully');
  
  console.log('Force installation completed');
} catch (error) {
  console.error('Force installation failed:', error.message);
  process.exit(1);
}