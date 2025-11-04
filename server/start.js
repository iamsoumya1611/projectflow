#!/usr/bin/env node

// Simple startup script to verify working directory and dependencies
const path = require('path');
const fs = require('fs');

console.log('Current working directory:', process.cwd());
console.log('Server.js exists:', fs.existsSync(path.join(process.cwd(), 'server.js')));
console.log('Node modules exists:', fs.existsSync(path.join(process.cwd(), 'node_modules')));
console.log('Package.json exists:', fs.existsSync(path.join(process.cwd(), 'package.json')));

if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  console.log('Dependencies:', Object.keys(pkg.dependencies || {}));
}

// Try to require express
try {
  const express = require('express');
  console.log('Express loaded successfully');
} catch (error) {
  console.error('Failed to load express:', error.message);
  process.exit(1);
}

// Start the actual server
require('./server.js');