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
    console.log('🔍 LoginPage - Auth status check:', { isAuthenticated, isLoading });
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      console.log('✅ User already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, isLoading]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log('🎯 Google OAuth callback triggered');
    console.log('📋 Credential response received:', !!credentialResponse.credential);
    
    if (!credentialResponse.credential) {
      console.error('❌ No credential in Google response');
      toast.error('Google authentication failed - no credential received');
      return;
    }

    try {
      setIsAuthenticating(true);
      console.log('🔐 About to call AuthContext login function...');
      
      // Call AuthContext login function
      await login(credentialResponse.credential);
      
      console.log('✅ AuthContext login completed successfully');
      
      // Check if tokens were saved to localStorage
      const savedToken = localStorage.getItem('ssecom_token');
      const savedUser = localStorage.getItem('ssecom_user');
      console.log('🔍 Post-login localStorage check:');
      console.log('  - Token saved:', !!savedToken);
      console.log('  - User saved:', !!savedUser);
      
      if (!savedToken || !savedUser) {
        console.error('⚠️ WARNING: Tokens not found in localStorage after login!');
        toast.error('Login succeeded but session not saved. Please try again.');
        return;
      }
      
      toast.success('🎓 Welcome to SSecoM! Login successful', {
        duration: 4000,
        position: 'top-center'
      });
      
      // Redirect to intended page or dashboard
      const from = (location.state as any)?.from?.pathname || '/';
      console.log('🏠 Redirecting to:', from);
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('❌ Login error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(`❌ ${errorMessage}`, {
        duration: 6000,
        position: 'top-center'
      });
    } finally {
      setIsAuthenticating(false);
      console.log('🏁 Login process completed');
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Google OAuth failed or cancelled');
    toast.error('Google authentication was cancelled or failed', {
      duration: 5000,
      position: 'top-center'
    });
  };

  // Show loading state during auth check
  if (isLoading) {
    console.log('⏳ LoginPage showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-red-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-orange-200 font-medium">Loading SSecoM...</p>
          <p className="text-xs text-orange-400">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  console.log('🎨 LoginPage rendering login form');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-xl font-bold text-white">SS</span>
            </div>
            <span className="text-2xl font-bold text-orange-200">SSecoM</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT SIDE: Copy Content */}
          <div className="space-y-8">
            
            {/* Main Headline Section */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-orange-200 mb-4 leading-tight">
                Welcome Back to Your Personal Student Shopping Advisor!
              </h1>
              <p className="text-xl text-orange-300 mb-8 leading-relaxed">
                Sign in to discover what thousands of students already know - SSM finds the best so you don't have to.
              </p>
            </div>

            {/* Value Proposition */}
            <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 border border-orange-500/30">
              <h2 className="text-2xl font-bold text-orange-200 mb-4 flex items-center">
                🎯 Why Students Choose SSM Daily:
              </h2>
              <p className="text-orange-300 mb-4 italic">
                "Tired of endless scrolling and bad purchases? We've got your back."
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-sm mt-1">✅</span>
                  <div>
                    <span className="font-semibold text-orange-200">Handpicked by Fellow Students</span>
                    <p className="text-orange-400 text-sm">Every product is researched and tested by students just like you</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-sm mt-1">✅</span>
                  <div>
                    <span className="font-semibold text-orange-200">Save Hours of Research</span>
                    <p className="text-orange-400 text-sm">We do the homework, you get the A+ products</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-sm mt-1">✅</span>
                  <div>
                    <span className="font-semibold text-orange-200">Budget-Smart Choices</span>
                    <p className="text-orange-400 text-sm">Quality meets affordability in every recommendation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-sm mt-1">✅</span>
                  <div>
                    <span className="font-semibold text-orange-200">Trend-Proof Shopping</span>
                    <p className="text-orange-400 text-sm">Stay ahead with what's actually popular on campus</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Building Section */}
            <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 border border-orange-500/30">
              <h3 className="text-2xl font-bold text-orange-200 mb-4 flex items-center">
                🤝 Students Helping Students Since Day One
              </h3>
              <p className="text-orange-300 mb-4 italic">
                "We're not some corporate giant trying to sell you everything. We're your classmates who got tired of wasting money on products that looked good online but sucked in real life."
              </p>
              
              <div className="mb-4">
                <h4 className="font-semibold text-orange-200 mb-2">What happens when you sign in:</h4>
                <ul className="space-y-2 text-orange-400">
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Get personalized recommendations based on your course and lifestyle
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Access exclusive student deals we've negotiated
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Join our community of smart shoppers
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Never waste money on regretful purchases again
                  </li>
                </ul>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 border border-orange-500/30">
              <h3 className="text-2xl font-bold text-orange-200 mb-4 flex items-center">
                📈 Join 50,000+ Students Who Shop Smarter
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-orange-300 italic mb-2">
                    "Finally, a site that gets what students actually need!"
                  </p>
                  <p className="text-orange-400 text-sm">- Sarah, Engineering Student</p>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-orange-300 italic mb-2">
                    "Saved me ₹15,000 last semester on textbooks and laptop alone."
                  </p>
                  <p className="text-orange-400 text-sm">- Arjun, MBA Student</p>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-orange-300 italic mb-2">
                    "My go-to for everything from study gear to party outfits."
                  </p>
                  <p className="text-orange-400 text-sm">- Priya, Arts Student</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Login Form */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl shadow-2xl border-2 border-orange-500/50 p-8">
              
              {/* Call to Action Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-orange-200 mb-4 flex items-center justify-center">
                  🚀 Ready to Shop Like a Pro?
                </h2>
                <p className="text-orange-300">Sign in to your account and start saving!</p>
              </div>

              {/* Google OAuth Button */}
              <div className="space-y-6">
                <div className="flex justify-center">
                  {isAuthenticating ? (
                    <div className="flex items-center space-x-3 py-4 px-8 bg-gray-700 rounded-xl border border-orange-500/50">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                      <span className="text-orange-200 font-medium">Signing you in...</span>
                    </div>
                  ) : (
                    <div className="w-full max-w-sm">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap={false}
                        text="signin_with"
                        shape="rectangular"
                        size="large"
                        width="100%"
                      />
                    </div>
                  )}
                </div>

                {/* New User Section */}
                <div className="text-center">
                  <p className="text-orange-300 mb-2">New here?</p>
                  <p className="text-orange-400 text-sm">
                    Create Your Free Account - Takes 30 seconds, saves you thousands
                  </p>
                </div>

                {/* Privacy & Security */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-orange-300 font-semibold mb-2">🔒 Secure & Trusted</p>
                    <div className="flex justify-center space-x-4 text-sm text-orange-400">
                      <span>🔒 Secure Sign-In</span>
                      <span>💯 Trusted Nationwide</span>
                      <span>🎓 By Students, For Students</span>
                    </div>
                  </div>
                </div>

                {/* Debug Info - Development Only */}
                {/* {import.meta.env.DEV && (
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                    <h4 className="font-semibold text-gray-300 mb-2 flex items-center">
                      <span className="mr-2">🔧</span>
                      Debug Info (Dev Only)
                    </h4>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>Auth Loading: {isLoading ? 'Yes' : 'No'}</div>
                      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
                      <div>Authenticating: {isAuthenticating ? 'Yes' : 'No'}</div>
                      <div>API URL: {import.meta.env.VITE_API_URL}</div>
                    </div>
                  </div>
                )} */}

                {/* Terms & Privacy */}
                <div className="text-center">
                  <p className="text-xs text-orange-400">
                    By signing in, you agree to our{' '}
                    <a href="/terms" className="text-orange-300 hover:text-orange-200 underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-orange-300 hover:text-orange-200 underline">Privacy Policy</a>
                  </p>
                  <p className="text-xs text-orange-400 mt-2">
                    🔒 Your data is secure and never shared with third parties
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Banner */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6 bg-gradient-to-r from-gray-800 to-black rounded-full px-8 py-4 border border-orange-500/50">
            <span className="text-orange-300 font-semibold">🔒 Secure Sign-In</span>
            <span className="text-orange-300">•</span>
            <span className="text-orange-300 font-semibold">💯 Trusted by Students Nationwide</span>
            <span className="text-orange-300">•</span>
            <span className="text-orange-300 font-semibold">🎓 Made by Students, For Students</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
