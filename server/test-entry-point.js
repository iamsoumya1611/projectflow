#!/usr/bin/env node

// Simple test script to verify the entry point works
console.log('=== Testing Entry Point ===');

try {
  console.log('Loading index.js...');
  require('./index.js');
  console.log('index.js loaded successfully');
} catch (error) {
  console.error('Error loading index.js:', error);
  process.exit(1);
}