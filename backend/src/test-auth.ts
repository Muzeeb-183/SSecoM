import { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken, JWTPayload } from './utils/jwt';

// Test JWT functionality
const testJWT = async () => {
  console.log('🧪 Testing JWT utilities...\n');
  
  const testPayload: JWTPayload = {
    userId: 'test-user-123',
    email: 'student@university.edu',
    name: 'Test Student',
    picture: 'https://example.com/avatar.jpg',
    universityDomain: 'university.edu'
  };

  try {
    console.log('1️⃣ Testing Access Token Generation...');
    // Generate access token
    const accessToken = generateToken(testPayload);
    console.log('✅ JWT Access Token generated successfully');
    console.log(`📝 Token length: ${accessToken.length} characters\n`);

    console.log('2️⃣ Testing Access Token Verification...');
    // Verify access token
    const decoded = verifyToken(accessToken);
    console.log('✅ JWT Access Token verified successfully');
    console.log('👤 Decoded payload:', JSON.stringify(decoded, null, 2));
    console.log('');

    console.log('3️⃣ Testing Refresh Token Generation...');
    // Generate refresh token
    const refreshToken = generateRefreshToken(testPayload.userId);
    console.log('✅ JWT Refresh Token generated successfully');
    console.log(`📝 Refresh token length: ${refreshToken.length} characters\n`);

    console.log('4️⃣ Testing Refresh Token Verification...');
    // Verify refresh token
    const refreshDecoded = verifyRefreshToken(refreshToken);
    console.log('✅ JWT Refresh Token verified successfully');
    console.log('🔄 Refresh token payload:', JSON.stringify(refreshDecoded, null, 2));
    console.log('');

    console.log('🎉 All JWT tests passed successfully!');
    return true;

  } catch (error) {
    console.error('❌ JWT test failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
};

// Test with invalid token - TypeScript-safe error handling
const testInvalidToken = () => {
  console.log('\n🧪 Testing invalid token handling...');
  
  try {
    verifyToken('invalid-token-here');
    console.log('❌ Should have failed with invalid token');
    return false;
  } catch (error) {
    // TypeScript-safe error handling
    if (error instanceof Error) {
      console.log('✅ Invalid token correctly rejected:', error.message);
    } else {
      console.log('✅ Invalid token correctly rejected:', String(error));
    }
    return true;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting SSecoM JWT Authentication Tests\n');
  console.log('═'.repeat(50));
  
  const jwtTestResult = await testJWT();
  const invalidTokenTestResult = testInvalidToken();
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Test Results Summary:');
  console.log(`✅ JWT Functionality: ${jwtTestResult ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Invalid Token Handling: ${invalidTokenTestResult ? 'PASSED' : 'FAILED'}`);
  
  const allTestsPassed = jwtTestResult && invalidTokenTestResult;
  console.log(`\n🎯 Overall Status: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allTestsPassed) {
    console.log('\n🎉 Your JWT authentication system is ready for Google OAuth integration!');
  }
};

// Execute tests
runAllTests().catch((error) => {
  console.error('🚨 Test execution failed:', error instanceof Error ? error.message : String(error));
});
