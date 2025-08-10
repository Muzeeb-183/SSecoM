import { OAuth2Client } from 'google-auth-library';

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  emailVerified: boolean;
  universityDomain?: string;
}

/**
 * Verify Google ID token and extract user information
 */
export const verifyGoogleToken = async (idToken: string): Promise<GoogleUserInfo> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    // Check if email is from a university domain
    const emailDomain = payload.email?.split('@')[1];
    const isUniversityEmail = emailDomain?.includes('.edu') || 
                             emailDomain?.includes('university') ||
                             emailDomain?.includes('college');

    return {
      googleId: payload.sub!,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture || '',
      emailVerified: payload.email_verified || false,
      universityDomain: isUniversityEmail ? emailDomain : undefined
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
};
