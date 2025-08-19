import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Database imports
import sql from 'mssql';
import { getDbConnection } from './utils/database';

// Authentication utilities
import { verifyGoogleToken } from './utils/googleAuth';
import { generateToken, verifyToken, extractTokenFromHeader, JWTPayload } from './utils/jwt';


import multer from 'multer';
import { uploadImage, deleteImage } from './utils/imagekit';


// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Load environment variables
dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));

// 1st update index.ts

// const allowedOrigins = (process.env.FRONTEND_URL || '').split(',');

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps, curl, etc.)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       return callback(null, true);
//     } else {
//       return callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

//2nd update index.ts
// const allowedOrigins = (process.env.FRONTEND_URL || '').split(',');

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like curl or mobile apps)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       return callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

//3rd update index.ts after vercel deployment
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
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

// API routes
app.get('/api', (req: Request, res: Response): void => {
  res.json({ 
    message: 'SSecoM Student Ecommerce Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/google',
      verify: '/api/auth/verify',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      adminGrant: '/api/admin/grant-admin',
      adminRevoke: '/api/admin/revoke-admin',
      adminUsers: '/api/admin/users',
      adminCategories: '/api/admin/categories',
      adminProducts: '/api/admin/products'
    }
  });
});

// [Keep all your existing auth endpoints exactly the same - Google OAuth, verify, logout, refresh, admin management, users]
// Google OAuth login endpoint with admin role support
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

    // Save or update user in database with role support
    try {
      console.log('🗄️ Attempting database connection...');
      const pool = await getDbConnection();
      console.log('✅ Database connection established');
      
      // Check if user exists
      console.log('🔍 Checking if user exists for ID:', googleUser.googleId);
      const existingUserResult = await pool.request()
        .input('id', sql.NVarChar(50), googleUser.googleId)
        .query('SELECT id, email, name, picture, role, lastLoginAt FROM Users WHERE id = @id');

      console.log('📊 Existing user query result count:', existingUserResult.recordset.length);

      let userRole = 'user'; // Default role
      let finalUser;

      if (existingUserResult.recordset.length === 0) {
        // Create new user with default 'user' role
        console.log('🆕 Creating new user with data:', {
          id: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          role: 'user'
        });

        const insertResult = await pool.request()
          .input('id', sql.NVarChar(50), googleUser.googleId)
          .input('email', sql.NVarChar(255), googleUser.email)
          .input('name', sql.NVarChar(255), googleUser.name)
          .input('picture', sql.NVarChar(500), googleUser.picture)
          .input('role', sql.NVarChar(20), 'user')
          .query(`
            INSERT INTO Users (id, email, name, picture, role, createdAt, lastLoginAt)
            VALUES (@id, @email, @name, @picture, @role, GETDATE(), GETDATE())
          `);
        
        console.log('📝 Insert result:', insertResult);
        console.log('✅ Rows affected by insert:', insertResult.rowsAffected);
        console.log('🆕 New user created in database:', googleUser.email);
        userRole = 'user';

        finalUser = {
          id: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          role: userRole,
          isUniversityStudent: false,
          universityDomain: undefined
        };
      } else {
        // ✅ CRITICAL FIX: Update existing user while preserving custom profile picture
        const existingUser = existingUserResult.recordset[0];
        userRole = existingUser.role;
        
        // ✅ Check if user has a custom profile picture (ImageKit URL)
        const hasCustomPicture = existingUser.picture && 
          existingUser.picture.includes('ik.imagekit.io') && 
          existingUser.picture.includes('ssecom/profiles/');

        console.log('🔄 Updating existing user:', googleUser.email, 'with role:', userRole);
        console.log('📸 Has custom profile picture:', hasCustomPicture ? 'YES' : 'NO');
        
        // ✅ Preserve custom profile picture if it exists, otherwise use Google picture
        const pictureToSave = hasCustomPicture ? existingUser.picture : googleUser.picture;
        
        const updateResult = await pool.request()
          .input('id', sql.NVarChar(50), googleUser.googleId)
          .input('name', sql.NVarChar(255), googleUser.name)
          .input('picture', sql.NVarChar(500), pictureToSave) // ✅ FIXED: Use preserved picture
          .query(`
            UPDATE Users 
            SET name = @name, picture = @picture, lastLoginAt = GETDATE()
            WHERE id = @id
          `);
        
        console.log('📝 Update result:', updateResult);
        console.log('✅ Rows affected by update:', updateResult.rowsAffected);
        console.log('🔄 Existing user updated in database:', googleUser.email);
        console.log('📸 Profile picture preserved:', pictureToSave);

        finalUser = {
          id: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          picture: pictureToSave, // ✅ Use preserved picture
          role: userRole,
          isUniversityStudent: false,
          universityDomain: undefined
        };
      }

      // Create JWT payload with role
      const jwtPayload: JWTPayload = {
        userId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        picture: finalUser.picture, // ✅ Use final picture (may be custom or Google)
        role: userRole // Include role in JWT
      };

      // Generate JWT token
      const jwtToken = generateToken(jwtPayload);

      // Log successful authentication
      console.log('🎓 User authenticated and saved to database:', {
        email: googleUser.email,
        role: userRole,
        hasCustomPicture: finalUser.picture.includes('ik.imagekit.io'),
        timestamp: new Date().toISOString()
      });

      // Send response with role information
      console.log('📤 Sending successful authentication response to frontend...');
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        user: finalUser,
        token: jwtToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      res.status(500).json({
        success: false,
        error: 'Database error during authentication'
      });
      return;
    }

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


// JWT verification endpoint with proper null checking - ✅ FIXED VERSION
app.get('/api/auth/verify', async (req: Request, res: Response): Promise<void> => {
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
    console.log('✅ Token verified successfully for:', decoded.email, 'Role:', decoded.role);
    
    // ✅ CRITICAL FIX: Fetch fresh user data from database instead of using cached JWT data
    try {
      const pool = await getDbConnection();
      const freshUserResult = await pool.request()
        .input('userId', sql.NVarChar(50), decoded.userId)
        .query('SELECT id, email, name, picture, role FROM Users WHERE id = @userId');
      
      if (freshUserResult.recordset.length === 0) {
        console.log('❌ User not found in database:', decoded.userId);
        res.status(401).json({ success: false, error: 'User not found' });
        return;
      }
      
      const freshUser = freshUserResult.recordset[0];
      console.log('📸 Fresh user data from database - Picture URL:', freshUser.picture);
      
      res.json({
        success: true,
        message: 'Token is valid',
        user: {
          id: freshUser.id,
          email: freshUser.email,
          name: freshUser.name,
          picture: freshUser.picture, // ✅ Fresh picture URL from database
          role: freshUser.role,
          isUniversityStudent: false,
          universityDomain: undefined
        }
      });
    } catch (dbError) {
      console.error('❌ Database error during auth verification:', dbError);
      // Fallback to JWT data if database fails
      console.log('🔄 Falling back to JWT data due to database error');
      res.json({
        success: true,
        message: 'Token is valid (fallback)',
        user: decoded
      });
    }
  } catch (error) {
    console.log('❌ Auth verify failed: Invalid token -', error instanceof Error ? error.message : 'Unknown error');
    console.log('🔍 Detailed error:', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid or expired token'
    });
  }
});

  // Homepage data endpoint
  // ENHANCED HOMEPAGE ENDPOINT WITH DEBUGGING
app.get('/api/homepage', async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = await getDbConnection();

    console.log('🔍 Executing categories query...');
    
    // ✅ ENHANCED: Add debug logging
    const categories = await pool.request()
      .query(`
        SELECT 
          c.id,
          c.name,
          c.description,
          c.slug,
          c.imageUrl,
          COUNT(p.id) as productCount,
          COALESCE(SUM(CASE WHEN DATEDIFF(day, p.createdAt, GETDATE()) <= 7 THEN 1 ELSE 0 END), 0) as recentProducts
        FROM Categories c
        LEFT JOIN Products p ON c.id = p.categoryId AND p.status = 'active'
        WHERE c.status = 'active'
        GROUP BY c.id, c.name, c.description, c.slug, c.imageUrl
        ORDER BY productCount DESC, c.name ASC
      `);

    // ✅ DEBUG: Log the actual SQL results
    console.log('📊 Categories Query Results:');
    categories.recordset.forEach(cat => {
      console.log(`  - ${cat.name}: imageUrl = "${cat.imageUrl || 'NULL'}"`);
    });
    console.log(`🔍 Total categories: ${categories.recordset.length}`);
    console.log(`📸 Categories with images: ${categories.recordset.filter(c => c.imageUrl).length}`);

    // Keep existing product queries unchanged
    const featuredProducts = await pool.request()
      .query(`
        WITH RankedProducts AS (
          SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.originalPrice,
            p.affiliateLink,
            p.imageUrl,
            p.tags,
            p.createdAt,
            c.name as categoryName,
            c.id as categoryId,
            ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY p.createdAt DESC) as rn
          FROM Products p
          INNER JOIN Categories c ON p.categoryId = c.id
          WHERE p.status = 'active' AND c.status = 'active'
        )
        SELECT TOP 6 *
        FROM RankedProducts
        WHERE rn = 1
        ORDER BY createdAt DESC
      `);

    const latestProducts = await pool.request()
      .query(`
        SELECT TOP 8
          p.id,
          p.name,
          p.description,
          p.price,
          p.originalPrice,
          p.affiliateLink,
          p.imageUrl,
          p.tags,
          p.createdAt,
          c.name as categoryName,
          c.id as categoryId
        FROM Products p
        INNER JOIN Categories c ON p.categoryId = c.id
        WHERE p.status = 'active' AND c.status = 'active'
        ORDER BY p.createdAt DESC
      `);

    const stats = await pool.request()
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM Users) as totalUsers,
          (SELECT COUNT(*) FROM Products WHERE status = 'active') as totalProducts,
          (SELECT COUNT(*) FROM Categories WHERE status = 'active') as totalCategories,
          (SELECT COALESCE(SUM(CAST(price as FLOAT)), 0) FROM Products WHERE status = 'active') as totalValue
      `);

    console.log('✅ Homepage data fetched successfully with category images');

    res.json({
      success: true,
      data: {
        categories: categories.recordset,
        featuredProducts: featuredProducts.recordset,
        latestProducts: latestProducts.recordset,
        stats: stats.recordset[0]
      }
    });

  } catch (error) {
    console.error('❌ Get homepage data error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch homepage data' });
  }
});


// [Keep all your other auth endpoints: logout, refresh, grant-admin, revoke-admin, users - they're correct]

// Logout endpoint
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

    const decoded = verifyToken(token);
    
    console.log('👋 User logged out:', decoded.email);
    
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

// Token refresh endpoint
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

    const decoded = verifyToken(token);
    
    const newToken = generateToken({
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      role: decoded.role
    });

    console.log('🔄 Token refreshed for:', decoded.email, 'Role:', decoded.role);
    
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

// Admin management endpoints
app.post('/api/admin/grant-admin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        error: 'Authorization token required' 
      });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization header format'
      });
      return;
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        error: 'Only admins can grant admin access' 
      });
      return;
    }

    if (!email) {
      res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
      return;
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .input('role', sql.NVarChar(20), 'admin')
      .query('UPDATE Users SET role = @role WHERE email = @email');

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
      return;
    }

    console.log('👑 Admin access granted to:', email, 'by:', decoded.email);
    res.json({ 
      success: true, 
      message: `Admin access granted to ${email}` 
    });

  } catch (error) {
    console.error('❌ Grant admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to grant admin access'
    });
  }
});

// Revoke admin access
app.post('/api/admin/revoke-admin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        error: 'Authorization token required' 
      });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization header format'
      });
      return;
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        error: 'Only admins can revoke admin access' 
      });
      return;
    }

    if (!email) {
      res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
      return;
    }

    if (decoded.email === email) {
      res.status(400).json({ 
        success: false, 
        error: 'Cannot revoke your own admin access' 
      });
      return;
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .input('role', sql.NVarChar(20), 'user')
      .query('UPDATE Users SET role = @role WHERE email = @email');

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
      return;
    }

    console.log('👤 Admin access revoked from:', email, 'by:', decoded.email);
    res.json({ 
      success: true, 
      message: `Admin access revoked from ${email}` 
    });

  } catch (error) {
    console.error('❌ Revoke admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke admin access'
    });
  }
});

// Get all users
app.get('/api/admin/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        error: 'Authorization token required' 
      });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization header format'
      });
      return;
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        error: 'Only admins can view user list' 
      });
      return;
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .query('SELECT id, email, name, picture, role, createdAt, lastLoginAt FROM Users ORDER BY createdAt DESC');

    res.json({ 
      success: true, 
      users: result.recordset 
    });

  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Images upload
// Image upload endpoint
app.post('/api/admin/upload-images', upload.array('images', 3), async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ success: false, error: 'At least one image is required' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const uploadedImages: { url: string; fileId: string }[] = [];

    // Upload each image to ImageKit
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `product-${Date.now()}-${i + 1}`;
      
      try {
        const uploadResult = await uploadImage(file, fileName, 'products');
        uploadedImages.push(uploadResult);
      } catch (error) {
        // If any upload fails, clean up already uploaded images
        for (const uploaded of uploadedImages) {
          try {
            await deleteImage(uploaded.fileId);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        }
        
        res.status(500).json({ 
          success: false, 
          error: `Failed to upload image ${i + 1}` 
        });
        return;
      }
    }

    console.log(`✅ ${uploadedImages.length} images uploaded to ImageKit`);
    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages
    });

  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload images' 
    });
  }
});

// backend/src/index.ts - ENHANCED CATEGORY ENDPOINTS

// ========== ENHANCED CATEGORY MANAGEMENT WITH IMAGE SUPPORT ==========

// Create category endpoint with image upload support
app.post('/api/admin/categories', upload.single('categoryImage'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header format' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    if (!name) {
      res.status(400).json({ success: false, error: 'Category name is required' });
      return;
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Handle optional image upload
    let imageUrl = null;
    let imageFileId = null;

    if (req.file) {
      try {
        console.log(`📸 Uploading category image for: ${name}`);
        const fileName = `category_${slug}_${Date.now()}`;
        
        // ✅ Upload to categories folder with specific transformations
        const uploadResult = await uploadImage(req.file, fileName, 'categories');
        imageUrl = uploadResult.url;
        imageFileId = uploadResult.fileId;
        
        console.log(`✅ Category image uploaded: ${uploadResult.url}`);
      } catch (uploadError) {
        console.error('❌ Category image upload failed:', uploadError);
        res.status(500).json({ success: false, error: 'Failed to upload category image' });
        return;
      }
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('name', sql.NVarChar(255), name)
      .input('description', sql.NVarChar(500), description || '')
      .input('slug', sql.NVarChar(255), slug)
      .input('imageUrl', sql.NVarChar(500), imageUrl)
      .query(`
        INSERT INTO Categories (name, description, slug, imageUrl)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.slug, INSERTED.imageUrl, INSERTED.createdAt
        VALUES (@name, @description, @slug, @imageUrl)
      `);

    console.log('✅ Category created:', name, imageUrl ? 'with image' : 'without image');
    res.json({ 
      success: true, 
      message: 'Category created successfully',
      category: result.recordset[0]
    });

  } catch (error) {
    console.error('❌ Create category error:', error);
    res.status(500).json({ success: false, error: 'Failed to create category' });
  }
});

// Update category endpoint with image support
app.put('/api/admin/categories/:id', upload.single('categoryImage'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, removeImage } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header format' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    if (!name) {
      res.status(400).json({ success: false, error: 'Category name is required' });
      return;
    }

    const pool = await getDbConnection();

    // Get existing category to handle image updates
    const existingCategoryResult = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query('SELECT imageUrl FROM Categories WHERE id = @id');

    if (existingCategoryResult.recordset.length === 0) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    const existingCategory = existingCategoryResult.recordset[0];
    let newImageUrl = existingCategory.imageUrl; // Keep existing by default

    // Handle image removal
    if (removeImage === 'true' && existingCategory.imageUrl) {
      try {
        // Extract fileId from ImageKit URL to delete it
        const urlParts = existingCategory.imageUrl.split('/');
        const fileIdPart = urlParts[urlParts.length - 1];
        const fileId = fileIdPart.split('?')[0]; // Remove transformation parameters
        
        await deleteImage(fileId);
        console.log(`🗑️ Deleted old category image: ${fileId}`);
      } catch (deleteError) {
        console.warn('⚠️ Failed to delete old category image:', deleteError);
      }
      newImageUrl = null;
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image if it exists
      if (existingCategory.imageUrl) {
        try {
          const urlParts = existingCategory.imageUrl.split('/');
          const fileIdPart = urlParts[urlParts.length - 1];
          const fileId = fileIdPart.split('?')[0];
          
          await deleteImage(fileId);
          console.log(`🗑️ Replaced old category image: ${fileId}`);
        } catch (deleteError) {
          console.warn('⚠️ Failed to delete old category image:', deleteError);
        }
      }

      try {
        console.log(`📸 Uploading new category image for: ${name}`);
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const fileName = `category_${slug}_${Date.now()}`;
        
        const uploadResult = await uploadImage(req.file, fileName, 'categories');
        newImageUrl = uploadResult.url;
        
        console.log(`✅ New category image uploaded: ${uploadResult.url}`);
      } catch (uploadError) {
        console.error('❌ New category image upload failed:', uploadError);
        res.status(500).json({ success: false, error: 'Failed to upload new category image' });
        return;
      }
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const result = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .input('name', sql.NVarChar(255), name)
      .input('description', sql.NVarChar(500), description || '')
      .input('slug', sql.NVarChar(255), slug)
      .input('imageUrl', sql.NVarChar(500), newImageUrl)
      .query(`
        UPDATE Categories 
        SET name = @name, description = @description, slug = @slug, imageUrl = @imageUrl, updatedAt = GETDATE()
        WHERE id = @id
      `);

    console.log('✅ Category updated:', name, newImageUrl ? 'with image' : 'without image');
    res.json({ 
      success: true, 
      message: 'Category updated successfully' 
    });

  } catch (error) {
    console.error('❌ Update category error:', error);
    res.status(500).json({ success: false, error: 'Failed to update category' });
  }
});

// Enhanced get categories endpoint to include imageUrl
app.get('/api/admin/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header format' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .query('SELECT id, name, description, slug, imageUrl, status, createdAt FROM Categories ORDER BY name ASC');

    res.json({ 
      success: true, 
      categories: result.recordset 
    });

  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// Enhanced delete category endpoint with image cleanup
app.delete('/api/admin/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header format' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    const pool = await getDbConnection();
    
    // Get category image before deletion for cleanup
    const categoryResult = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query('SELECT imageUrl FROM Categories WHERE id = @id');

    if (categoryResult.recordset.length === 0) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    const category = categoryResult.recordset[0];

    // Delete category image from ImageKit if it exists
    if (category.imageUrl) {
      try {
        const urlParts = category.imageUrl.split('/');
        const fileIdPart = urlParts[urlParts.length - 1];
        const fileId = fileIdPart.split('?')[0];
        
        await deleteImage(fileId);
        console.log(`🗑️ Deleted category image: ${fileId}`);
      } catch (deleteError) {
        console.warn('⚠️ Failed to delete category image:', deleteError);
      }
    }
    
    // First delete all products in this category (existing logic)
    await pool.request()
      .input('categoryId', sql.NVarChar(50), id)
      .query('DELETE FROM Products WHERE categoryId = @categoryId');
    
    // Then delete the category
    const result = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query('DELETE FROM Categories WHERE id = @id');

    console.log('✅ Category and image deleted:', id);
    res.json({ success: true, message: 'Category, associated products, and images deleted successfully' });

  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
});

// Update homepage endpoint to include category images

// ========== PRODUCT MANAGEMENT ENDPOINTS ==========

// Get all products
app.get('/api/admin/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header format' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .query(`
        SELECT p.id, p.name, p.description, p.price, p.originalPrice, 
               p.affiliateLink, p.imageUrl, p.tags, p.status, p.createdAt,
               c.name as categoryName, c.id as categoryId
        FROM Products p
        INNER JOIN Categories c ON p.categoryId = c.id
        ORDER BY p.createdAt DESC
      `);

    res.json({ 
      success: true, 
      products: result.recordset 
    });

  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// Create product
// Update product creation to store ImageKit URLs and fileIds
app.post('/api/admin/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      categoryId, 
      name, 
      description, 
      price, 
      originalPrice, 
      images,    
      imageFileIds, // ✅ Now handle this field
      buttons,   
      tags,
      imageUrl, 
      affiliateLink 
    } = req.body;

    // ... existing auth checks ...

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('categoryId', sql.NVarChar(50), categoryId)
      .input('name', sql.NVarChar(255), name)
      .input('description', sql.NVarChar(sql.MAX), description || '')
      .input('price', sql.Decimal(10, 2), price)
      .input('originalPrice', sql.Decimal(10, 2), originalPrice || null)
      .input('images', sql.NVarChar(sql.MAX), images || '[]')
      .input('imageFileIds', sql.NVarChar(sql.MAX), imageFileIds || '[]') // ✅ Store file IDs
      .input('buttons', sql.NVarChar(sql.MAX), buttons || '[]')
      .input('tags', sql.NVarChar(sql.MAX), tags || '')
      .input('affiliateLink', sql.NVarChar(sql.MAX), affiliateLink)
      .input('imageUrl', sql.NVarChar(sql.MAX), imageUrl || '')
      .query(`
        INSERT INTO Products (categoryId, name, description, price, originalPrice, affiliateLink, imageUrl, images, imageFileIds, buttons, tags)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.price, INSERTED.createdAt
        VALUES (@categoryId, @name, @description, @price, @originalPrice, @affiliateLink, @imageUrl, @images, @imageFileIds, @buttons, @tags)
      `);

    res.json({ 
      success: true, 
      message: 'Product created successfully',
      product: result.recordset[0]
    });

  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});




  // ========== PRODUCT UPDATE & DELETE ENDPOINTS ==========

// Update product
// Also update your UPDATE endpoint
app.put('/api/admin/products/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      categoryId, 
      name, 
      description, 
      price, 
      originalPrice, 
      images,
      imageFileIds, // ✅ Handle file IDs for updates
      buttons,
      tags,
      affiliateLink,
      imageUrl 
    } = req.body;

    // ... existing auth checks ...

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .input('categoryId', sql.NVarChar(50), categoryId)
      .input('name', sql.NVarChar(255), name)
      .input('description', sql.NVarChar(sql.MAX), description || '')
      .input('price', sql.Decimal(10, 2), price)
      .input('originalPrice', sql.Decimal(10, 2), originalPrice || null)
      .input('images', sql.NVarChar(sql.MAX), images || '[]')
      .input('imageFileIds', sql.NVarChar(sql.MAX), imageFileIds || '[]') // ✅ Update file IDs
      .input('buttons', sql.NVarChar(sql.MAX), buttons || '[]')
      .input('tags', sql.NVarChar(sql.MAX), tags || '')
      .input('affiliateLink', sql.NVarChar(sql.MAX), affiliateLink)
      .input('imageUrl', sql.NVarChar(sql.MAX), imageUrl || '')
      .query(`
        UPDATE Products 
        SET categoryId = @categoryId, name = @name, description = @description, 
            price = @price, originalPrice = @originalPrice, affiliateLink = @affiliateLink,
            imageUrl = @imageUrl, images = @images, imageFileIds = @imageFileIds, buttons = @buttons, tags = @tags, updatedAt = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, message: 'Product updated successfully' });

  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

// Delete product
app.delete('/api/admin/products/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header format' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query('DELETE FROM Products WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    console.log('✅ Product deleted:', id);
    res.json({ success: true, message: 'Product deleted successfully' });

  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});


// Get single product by ID (public endpoint)
app.get('/api/products/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const pool = await getDbConnection();
    const result = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.originalPrice,
          p.affiliateLink,
          p.imageUrl,
          p.images,
          p.buttons,
          p.tags,
          p.status,
          p.createdAt,
          c.name as categoryName,
          c.id as categoryId
        FROM Products p
        INNER JOIN Categories c ON p.categoryId = c.id
        WHERE p.id = @id AND p.status = 'active'
      `);

    if (result.recordset.length === 0) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    console.log('✅ Product fetched successfully:', result.recordset[0].name);
    res.json({ 
      success: true, 
      product: result.recordset[0]
    });

  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});


// Get products by category ID (public endpoint)
// backend/src/index.ts - Make sure this endpoint exists
app.get('/api/categories/:categoryId/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    
    const pool = await getDbConnection();
    const result = await pool.request()
      .input('categoryId', sql.NVarChar(50), categoryId)
      .query(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.originalPrice,
          p.affiliateLink,
          p.imageUrl,
          p.images,
          p.buttons,
          p.tags,
          p.status,
          p.createdAt,
          c.name as categoryName,
          c.id as categoryId
        FROM Products p
        INNER JOIN Categories c ON p.categoryId = c.id
        WHERE p.categoryId = @categoryId AND p.status = 'active'
        ORDER BY p.createdAt DESC
      `);

    console.log(`✅ Category products fetched: ${result.recordset.length} products`);
    res.json({ 
      success: true, 
      products: result.recordset
    });

  } catch (error) {
    console.error('❌ Get category products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch category products' });
  }
});

// ===== CART API ENDPOINTS - UPDATED FOR YOUR JWT SYSTEM =====

// Get user's cart
app.get('/api/cart', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header' });
      return;
    }

    // ✅ Use your existing verifyToken function
    const decoded = verifyToken(token);

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('userId', sql.NVarChar(50), decoded.userId) // ✅ Use decoded.userId
      .query(`
        SELECT 
          c.id,
          c.productId,
          c.quantity,
          c.addedAt,
          p.name as productName,
          p.price,
          p.originalPrice,
          p.imageUrl,
          cat.name as categoryName
        FROM CartItems c
        INNER JOIN Products p ON c.productId = p.id
        INNER JOIN Categories cat ON p.categoryId = cat.id
        WHERE c.userId = @userId
        ORDER BY c.addedAt DESC
      `);

    res.json({
      success: true,
      cartItems: result.recordset
    });

  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cart' });
  }
});

// Add item to cart
app.post('/api/cart/add', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header' });
      return;
    }

    // ✅ Use your existing verifyToken function
    const decoded = verifyToken(token);
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, error: 'Product ID is required' });
      return;
    }

    const pool = await getDbConnection();

    // Check if product exists
    const productCheck = await pool.request()
      .input('productId', sql.NVarChar(50), productId)
      .query('SELECT id FROM Products WHERE id = @productId AND status = \'active\'');

    if (productCheck.recordset.length === 0) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    // Check if item already exists in cart
    const existingItem = await pool.request()
      .input('userId', sql.NVarChar(50), decoded.userId) // ✅ Use decoded.userId
      .input('productId', sql.NVarChar(50), productId)
      .query('SELECT id, quantity FROM CartItems WHERE userId = @userId AND productId = @productId');

    if (existingItem.recordset.length > 0) {
      // Update quantity
      await pool.request()
        .input('userId', sql.NVarChar(50), decoded.userId) // ✅ Use decoded.userId
        .input('productId', sql.NVarChar(50), productId)
        .input('quantity', sql.Int, existingItem.recordset[0].quantity + quantity)
        .query('UPDATE CartItems SET quantity = @quantity, updatedAt = GETDATE() WHERE userId = @userId AND productId = @productId');
    } else {
      // Add new item
      await pool.request()
        .input('userId', sql.NVarChar(50), decoded.userId) // ✅ Use decoded.userId
        .input('productId', sql.NVarChar(50), productId)
        .input('quantity', sql.Int, quantity)
        .query(`
          INSERT INTO CartItems (userId, productId, quantity, addedAt, updatedAt)
          VALUES (@userId, @productId, @quantity, GETDATE(), GETDATE())
        `);
    }

    res.json({ success: true, message: 'Item added to cart' });

  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
app.put('/api/cart/update', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header' });
      return;
    }

    // ✅ Use your existing verifyToken function
    const decoded = verifyToken(token);
    const { productId, quantity } = req.body;

    if (!productId || quantity < 0) {
      res.status(400).json({ success: false, error: 'Invalid product ID or quantity' });
      return;
    }

    const pool = await getDbConnection();

    if (quantity === 0) {
      // Remove item if quantity is 0
      await pool.request()
        .input('userId', sql.NVarChar(50), decoded.userId) // ✅ Use decoded.userId
        .input('productId', sql.NVarChar(50), productId)
        .query('DELETE FROM CartItems WHERE userId = @userId AND productId = @productId');
    } else {
      // Update quantity
      await pool.request()
        .input('userId', sql.NVarChar(50), decoded.userId) // ✅ Use decoded.userId
        .input('productId', sql.NVarChar(50), productId)
        .input('quantity', sql.Int, quantity)
        .query('UPDATE CartItems SET quantity = @quantity, updatedAt = GETDATE() WHERE userId = @userId AND productId = @productId');
    }

    res.json({ success: true, message: 'Cart updated successfully' });

  } catch (error) {
    console.error('❌ Update cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to update cart' });
  }
});

// Remove item from cart
app.delete('/api/cart/remove/:productId', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header' });
      return;
    }

    // ✅ Use your existing verifyToken function
    const decoded = verifyToken(token);
    const { productId } = req.params;

    const pool = await getDbConnection();
    await pool.request()
      .input('userId', sql.NVarChar(50), decoded.userId) // ✅ Use decoded.userId
      .input('productId', sql.NVarChar(50), productId)
      .query('DELETE FROM CartItems WHERE userId = @userId AND productId = @productId');

    res.json({ success: true, message: 'Item removed from cart' });

  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove item from cart' });
  }
});

// Clear entire cart
app.delete('/api/cart/clear', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ') ) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header' });
      return;
    }

    // ✅ Use your existing verifyToken function
    const decoded = verifyToken(token);

    const pool = await getDbConnection();
    await pool.request()
      .input('userId', sql.NVarChar(50), decoded.userId) // ✅ Use decoded.userId
      .query('DELETE FROM CartItems WHERE userId = @userId');

    res.json({ success: true, message: 'Cart cleared successfully' });

  } catch (error) {
    console.error('❌ Clear cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to clear cart' });
  }
});


// Welcome message for root path
app.get('/', (req: Request, res: Response): void => {
  res.json({ 
    message: '🎓 Welcome to SSecoM Backend API',
    description: 'Student Affiliate Marketing Platform API Server',
    version: '1.0.0',
    frontend: 'http://localhost:3000',
    apiDocs: 'http://localhost:5000/api',
    healthCheck: 'http://localhost:5000/api/health'
  });
});

// ========== ANALYTICS ENDPOINTS ==========

// Get platform analytics
app.get('/api/admin/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header format' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    const pool = await getDbConnection();

    // Get user statistics
    const userStats = await pool.request()
      .query(`
        SELECT 
          COUNT(*) as totalUsers,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as adminUsers,
          SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regularUsers,
          SUM(CASE WHEN DATEDIFF(day, createdAt, GETDATE()) <= 30 THEN 1 ELSE 0 END) as newUsersThisMonth,
          SUM(CASE WHEN DATEDIFF(day, lastLoginAt, GETDATE()) <= 7 THEN 1 ELSE 0 END) as activeUsersThisWeek
        FROM Users
      `);

    // Get category statistics
    const categoryStats = await pool.request()
      .query(`
        SELECT 
          COUNT(*) as totalCategories,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCategories
        FROM Categories
      `);

    // Get product statistics
    const productStats = await pool.request()
      .query(`
        SELECT 
          COUNT(*) as totalProducts,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeProducts,
          AVG(CAST(price as FLOAT)) as averagePrice,
          MIN(CAST(price as FLOAT)) as minPrice,
          MAX(CAST(price as FLOAT)) as maxPrice,
          SUM(CASE WHEN DATEDIFF(day, createdAt, GETDATE()) <= 30 THEN 1 ELSE 0 END) as newProductsThisMonth
        FROM Products
      `);

    // Get products by category
    const productsByCategory = await pool.request()
      .query(`
        SELECT 
          c.name as categoryName,
          COUNT(p.id) as productCount
        FROM Categories c
        LEFT JOIN Products p ON c.id = p.categoryId
        GROUP BY c.id, c.name
        ORDER BY productCount DESC
      `);

    // Get recent activity (users and products created in last 30 days)
    const recentUsers = await pool.request()
      .query(`
        SELECT TOP 5
          name, email, createdAt, 'user_registered' as activityType
        FROM Users 
        WHERE DATEDIFF(day, createdAt, GETDATE()) <= 30
        ORDER BY createdAt DESC
      `);

    const recentProducts = await pool.request()
      .query(`
        SELECT TOP 5
          p.name as productName, 
          c.name as categoryName, 
          p.createdAt,
          'product_added' as activityType
        FROM Products p
        INNER JOIN Categories c ON p.categoryId = c.id
        WHERE DATEDIFF(day, p.createdAt, GETDATE()) <= 30
        ORDER BY p.createdAt DESC
      `);

    // Calculate estimated revenue (mock calculation based on product prices)
    const estimatedRevenue = await pool.request()
      .query(`
        SELECT 
          SUM(CAST(price as FLOAT)) * 0.05 as estimatedMonthlyRevenue,
          COUNT(*) * 12.5 as estimatedConversionRate
        FROM Products 
        WHERE status = 'active'
      `);

    console.log('✅ Analytics data fetched successfully');

    res.json({
      success: true,
      analytics: {
        users: userStats.recordset[0],
        categories: categoryStats.recordset[0],
        products: productStats.recordset[0],
        productsByCategory: productsByCategory.recordset,
        recentActivity: [
          ...recentUsers.recordset,
          ...recentProducts.recordset
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
        revenue: estimatedRevenue.recordset[0],
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// Get dashboard summary for main admin panel
app.get('/api/admin/dashboard-summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header format' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    const pool = await getDbConnection();

    // Quick summary for main dashboard
    const summary = await pool.request()
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM Users) as totalUsers,
          (SELECT COUNT(*) FROM Products WHERE status = 'active') as totalProducts,
          (SELECT SUM(CAST(price as FLOAT)) * 0.05 FROM Products WHERE status = 'active') as estimatedRevenue,
          (SELECT COUNT(*) * 12.5 / COUNT(*) FROM Products WHERE status = 'active') as conversionRate
      `);

    res.json({
      success: true,
      summary: summary.recordset[0]
    });

  } catch (error) {
    console.error('❌ Get dashboard summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard summary' });
  }
});

// ========== SEARCH API ENDPOINT ==========

// Search products and categories
app.get('/api/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, type = 'all', limit = 20 } = req.query;
    const query = String(q || '').trim();
    
    if (!query) {
      res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
      return;
    }

    console.log(`🔍 Search query: "${query}" | Type: ${type} | Limit: ${limit}`);
    const searchStart = Date.now();

    const pool = await getDbConnection();
    
    // Build search terms for better matching
    const searchTerms = query.split(' ').filter(term => term.length > 0);
    const searchPattern = `%${query}%`;
    const exactPattern = query.toLowerCase();

    let products: any[] = [];
    let categories: any[] = [];

    // Search Products (if type is 'all' or 'products')
    if (type === 'all' || type === 'products') {
      const productQuery = `
        WITH ProductSearch AS (
          SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p.originalPrice,
            p.affiliateLink,
            p.imageUrl,
            p.tags,
            p.createdAt,
            c.name as categoryName,
            c.id as categoryId,
            -- Relevance scoring
            CASE 
              WHEN LOWER(p.name) = @exactPattern THEN 100
              WHEN LOWER(p.name) LIKE '%' + @exactPattern + '%' THEN 80
              WHEN LOWER(p.description) LIKE @searchPattern THEN 60
              WHEN LOWER(p.tags) LIKE @searchPattern THEN 70
              WHEN LOWER(c.name) LIKE @searchPattern THEN 50
              ELSE 30
            END as relevanceScore
          FROM Products p
          INNER JOIN Categories c ON p.categoryId = c.id
          WHERE p.status = 'active' AND c.status = 'active'
            AND (
              LOWER(p.name) LIKE @searchPattern OR
              LOWER(p.description) LIKE @searchPattern OR
              LOWER(p.tags) LIKE @searchPattern OR
              LOWER(c.name) LIKE @searchPattern
            )
        )
        SELECT TOP ${Number(limit)} *
        FROM ProductSearch
        ORDER BY relevanceScore DESC, createdAt DESC
      `;

      const productResult = await pool.request()
        .input('searchPattern', sql.NVarChar, searchPattern)
        .input('exactPattern', sql.NVarChar, exactPattern)
        .query(productQuery);
      
      products = productResult.recordset;
    }

    // Search Categories (if type is 'all' or 'categories')
    if (type === 'all' || type === 'categories') {
      const categoryQuery = `
        WITH CategorySearch AS (
          SELECT 
            c.id,
            c.name,
            c.description,
            c.slug,
            c.imageUrl,
            COUNT(p.id) as productCount,
            -- Relevance scoring
            CASE 
              WHEN LOWER(c.name) = @exactPattern THEN 100
              WHEN LOWER(c.name) LIKE '%' + @exactPattern + '%' THEN 80
              WHEN LOWER(c.description) LIKE @searchPattern THEN 60
              ELSE 30
            END as relevanceScore
          FROM Categories c
          LEFT JOIN Products p ON c.id = p.categoryId AND p.status = 'active'
          WHERE c.status = 'active'
            AND (
              LOWER(c.name) LIKE @searchPattern OR
              LOWER(c.description) LIKE @searchPattern
            )
          GROUP BY c.id, c.name, c.description, c.slug, c.imageUrl
        )
        SELECT TOP ${Math.floor(Number(limit) / 2)} *
        FROM CategorySearch
        ORDER BY relevanceScore DESC, name ASC
      `;

      const categoryResult = await pool.request()
        .input('searchPattern', sql.NVarChar, searchPattern)
        .input('exactPattern', sql.NVarChar, exactPattern)
        .query(categoryQuery);
      
      categories = categoryResult.recordset;
    }

    const searchTime = Date.now() - searchStart;
    const totalResults = products.length + categories.length;

    // Generate search suggestions if no results
    let suggestions: string[] = [];
    if (totalResults === 0) {
      const suggestionQuery = `
        SELECT DISTINCT TOP 5 name as suggestion
        FROM (
          SELECT name FROM Products WHERE status = 'active'
          UNION
          SELECT name FROM Categories WHERE status = 'active'
        ) as AllNames
        WHERE LOWER(name) LIKE '%${query.slice(0, 3)}%'
        ORDER BY name
      `;
      
      try {
        const suggestionResult = await pool.request().query(suggestionQuery);
        suggestions = suggestionResult.recordset.map(row => row.suggestion);
      } catch (suggestionError) {
        console.warn('⚠️ Failed to generate suggestions:', suggestionError);
      }
    }

    console.log(`✅ Search completed: ${totalResults} results in ${searchTime}ms`);
    console.log(`📊 Products: ${products.length}, Categories: ${categories.length}`);

    res.json({
      success: true,
      results: {
        products,
        categories,
        totalResults,
        searchTime
      },
      query,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    });

  } catch (error) {
    console.error('❌ Search API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Search failed. Please try again.' 
    });
  }
});

// Quick search suggestions endpoint (for autocomplete)
app.get('/api/search/suggestions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    const query = String(q || '').trim();
    
    if (!query || query.length < 2) {
      res.json({ success: true, suggestions: [] });
      return;
    }

    const pool = await getDbConnection();
    const searchPattern = `%${query}%`;

    const suggestionQuery = `
      SELECT DISTINCT TOP 8 suggestion, type FROM (
        SELECT name as suggestion, 'product' as type, 
               CASE WHEN LOWER(name) LIKE '${query.toLowerCase()}%' THEN 1 ELSE 2 END as priority
        FROM Products 
        WHERE status = 'active' AND LOWER(name) LIKE @searchPattern
        
        UNION
        
        SELECT name as suggestion, 'category' as type,
               CASE WHEN LOWER(name) LIKE '${query.toLowerCase()}%' THEN 1 ELSE 2 END as priority
        FROM Categories 
        WHERE status = 'active' AND LOWER(name) LIKE @searchPattern
      ) as AllSuggestions
      ORDER BY priority, suggestion
    `;

    const result = await pool.request()
      .input('searchPattern', sql.NVarChar, searchPattern)
      .query(suggestionQuery);

    res.json({
      success: true,
      suggestions: result.recordset
    });

  } catch (error) {
    console.error('❌ Search suggestions error:', error);
    res.json({ success: true, suggestions: [] });
  }
});



// ========== PROFILE PICTURE UPLOAD ENDPOINT ==========

// Configure multer specifically for profile pictures (2MB limit)
const profileUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Update user profile picture
app.put('/api/users/profile-picture', profileUpload.single('profilePicture'), async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header format' });
      return;
    }

    const decoded = verifyToken(token);
    
    if (!req.file) {
      res.status(400).json({ success: false, error: 'Profile picture file is required' });
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024;
    if (req.file.size > maxSize) {
      res.status(400).json({ 
        success: false, 
        error: 'Profile picture must be less than 2MB. Large images will be automatically compressed.' 
      });
      return;
    }

    console.log(`📸 Profile picture upload started for user: ${decoded.email}`);
    console.log(`📊 File size: ${(req.file.size / 1024 / 1024).toFixed(2)}MB`);

    // ✅ CRITICAL FIX: Upload to ImageKit with proper folder structure
    const fileName = `profile_${decoded.userId}_${Date.now()}`;
    
    try {
      // ✅ FIXED: Explicitly pass 'profiles' folder to ensure proper organization
      const uploadResult = await uploadImage(req.file, fileName, 'profiles');
      
      console.log(`✅ Profile picture uploaded to ImageKit folder: ssecom/profiles/`);
      console.log(`🔗 Image URL: ${uploadResult.url}`);
      console.log(`📁 File ID: ${uploadResult.fileId}`);

      // Update user's picture in database
      const pool = await getDbConnection();
      const result = await pool.request()
        .input('userId', sql.NVarChar(50), decoded.userId)
        .input('picture', sql.NVarChar(500), uploadResult.url)
        .query(`
          UPDATE Users 
          SET picture = @picture, lastLoginAt = GETDATE()
          WHERE id = @userId
        `);

      if (result.rowsAffected[0] === 0) {
        // If database update fails, clean up uploaded image
        console.warn(`⚠️ Database update failed for user: ${decoded.userId}, cleaning up uploaded image`);
        try {
          await deleteImage(uploadResult.fileId);
          console.log(`🗑️ Cleaned up uploaded image: ${uploadResult.fileId}`);
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded image:', cleanupError);
        }
        
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      // Get updated user data
      const updatedUserResult = await pool.request()
        .input('userId', sql.NVarChar(50), decoded.userId)
        .query('SELECT id, email, name, picture, role FROM Users WHERE id = @userId');

      const updatedUser = updatedUserResult.recordset[0];

      console.log(`✅ Profile picture updated successfully for: ${decoded.email}`);
      console.log(`📸 New profile picture URL: ${updatedUser.picture}`);

      res.json({
        success: true,
        message: 'Profile picture updated successfully! 🔥',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          picture: updatedUser.picture,
          role: updatedUser.role,
          isUniversityStudent: false,
          universityDomain: undefined
        },
        imageUrl: uploadResult.url
      });

    } catch (uploadError) {
      console.error('❌ ImageKit upload failed:', uploadError);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to upload profile picture. Please try again.' 
      });
      return;
    }

  } catch (error) {
    console.error('❌ Profile picture upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload profile picture. Please try again.' 
    });
  }
});

// ========== BANNER MANAGEMENT ENDPOINTS ==========

// Get active banners for homepage (public endpoint)
app.get('/api/banners', async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = await getDbConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          id, title, description, imageUrl, ctaText, ctaLink, priority
        FROM Banners 
        WHERE isActive = 1 
        ORDER BY priority DESC, createdAt DESC
      `);

    console.log(`✅ Active banners fetched: ${result.recordset.length} banners`);
    res.json({ 
      success: true, 
      banners: result.recordset 
    });

  } catch (error) {
    console.error('❌ Get banners error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch banners' 
    });
  }
});

// Get all banners for admin (admin only)
app.get('/api/admin/banners', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          id, title, description, imageUrl, imageFileId, 
          ctaText, ctaLink, priority, isActive, createdAt, updatedAt
        FROM Banners 
        ORDER BY priority DESC, createdAt DESC
      `);

    console.log(`✅ Admin banners fetched: ${result.recordset.length} banners`);
    res.json({ 
      success: true, 
      banners: result.recordset 
    });

  } catch (error) {
    console.error('❌ Get admin banners error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch banners' 
    });
  }
});

// Create banner with image upload (admin only)
app.post('/api/admin/banners', upload.single('bannerImage'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, ctaText, ctaLink, priority = 0 } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    if (!title) {
      res.status(400).json({ success: false, error: 'Banner title is required' });
      return;
    }

    // Handle optional image upload
    let imageUrl = null;
    let imageFileId = null;

    if (req.file) {
      try {
        console.log(`📸 Uploading banner image: ${title}`);
        const fileName = `banner_${Date.now()}_${title.toLowerCase().replace(/\s+/g, '_')}`;
        
        const uploadResult = await uploadImage(req.file, fileName, 'banners');
        imageUrl = uploadResult.url;
        imageFileId = uploadResult.fileId;
        
        console.log(`✅ Banner image uploaded: ${uploadResult.url}`);
      } catch (uploadError) {
        console.error('❌ Banner image upload failed:', uploadError);
        res.status(500).json({ success: false, error: 'Failed to upload banner image' });
        return;
      }
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('title', sql.NVarChar(255), title)
      .input('description', sql.NVarChar(500), description || '')
      .input('imageUrl', sql.NVarChar(sql.MAX), imageUrl)
      .input('imageFileId', sql.NVarChar(sql.MAX), imageFileId)
      .input('ctaText', sql.NVarChar(100), ctaText || null)
      .input('ctaLink', sql.NVarChar(500), ctaLink || null)
      .input('priority', sql.Int, parseInt(priority) || 0)
      .query(`
        INSERT INTO Banners (title, description, imageUrl, imageFileId, ctaText, ctaLink, priority)
        OUTPUT INSERTED.id, INSERTED.title, INSERTED.createdAt
        VALUES (@title, @description, @imageUrl, @imageFileId, @ctaText, @ctaLink, @priority)
      `);

    console.log('✅ Banner created:', title, imageUrl ? 'with image' : 'without image');
    res.json({ 
      success: true, 
      message: 'Banner created successfully',
      banner: result.recordset[0]
    });

  } catch (error) {
    console.error('❌ Create banner error:', error);
    res.status(500).json({ success: false, error: 'Failed to create banner' });
  }
});

// Delete banner (admin only)
app.delete('/api/admin/banners/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    const pool = await getDbConnection();
    
    // Get banner image info before deletion
    const bannerResult = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query('SELECT title, imageFileId FROM Banners WHERE id = @id');

    if (bannerResult.recordset.length === 0) {
      res.status(404).json({ success: false, error: 'Banner not found' });
      return;
    }

    const banner = bannerResult.recordset[0];

    // Delete banner image from ImageKit if it exists
    if (banner.imageFileId) {
      try {
        await deleteImage(banner.imageFileId);
        console.log(`🗑️ Deleted banner image: ${banner.imageFileId}`);
      } catch (deleteError) {
        console.warn('⚠️ Failed to delete banner image:', deleteError);
      }
    }
    
    // Delete banner from database
    const result = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query('DELETE FROM Banners WHERE id = @id');

    console.log('✅ Banner deleted:', banner.title);
    res.json({ success: true, message: 'Banner and associated image deleted successfully' });

  } catch (error) {
    console.error('❌ Delete banner error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete banner' });
  }
});

// Toggle banner status (admin only)
app.patch('/api/admin/banners/:id/toggle', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    const pool = await getDbConnection();
    
    // Toggle the isActive status
    const result = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query(`
        UPDATE Banners 
        SET isActive = CASE WHEN isActive = 1 THEN 0 ELSE 1 END,
            updatedAt = GETDATE()
        OUTPUT INSERTED.isActive, INSERTED.title
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      res.status(404).json({ success: false, error: 'Banner not found' });
      return;
    }

    const updated = result.recordset[0];
    console.log(`✅ Banner status toggled: ${updated.title} -> ${updated.isActive ? 'Active' : 'Inactive'}`);
    
    res.json({ 
      success: true, 
      message: `Banner ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: updated.isActive
    });

  } catch (error) {
    console.error('❌ Toggle banner status error:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle banner status' });
  }
});

// Update banner (admin only)
app.put('/api/admin/banners/:id', upload.single('bannerImage'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, ctaText, ctaLink, priority, isActive, removeImage } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization required' });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Invalid authorization header' });
      return;
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    if (!title) {
      res.status(400).json({ success: false, error: 'Banner title is required' });
      return;
    }

    const pool = await getDbConnection();

    // Get existing banner
    const existingBanner = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query('SELECT imageUrl, imageFileId FROM Banners WHERE id = @id');

    if (existingBanner.recordset.length === 0) {
      res.status(404).json({ success: false, error: 'Banner not found' });
      return;
    }

    const existing = existingBanner.recordset[0];
    let newImageUrl = existing.imageUrl;
    let newImageFileId = existing.imageFileId;

    // Handle image removal
    if (removeImage === 'true' && existing.imageFileId) {
      try {
        await deleteImage(existing.imageFileId);
        console.log(`🗑️ Deleted old banner image: ${existing.imageFileId}`);
      } catch (deleteError) {
        console.warn('⚠️ Failed to delete old banner image:', deleteError);
      }
      newImageUrl = null;
      newImageFileId = null;
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image if it exists
      if (existing.imageFileId) {
        try {
          await deleteImage(existing.imageFileId);
          console.log(`🗑️ Replaced old banner image: ${existing.imageFileId}`);
        } catch (deleteError) {
          console.warn('⚠️ Failed to delete old banner image:', deleteError);
        }
      }

      try {
        console.log(`📸 Uploading new banner image: ${title}`);
        const fileName = `banner_${Date.now()}_${title.toLowerCase().replace(/\s+/g, '_')}`;
        
        const uploadResult = await uploadImage(req.file, fileName, 'banners');
        newImageUrl = uploadResult.url;
        newImageFileId = uploadResult.fileId;
        
        console.log(`✅ New banner image uploaded: ${uploadResult.url}`);
      } catch (uploadError) {
        console.error('❌ New banner image upload failed:', uploadError);
        res.status(500).json({ success: false, error: 'Failed to upload new banner image' });
        return;
      }
    }

    // Update banner
    const result = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .input('title', sql.NVarChar(255), title)
      .input('description', sql.NVarChar(500), description || '')
      .input('imageUrl', sql.NVarChar(sql.MAX), newImageUrl)
      .input('imageFileId', sql.NVarChar(sql.MAX), newImageFileId)
      .input('ctaText', sql.NVarChar(100), ctaText || null)
      .input('ctaLink', sql.NVarChar(500), ctaLink || null)
      .input('priority', sql.Int, parseInt(priority) || 0)
      .input('isActive', sql.Bit, isActive === 'true' ? 1 : 0)
      .query(`
        UPDATE Banners 
        SET title = @title, description = @description, imageUrl = @imageUrl, 
            imageFileId = @imageFileId, ctaText = @ctaText, ctaLink = @ctaLink,
            priority = @priority, isActive = @isActive, updatedAt = GETDATE()
        WHERE id = @id
      `);

    console.log('✅ Banner updated:', title);
    res.json({ success: true, message: 'Banner updated successfully' });

  } catch (error) {
    console.error('❌ Update banner error:', error);
    res.status(500).json({ success: false, error: 'Failed to update banner' });
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
  console.log(`💰 Affiliate Marketing Platform Ready!`);
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
