import sql from 'mssql';
import { getDbConnection } from './utils/database';

const testDatabase = async () => {
  try {
    console.log('🧪 Testing Azure SQL Database connection...');
    
    const pool = await getDbConnection();
    console.log('✅ Database connection successful');
    
    // Test basic query
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('📊 Database version:', result.recordset[0].version);
    
    // Test Users table existence
    const tableCheck = await pool.request().query(`
      SELECT COUNT(*) as tableExists 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'Users'
    `);
    console.log('🗂️ Users table exists:', tableCheck.recordset[0].tableExists > 0);
    
    // Test insert capability
    const testInsert = await pool.request()
      .input('testId', sql.NVarChar(50), 'test-user-123')
      .input('testEmail', sql.NVarChar(255), 'test@example.com')
      .input('testName', sql.NVarChar(255), 'Test User')
      .input('testPicture', sql.NVarChar(500), 'https://example.com/pic.jpg')
      .query(`
        INSERT INTO Users (id, email, name, picture, createdAt, lastLoginAt)
        VALUES (@testId, @testEmail, @testName, @testPicture, GETDATE(), GETDATE())
      `);
    
    console.log('✅ Test insert successful, rows affected:', testInsert.rowsAffected);
    
    // Clean up test data
    await pool.request()
      .input('testId', sql.NVarChar(50), 'test-user-123')
      .query('DELETE FROM Users WHERE id = @testId');
    
    console.log('🧹 Test data cleaned up');
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
  }
};

testDatabase();
