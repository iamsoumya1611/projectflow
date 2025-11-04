// Script to verify build directory exists after build process
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');

console.log('=== Build Verification ===');
console.log('Checking if build directory exists...');

if (fs.existsSync(buildDir)) {
  console.log('✅ Build directory found');
  const files = fs.readdirSync(buildDir);
  console.log(`📁 Build directory contains ${files.length} items`);
  
  // Check for essential files
  const essentialFiles = ['index.html', 'static'];
  essentialFiles.forEach(file => {
    if (fs.existsSync(path.join(buildDir, file))) {
      console.log(`✅ Found essential file: ${file}`);
    } else {
      console.log(`❌ Missing essential file: ${file}`);
    }
  });
} else {
  console.log('❌ Build directory NOT found');
  console.log('Please run "npm run build" in the client directory');
  process.exit(1);
}

console.log('=== Verification Complete ===');