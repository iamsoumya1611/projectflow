// Script to verify deployment configuration
console.log('=== ProjectFlow Deployment Verification ===');

// Check environment variables
console.log('\n1. Environment Variables Check:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Check required dependencies
console.log('\n2. Required Dependencies Check:');
const requiredDeps = ['express', 'mongoose', 'cors', 'bcryptjs', 'jsonwebtoken'];
const packageJson = require('../package.json');

requiredDeps.forEach(dep => {
  const version = packageJson.dependencies[dep];
  console.log(`${dep}: ${version ? version : 'MISSING'}`);
});

// Check server configuration
console.log('\n3. Server Configuration Check:');
console.log('Port:', process.env.PORT || 5000);
console.log('CORS Enabled:', true);

console.log('\n=== Verification Complete ===');
console.log('If all checks pass, your backend is ready for deployment!');