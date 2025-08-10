import sql from 'mssql';
import dotenv from 'dotenv';

// CRITICAL: Load environment variables first in this module
dotenv.config({ path: '.env' });

// Debug environment variables at module load time
console.log('🔍 Database Environment Variables Debug:');
console.log('DB_SERVER:', process.env.DB_SERVER || 'MISSING');
console.log('DB_NAME:', process.env.DB_NAME || 'MISSING');
console.log('DB_USER:', process.env.DB_USER || 'MISSING');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'MISSING');
console.log('DB_PORT:', process.env.DB_PORT || 'MISSING');

const dbConfig: sql.config = {
  server: process.env.DB_SERVER || '',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || '',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || ''
    }
  },
  options: {
    encrypt: true, // Required for Azure SQL
    trustServerCertificate: false,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

// Debug the final configuration
console.log('🔧 Database Configuration Debug:');
console.log('Server:', dbConfig.server || 'EMPTY SERVER');
console.log('Database:', dbConfig.database || 'EMPTY DATABASE');
console.log('Port:', dbConfig.port);

// TypeScript-safe authentication debug
if (dbConfig.authentication && dbConfig.authentication.type === 'default') {
  const authOptions = dbConfig.authentication.options as { userName: string; password: string };
  console.log('User:', authOptions.userName || 'EMPTY USER');
  console.log('Has Password:', !!authOptions.password);
}

let pool: sql.ConnectionPool | undefined;

export const getDbConnection = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    // Validate required fields
    if (!dbConfig.server || !dbConfig.database) {
      throw new Error('Database server or database name is missing. Check environment variables.');
    }
    
    console.log('🔄 Creating new database connection pool...');
    pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('✅ Connected to Azure SQL Database');
  }
  return pool;
};

export const closeDbConnection = async (): Promise<void> => {
  if (pool) {
    await pool.close();
    pool = undefined;
    console.log('👋 Disconnected from Azure SQL Database');
  }
};
