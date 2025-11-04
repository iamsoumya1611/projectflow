// Simple test script to verify npm installation works
const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Testing npm installation...');
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.error('package.json not found');
    process.exit(1);
  }
  
  // Try to run npm ci
  console.log('Running npm ci...');
  execSync('npm ci', { stdio: 'inherit' });
  console.log('npm ci completed successfully');
  
  // Verify express can be required
  console.log('Testing express import...');
  const express = require('express');
  console.log('Express imported successfully');
  
  console.log('All tests passed!');
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}