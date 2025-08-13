import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

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
      } else {
        // Update existing user's last login and profile, preserve role
        const existingUser = existingUserResult.recordset[0];
        userRole = existingUser.role;
        
        console.log('🔄 Updating existing user:', googleUser.email, 'with role:', userRole);
        
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

      // Create JWT payload with role
      const jwtPayload: JWTPayload = {
        userId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        role: userRole // Include role in JWT
      };

      // Generate JWT token
      const jwtToken = generateToken(jwtPayload);

      // Log successful authentication
      console.log('🎓 User authenticated and saved to database:', {
        email: googleUser.email,
        role: userRole,
        timestamp: new Date().toISOString()
      });

      // Send response with role information
      console.log('📤 Sending successful authentication response to frontend...');
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          role: userRole,
          isUniversityStudent: false,
          universityDomain: undefined
        },
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

// JWT verification endpoint with proper null checking
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
    console.log('✅ Token verified successfully for:', decoded.email, 'Role:', decoded.role);
    console.log('🔍 Decoded token data:', decoded);
    
    res.json({
      success: true,
      message: 'Token is valid',
      user: decoded
    });
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
  app.get('/api/homepage', async (req: Request, res: Response): Promise<void> => {
    try {
      const pool = await getDbConnection();

      // Get all active categories with product counts
      const categories = await pool.request()
        .query(`
          SELECT 
            c.id,
            c.name,
            c.description,
            c.slug,
            COUNT(p.id) as productCount,
            COALESCE(SUM(CASE WHEN DATEDIFF(day, p.createdAt, GETDATE()) <= 7 THEN 1 ELSE 0 END), 0) as recentProducts
          FROM Categories c
          LEFT JOIN Products p ON c.id = p.categoryId AND p.status = 'active'
          WHERE c.status = 'active'
          GROUP BY c.id, c.name, c.description, c.slug
          ORDER BY productCount DESC, c.name ASC
        `);

      // Get featured products (latest products from each category)
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

      // Get latest products (most recent across all categories)
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

      // Get platform stats
      const stats = await pool.request()
        .query(`
          SELECT 
            (SELECT COUNT(*) FROM Users) as totalUsers,
            (SELECT COUNT(*) FROM Products WHERE status = 'active') as totalProducts,
            (SELECT COUNT(*) FROM Categories WHERE status = 'active') as totalCategories,
            (SELECT COALESCE(SUM(CAST(price as FLOAT)), 0) FROM Products WHERE status = 'active') as totalValue
        `);

      console.log('✅ Homepage data fetched successfully');

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

// ========== CATEGORY MANAGEMENT ENDPOINTS ==========

// Get all categories
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
      .query('SELECT id, name, description, slug, status, createdAt FROM Categories ORDER BY name ASC');

    res.json({ 
      success: true, 
      categories: result.recordset 
    });

  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// Create category
app.post('/api/admin/categories', async (req: Request, res: Response): Promise<void> => {
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

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('name', sql.NVarChar(255), name)
      .input('description', sql.NVarChar(500), description || '')
      .input('slug', sql.NVarChar(255), slug)
      .query(`
        INSERT INTO Categories (name, description, slug)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.slug, INSERTED.createdAt
        VALUES (@name, @description, @slug)
      `);

    console.log('✅ Category created:', name);
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

// Update category
app.put('/api/admin/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .input('name', sql.NVarChar(255), name)
      .input('description', sql.NVarChar(500), description || '')
      .input('slug', sql.NVarChar(255), slug)
      .query(`
        UPDATE Categories 
        SET name = @name, description = @description, slug = @slug, updatedAt = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    console.log('✅ Category updated:', name);
    res.json({ 
      success: true, 
      message: 'Category updated successfully' 
    });

  } catch (error) {
    console.error('❌ Update category error:', error);
    res.status(500).json({ success: false, error: 'Failed to update category' });
  }
});

// Delete category
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
    
    // First delete all products in this category
    await pool.request()
      .input('categoryId', sql.NVarChar(50), id)
      .query('DELETE FROM Products WHERE categoryId = @categoryId');
    
    // Then delete the category
    const result = await pool.request()
      .input('id', sql.NVarChar(50), id)
      .query('DELETE FROM Categories WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    console.log('✅ Category deleted:', id);
    res.json({ success: true, message: 'Category and associated products deleted successfully' });

  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
});


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
