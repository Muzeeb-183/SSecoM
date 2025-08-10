import React, { useState, useEffect } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google authentication failed - no credential received');
      return;
    }

    try {
      setIsAuthenticating(true);
      console.log('🔐 Processing Google OAuth response...');
      
      await login(credentialResponse.credential);
      
      toast.success('🎓 Welcome to SSecoM! Login successful', {
        duration: 4000,
        position: 'top-center'
      });
      
      // Redirect to intended page or dashboard
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(`❌ ${errorMessage}`, {
        duration: 6000,
        position: 'top-center'
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google OAuth failed');
    toast.error('Google authentication was cancelled or failed', {
      duration: 5000,
      position: 'top-center'
    });
  };

  // Show loading state during auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-content-bg to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-logo-purple"></div>
          <p className="text-subheading font-medium">Loading SSecoM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-content-bg to-purple-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card-bg rounded-2xl shadow-card-hover border border-border-light p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-logo-purple to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">SS</span>
            </div>
            <h1 className="text-3xl font-bold text-heading mb-2">Welcome to SSecoM</h1>
            <p className="text-body-text">Your Student Ecommerce Platform</p>
            <p className="text-sm text-subheading mt-2">Sign in with your Google account to continue</p>
          </div>

          {/* Google OAuth Button */}
          <div className="space-y-6">
            <div className="flex justify-center">
              {isAuthenticating ? (
                <div className="flex items-center space-x-3 py-3 px-6 bg-gray-100 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-logo-purple"></div>
                  <span className="text-subheading font-medium">Signing you in...</span>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  text="signin_with"
                  shape="rectangular"
                  size="large"
                  width="280"
                />
              )}
            </div>

            {/* Student Benefits */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-logo-purple mb-2 flex items-center">
                <span className="mr-2">🎓</span>
                Student Benefits
              </h3>
              <ul className="text-sm text-subheading space-y-1">
                <li className="flex items-center">
                  <span className="mr-2">✨</span>
                  Exclusive student discounts
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📚</span>
                  University-verified pricing
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🚚</span>
                  Campus delivery options
                </li>
                <li className="flex items-center">
                  <span className="mr-2">👥</span>
                  Student community features
                </li>
              </ul>
            </div>

            {/* Privacy Notice */}
            <div className="text-center">
              <p className="text-xs text-body-text">
                By signing in, you agree to our{' '}
                <a href="/terms" className="text-logo-purple hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-logo-purple hover:underline">Privacy Policy</a>
              </p>
              <p className="text-xs text-body-text mt-1">
                🔒 Your data is secure and never shared with third parties
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-subheading">
            New to SSecoM?{' '}
            <span className="text-logo-purple font-medium">Sign in to get started!</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
