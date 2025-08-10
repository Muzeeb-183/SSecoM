import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  universityDomain?: string;
}

/**
 * Generate JWT token for authenticated user
 */
export const generateToken = (payload: JWTPayload): string => {
  const signOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'ssecom-backend',
    audience: 'ssecom-frontend'
  };

  return jwt.sign(payload, JWT_SECRET, signOptions);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  const signOptions: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'ssecom-backend',
    audience: 'ssecom-frontend'
  };

  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, signOptions);
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ssecom-backend',
      audience: 'ssecom-frontend'
    }) as JwtPayload & JWTPayload;

    // Ensure we return the correct interface
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      universityDomain: decoded.universityDomain
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ssecom-backend',
      audience: 'ssecom-frontend'
    }) as JwtPayload & { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};
