// Simple test script to check backend connectivity
const fetch = require('node-fetch');

async function testBackend() {
  try {
    console.log('Testing backend connection...');
    
    // Test basic server response
    const response = await fetch('http://localhost:5001/');
    const text = await response.text();
    console.log('✅ Backend server is running:', text);
    
    // Test login endpoint with invalid credentials (should return JSON error)
    const loginResponse = await fetch('http://localhost:5001/api/auth/login/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'wrongpass' })
    });
    
    const loginResult = await loginResponse.json();
    console.log('✅ Login endpoint response:', loginResult);
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
  }
}

testBackend();