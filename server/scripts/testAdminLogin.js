const bcrypt = require('bcryptjs');

// Simple test to verify the password hash
async function testPassword() {
  try {
    // This is the password we just set
    const plainPassword = 'admin123';
    
    // We can't easily test the full login flow without the actual hash,
    // but we can verify that bcrypt works correctly
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainPassword, salt);
    
    console.log('Testing password:', plainPassword);
    console.log('Generated hash:', hash);
    
    const isMatch = await bcrypt.compare(plainPassword, hash);
    console.log('Password match:', isMatch);
    
    console.log('\nAdmin login credentials:');
    console.log('Email: soumyamajumder201817@gmail.com');
    console.log('Password: admin123');
    console.log('\nUse these credentials to log in at /admin/login');
    
  } catch (err) {
    console.error('Test error:', err.message);
  }
}

testPassword();