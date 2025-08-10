import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Database imports - ADD THESE
import sql from 'mssql';
import { getDbConnection } from './utils/database';

// Authentication utilities
import { verifyGoogleToken } from './utils/googleAuth';
import { generateToken, verifyToken, extractTokenFromHeader, JWTPayload } from './utils/jwt';

// Load environment variables
dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response): void => {
  res.json({ 
    status: 'OK', 
    message: 'SSecoM Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes placeholder
// Update your existing /api endpoint to include new endpoints
app.get('/api', (req: Request, res: Response): void => {
  res.json({ 
    message: 'SSecoM Student Ecommerce Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/google',
      verify: '/api/auth/verify',
      logout: '/api/auth/logout',        // Add this
      refresh: '/api/auth/refresh',      // Add this
      users: '/api/users (coming soon)',
      products: '/api/products (coming soon)'
    }
  });
});


// Google OAuth login endpoint with enhanced debugging
// Google OAuth login endpoint - Fixed to always send response
app.post('/api/auth/google', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔐 Google OAuth login attempt...');
    
    const { credential } = req.body;
    
    if (!credential) {
      res.status(400).json({ 
        success: false,
        error: 'Google credential is required' 
      });
      return;
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential);
    console.log('✅ Google token verified for:', googleUser.email);

    // Save or update user in database (updated for simplified table)
    try {
      console.log('🗄️ Attempting database connection...');
      const pool = await getDbConnection();
      console.log('✅ Database connection established');
      
      // Check if user exists
      console.log('🔍 Checking if user exists for ID:', googleUser.googleId);
      const existingUserResult = await pool.request()
        .input('id', sql.NVarChar(50), googleUser.googleId)
        .query('SELECT * FROM Users WHERE id = @id');

      console.log('📊 Existing user query result count:', existingUserResult.recordset.length);

      if (existingUserResult.recordset.length === 0) {
        // Create new user (simplified - no university fields)
        console.log('🆕 Creating new user with data:', {
          id: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture
        });

        const insertResult = await pool.request()
          .input('id', sql.NVarChar(50), googleUser.googleId)
          .input('email', sql.NVarChar(255), googleUser.email)
          .input('name', sql.NVarChar(255), googleUser.name)
          .input('picture', sql.NVarChar(500), googleUser.picture)
          .query(`
            INSERT INTO Users (id, email, name, picture, createdAt, lastLoginAt)
            VALUES (@id, @email, @name, @picture, GETDATE(), GETDATE())
          `);
        
        console.log('📝 Insert result:', insertResult);
        console.log('✅ Rows affected by insert:', insertResult.rowsAffected);
        console.log('🆕 New user created in database:', googleUser.email);
      } else {
        // Update existing user's last login and profile
        console.log('🔄 Updating existing user:', googleUser.email);
        
        const updateResult = await pool.request()
          .input('id', sql.NVarChar(50), googleUser.googleId)
          .input('name', sql.NVarChar(255), googleUser.name)
          .input('picture', sql.NVarChar(500), googleUser.picture)
          .query(`
            UPDATE Users 
            SET name = @name, picture = @picture, lastLoginAt = GETDATE()
            WHERE id = @id
          `);
        
        console.log('📝 Update result:', updateResult);
        console.log('✅ Rows affected by update:', updateResult.rowsAffected);
        console.log('🔄 Existing user updated in database:', googleUser.email);
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      // Continue with authentication even if database fails
    }

    // Create JWT payload (remove university fields)
    const jwtPayload: JWTPayload = {
      userId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      universityDomain: undefined // Remove this if you've updated your JWT interface
    };

    // Generate JWT token
    const jwtToken = generateToken(jwtPayload);

    // Log successful authentication
    console.log('🎓 User authenticated and saved to database:', {
      email: googleUser.email,
      timestamp: new Date().toISOString()
    });

    // CRITICAL: Send response (simplified user object)
    console.log('📤 Sending successful authentication response to frontend...');
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        isUniversityStudent: false, // Always false since you removed this feature
        universityDomain: undefined
      },
      token: jwtToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : 
        undefined
    });
  }
});

// Test JWT verification endpoint
// Test JWT verification endpoint - Enhanced with proper response
app.get('/api/auth/verify', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Auth verify failed: No authorization header');
    res.status(401).json({ 
      success: false, 
      error: 'Authorization token required' 
    });
    return;
  }

  try {
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      console.log('❌ Auth verify failed: Invalid header format');
      res.status(401).json({
        success: false,
        error: 'Invalid authorization header format'
      });
      return;
    }

    const decoded = verifyToken(token);
    console.log('✅ Token verified successfully for:', decoded.email);
    
    res.json({
      success: true,
      message: 'Token is valid',
      user: decoded
    });
  } catch (error) {
    console.log('❌ Auth verify failed: Invalid token -', error instanceof Error ? error.message : 'Unknown error');
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid or expired token'
    });
  }
});


// Welcome message for root path
app.get('/', (req: Request, res: Response): void => {
  res.json({ 
    message: '🎓 Welcome to SSecoM Backend API',
    description: 'Student Ecommerce Platform API Server',
    version: '1.0.0',
    frontend: 'http://localhost:3000',
    apiDocs: 'http://localhost:5000/api',
    healthCheck: 'http://localhost:5000/api/health'
  });
});


// Logout endpoint - Add this after your /api/auth/verify endpoint
app.post('/api/auth/logout', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      success: false, 
      error: 'Authorization token required' 
    });
    return;
  }

  try {
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization header format'
      });
      return;
    }

    // Verify token before logout
    const decoded = verifyToken(token);
    
    console.log('👋 User logged out:', decoded.email);
    
    // In production, you might want to blacklist the token
    // For now, we'll just confirm the logout
    res.json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid token'
    });
  }
});

// Token refresh endpoint - Add this after the logout endpoint
app.post('/api/auth/refresh', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      success: false, 
      error: 'Authorization token required for refresh' 
    });
    return;
  }

  try {
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization header format'
      });
      return;
    }

    // Verify current token
    const decoded = verifyToken(token);
    
    // Generate new token with same payload
    const newToken = generateToken({
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      universityDomain: decoded.universityDomain
    });

    console.log('🔄 Token refreshed for:', decoded.email);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Token refresh failed',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : 
        undefined
    });
  }
});


// Start server
app.listen(PORT, (): void => {
  console.log(`🚀 SSecoM Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎓 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔐 Google OAuth configured: ${!!process.env.GOOGLE_CLIENT_ID}`);
  console.log(`🗝️ JWT Secret configured: ${!!process.env.JWT_SECRET}`);
});

// Handle graceful shutdown
process.on('SIGTERM', (): void => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', (): void => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
