import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Updated User interface with role support (keeping it simple)
export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: string; // Added for admin system
  isUniversityStudent: boolean;
  universityDomain?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean; // Added for admin check
  login: (credential: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => void;
  grantAdminAccess: (email: string) => Promise<boolean>; // Admin management
  revokeAdminAccess: (email: string) => Promise<boolean>; // Admin management
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to check if current user is admin
  const isAdmin = user?.role === 'admin';

  // Helper function to clear auth data
  const clearAuthData = () => {
    console.log('🧹 Clearing authentication data...');
    localStorage.removeItem('ssecom_token');
    localStorage.removeItem('ssecom_user');
    setToken(null);
    setUser(null);
    console.log('✅ Authentication data cleared');
  };

  // SIMPLE: Back to the working version's auth check
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        console.log('🔍 Checking existing authentication...');
        const savedToken = localStorage.getItem('ssecom_token');
        const savedUser = localStorage.getItem('ssecom_user');

        if (savedToken && savedUser) {
          console.log('📱 Found saved token and user in localStorage');
          
          // Verify token is still valid with backend
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Token verified successfully, restoring session');
            console.log('👑 User role:', data.user.role);
            
            setToken(savedToken);
            setUser(data.user); // Use fresh user data from backend (includes role)
            console.log('✅ Existing authentication restored for:', data.user.email);
          } else {
            console.log('❌ Token verification failed:', response.status, response.statusText);
            
            // Token is invalid, clear storage
            console.log('🔄 Clearing invalid authentication data');
            clearAuthData();
          }
        } else {
          console.log('📭 No saved authentication found');
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
        console.log('✅ Authentication check completed');
      }
    };

    checkExistingAuth();
  }, []); // Simple empty dependency array - no complex state tracking

  // SIMPLE: Back to the working version's login
  const login = async (credential: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Authenticating with Google OAuth...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credential })
      });

      const data = await response.json();
      console.log('📡 Login response received');

      if (!response.ok) {
        throw new Error(data.error || `Authentication failed: ${response.status}`);
      }
      
      if (data.success) {
        console.log('✅ Authentication successful, saving session data');
        console.log('👑 User role:', data.user.role);
        
        // Save authentication data
        setToken(data.token);
        setUser(data.user);
        
        // Persist to localStorage
        localStorage.setItem('ssecom_token', data.token);
        localStorage.setItem('ssecom_user', JSON.stringify(data.user));
        
        console.log('🎓 Student authenticated and session saved:', data.user.email);
        
        // Log admin status
        if (data.user.role === 'admin') {
          console.log('👑 Admin access granted for platform management');
        }
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      clearAuthData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced logout with proper cleanup
  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('👋 Logging out user...');
      
      // Optional: Call backend logout endpoint
      if (token) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ Backend logout completed');
        } catch (error) {
          console.warn('⚠️ Backend logout failed, continuing with local logout');
        }
      }

      // Clear local state and storage
      clearAuthData();
      console.log('✅ User logged out successfully');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force local logout even if backend fails
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh authentication token
  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!token) return false;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem('ssecom_token', data.token);
        console.log('🔄 Token refreshed successfully');
        return true;
      } else {
        console.log('🔄 Token refresh failed, logging out');
        logout();
        return false;
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      logout();
      return false;
    }
  };

  // Update user profile
  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('ssecom_user', JSON.stringify(updatedUser));
      console.log('👤 Profile updated:', updates);
    }
  };

  // Grant admin access to a user (admin only)
  const grantAdminAccess = async (email: string): Promise<boolean> => {
    try {
      if (!token || !isAdmin) {
        throw new Error('Admin access required');
      }

      console.log('👑 Granting admin access to:', email);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/grant-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Admin access granted to:', email);
        return true;
      } else {
        throw new Error(data.error || 'Failed to grant admin access');
      }
    } catch (error) {
      console.error('❌ Grant admin failed:', error);
      throw error;
    }
  };

  // Revoke admin access from a user (admin only)
  const revokeAdminAccess = async (email: string): Promise<boolean> => {
    try {
      if (!token || !isAdmin) {
        throw new Error('Admin access required');
      }

      console.log('👤 Revoking admin access from:', email);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/revoke-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Admin access revoked from:', email);
        return true;
      } else {
        throw new Error(data.error || 'Failed to revoke admin access');
      }
    } catch (error) {
      console.error('❌ Revoke admin failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isAdmin, // Helper property for admin check
    login,
    logout,
    refreshToken,
    updateProfile,
    grantAdminAccess,
    revokeAdminAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
