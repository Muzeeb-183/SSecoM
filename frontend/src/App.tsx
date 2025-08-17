// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPanel from './pages/AdminPanel';
import ProductManagement from './pages/ProductManagement';
import UserManagement from './pages/UserManagement';
import Analytics from './pages/Analytics';
import ProductDetail from './pages/ProductDetail';
import CategoryProducts from './pages/CategoryProducts';
import SearchResults from './pages/SearchResults'; // 🔥 NEW: Search Results Page

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeProvider';
import BannerManagement from './pages/BannerManagement';

// ✅ Enhanced loading component with fire theme
const LoadingSpinner: React.FC<{ message?: string; subtitle?: string }> = ({ 
  message = "Loading SSecoM...", 
  subtitle 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-red-900">
    <div className="flex flex-col items-center space-y-6 p-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent absolute top-0 left-0"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-orange-200">{message}</p>
        {subtitle && <p className="text-sm text-orange-400">{subtitle}</p>}
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

// ✅ Enhanced route protection with proper error handling
const RouteProtection: React.FC<{ 
  children: React.ReactNode;
  type: 'public' | 'protected' | 'admin';
}> = ({ children, type }) => {
  const { isAuthenticated, isLoading, user, isAdmin } = useAuth();

  // Enhanced debug logging for admin route
  React.useEffect(() => {
    if (type === 'admin') {
      console.log('🔍 Admin Route Protection Debug:');
      console.log('  - isAuthenticated:', isAuthenticated);
      console.log('  - isLoading:', isLoading);
      console.log('  - user exists:', !!user);
      console.log('  - user.email:', user?.email);
      console.log('  - user.role:', user?.role);
      console.log('  - isAdmin (computed):', isAdmin);
      console.log('  - Direct role check:', user?.role === 'admin');
    }
  }, [type, isAuthenticated, isLoading, user, isAdmin]);

  // Wait for loading to complete for ALL route types
  if (isLoading) {
    let message = "Loading SSecoM...";
    let subtitle = "";
    
    switch (type) {
      case 'admin':
        message = "Loading Admin Panel...";
        subtitle = "Verifying administrator permissions";
        break;
      case 'protected':
        message = "Verifying Access...";
        subtitle = "Checking authentication status";
        break;
      case 'public':
        message = "Loading Page...";
        break;
    }
    
    return <LoadingSpinner message={message} subtitle={subtitle} />;
  }

  // Route-specific logic - ONLY after loading is complete
  switch (type) {
    case 'public':
      return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
      
    case 'protected':
      return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
      
    case 'admin':
      console.log('🚨 Admin Route: Performing access checks (loading complete)...');
      
      if (!isAuthenticated) {
        console.log('❌ Admin Route: Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
      }
      
      if (!user) {
        console.log('❌ Admin Route: No user data available');
        return <Navigate to="/login" replace />;
      }
      
      // Enhanced admin role checking
      const userHasAdminRole = user.role === 'admin';
      const contextSaysAdmin = isAdmin === true;
      const finalAdminCheck = userHasAdminRole && contextSaysAdmin;
      
      console.log('🔍 Admin Role Analysis:');
      console.log('  - User role is admin:', userHasAdminRole);
      console.log('  - Context isAdmin:', contextSaysAdmin);
      console.log('  - Final admin decision:', finalAdminCheck);
      
      if (!finalAdminCheck) {
        console.log('❌ Admin Route: Access denied - insufficient privileges');
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center">
            <div className="text-center p-8 max-w-lg mx-auto">
              <div className="bg-gray-800 border border-red-500/50 rounded-2xl shadow-2xl p-8">
                <div className="text-6xl mb-6">🚫</div>
                <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
                <p className="text-orange-300 mb-6 leading-relaxed">
                  You don't have permission to access the admin panel. 
                  This area is restricted to platform administrators only.
                </p>
                
                {/* Enhanced debug information */}
                <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-orange-200 mb-2">Access Information:</h3>
                  <div className="text-sm text-orange-400 space-y-1">
                    <div>Email: {user.email}</div>
                    <div>Current Role: {user.role || 'user'}</div>
                    <div>Required Role: admin</div>
                    <div>Auth Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
                    <div>Admin Check: {isAdmin ? '✅ Admin' : '❌ Not Admin'}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <a 
                    href="/" 
                    className="inline-block px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-red-700 transition-colors transform hover:scale-105 border border-orange-400"
                  >
                    Return to Home
                  </a>
                  
                  {import.meta.env.DEV && (
                    <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-500/30 rounded-lg">
                      <p className="text-xs text-yellow-300 font-medium">
                        🔧 Dev Mode: Check console logs for detailed debugging info
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      console.log('✅ Admin Route: Access granted!');
      return <>{children}</>;
      
    default:
      return <>{children}</>;
  }
};

// ✅ Component to conditionally render header based on current route
const ConditionalHeader: React.FC = () => {
  const location = useLocation();
  
  // Define routes where header should be hidden
  const hideHeaderRoutes = ['/product/', '/category/'];
  
  // Check if current path starts with any of the hideHeaderRoutes
  const shouldHideHeader = hideHeaderRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  // 🔥 SEARCH PAGE WILL SHOW HEADER (since /search is not in hideHeaderRoutes)
  // Don't render header on product detail pages and category pages
  if (shouldHideHeader) {
    return null;
  }
  
  return <Header />;
};

// ✅ FIXED: Proper provider hierarchy - CartProvider inside Router
const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          {/* ✅ FIXED: Router wraps CartProvider, not the other way around */}
          <Router>
            <CartProvider>
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex flex-col">
                
                {/* ✅ Conditional Header Navigation - Hidden on product and category pages */}
                <ConditionalHeader />
                
                {/* ✅ Main Content Area */}
                <main className="flex-grow">
                  <Routes>
                    {/* Public Routes - Anyone can access */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    
                    {/* 🔥 NEW: Search Results Route - WITH HEADER */}
                    <Route path="/search" element={<SearchResults />} />
                    
                    {/* Category Products Route - NO HEADER */}
                    <Route path="/category/:categoryId" element={<CategoryProducts />} />
                    
                    {/* Product Detail Route - NO HEADER */}
                    <Route path="/product/:productId" element={<ProductDetail />} />
                    
                    {/* Authentication Routes - Only for non-authenticated users */}
                    <Route 
                      path="/login" 
                      element={
                        <RouteProtection type="public">
                          <LoginPage />
                        </RouteProtection>
                      } 
                    />
                    <Route 
                      path="/register" 
                      element={
                        <RouteProtection type="public">
                          <RegisterPage />
                        </RouteProtection>
                      } 
                    />
                    
                    {/* Semi-Protected Routes - Can view without auth, but better with auth */}
                    <Route path="/cart" element={<CartPage />} />
                    
                    {/* Protected Routes - Require authentication */}
                    <Route 
                      path="/checkout" 
                      element={
                        <RouteProtection type="protected">
                          <CheckoutPage />
                        </RouteProtection>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <RouteProtection type="protected">
                          <ProfilePage />
                        </RouteProtection>
                      } 
                    />
                    
                    {/* Admin Routes */}
                    <Route 
                      path="/admin" 
                      element={
                        <RouteProtection type="admin">
                          <AdminPanel />
                        </RouteProtection>
                      } 
                    />
                    <Route 
                      path="/admin/products" 
                      element={
                        <RouteProtection type="admin">
                          <ProductManagement />
                        </RouteProtection>
                      } 
                    />
                    <Route 
                      path="/admin/users" 
                      element={
                        <RouteProtection type="admin">
                          <UserManagement />
                        </RouteProtection>
                      } 
                    />
                    <Route 
                      path="/admin/analytics" 
                      element={
                        <RouteProtection type="admin">
                          <Analytics />
                        </RouteProtection>
                      } 
                    />
                    <Route path="/admin/banners" element={<BannerManagement />} />

                    
                    {/* 🔥 Additional Routes */}
                    <Route 
                      path="/profile" 
                      element={
                        <RouteProtection type="protected">
                          <ProfilePage />
                        </RouteProtection>
                      } 
                    />
                    
                    {/* Affiliate Marketing Routes */}
                    <Route path="/deals" element={<ProductsPage />} />
                    <Route path="/categories" element={<ProductsPage />} />
                    <Route path="/wishlist" element={<CartPage />} />
                    
                    {/* Catch-all route for 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                
                {/* ✅ Footer */}
                <Footer />
                
                {/* ✅ Enhanced Toast Notifications with Fire Theme */}
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                      color: '#f97316',
                      border: '1px solid #f97316',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(249, 115, 22, 0.2), 0 10px 10px -5px rgba(249, 115, 22, 0.1)',
                      fontSize: '14px',
                      fontWeight: '600',
                      maxWidth: '500px',
                      padding: '16px 20px'
                    },
                    success: {
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#FFFFFF'
                      },
                      style: {
                        border: '1px solid #22c55e',
                        background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
                        color: '#22c55e'
                      }
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#FFFFFF'
                      },
                      style: {
                        border: '1px solid #ef4444',
                        background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
                        color: '#ef4444'
                      }
                    },
                    loading: {
                      iconTheme: {
                        primary: '#f97316',
                        secondary: '#FFFFFF'
                      },
                      style: {
                        border: '1px solid #f97316',
                        background: 'linear-gradient(135deg, #9a3412 0%, #7c2d12 100%)',
                        color: '#f97316'
                      }
                    }
                  }}
                />
              </div>
            </CartProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
