import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('🔍 Environment Variables Check:');
console.log('📁 Current directory:', __dirname);
console.log('📁 Resolved .env path:', path.resolve(__dirname, '../.env'));
console.log('');

console.log('DB_SERVER:', process.env.DB_SERVER || 'MISSING');
console.log('DB_NAME:', process.env.DB_NAME || 'MISSING');
console.log('DB_USER:', process.env.DB_USER || 'MISSING');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET (length: ' + process.env.DB_PASSWORD.length + ')' : 'MISSING');
console.log('DB_PORT:', process.env.DB_PORT || 'MISSING');
console.log('');

console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET (length: ' + process.env.JWT_SECRET.length + ')' : 'MISSING');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
