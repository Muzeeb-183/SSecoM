import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
// import ProductDetailPage from './pages/ProductDetailPage';
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

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartProvider';
import { ThemeProvider } from './context/ThemeProvider';

// Enhanced loading component with better UX
const LoadingSpinner: React.FC<{ message?: string; subtitle?: string }> = ({ 
  message = "Loading SSecoM...", 
  subtitle 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-content-bg to-purple-50">
    <div className="flex flex-col items-center space-y-6 p-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-logo-purple border-t-transparent absolute top-0 left-0"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-heading">{message}</p>
        {subtitle && <p className="text-sm text-subheading">{subtitle}</p>}
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-logo-purple rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-logo-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-logo-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

// Enhanced route protection with comprehensive admin checking
// FIXED: Enhanced route protection with proper loading handling
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

  // CRITICAL FIX: Wait for loading to complete for ALL route types
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
      
      // Now we can safely check authentication
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
          <div className="min-h-screen bg-gradient-to-br from-content-bg to-red-50 flex items-center justify-center">
            <div className="text-center p-8 max-w-lg mx-auto">
              <div className="bg-white border border-red-200 rounded-2xl shadow-lg p-8">
                <div className="text-6xl mb-6">🚫</div>
                <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  You don't have permission to access the admin panel. 
                  This area is restricted to platform administrators only.
                </p>
                
                {/* Enhanced debug information */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-700 mb-2">Access Information:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
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
                    className="inline-block px-8 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors transform hover:scale-105"
                  >
                    Return to Home
                  </a>
                  
                  {import.meta.env.DEV && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 font-medium">
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

// Component to conditionally render header based on current route
const ConditionalHeader: React.FC = () => {
  const location = useLocation();
  
  // Define routes where header should be hidden - UPDATED to include category pages
  const hideHeaderRoutes = ['/product/', '/category/'];
  
  // Check if current path starts with any of the hideHeaderRoutes
  const shouldHideHeader = hideHeaderRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  // Don't render header on product detail pages and category pages
  if (shouldHideHeader) {
    return null;
  }
  
  return <Header />;
};

// Enhanced App Routes Component with better organization
const AppRoutes: React.FC = () => {
  const { isAuthenticated, user, isAdmin, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-content-bg flex flex-col">
      {/* Conditional Header Navigation - Hidden on product and category pages */}
      <ConditionalHeader />
      
      {/* Main Content Area */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes - Anyone can access */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          
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
          
          {/* Affiliate Marketing Routes */}
          <Route path="/deals" element={<ProductsPage />} />
          <Route path="/categories" element={<ProductsPage />} />
          <Route path="/wishlist" element={<CartPage />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Enhanced Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#FFFFFF',
            color: '#374151',
            border: '1px solid #E0F2FE',
            borderRadius: '1rem',
            boxShadow: '0 20px 25px -5px rgba(124, 58, 237, 0.1), 0 10px 10px -5px rgba(124, 58, 237, 0.04)',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '500px',
            padding: '16px 20px'
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#FFFFFF'
            },
            style: {
              border: '1px solid #059669',
              background: '#F0FDF4'
            }
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF'
            },
            style: {
              border: '1px solid #EF4444',
              background: '#FEF2F2'
            }
          },
          loading: {
            iconTheme: {
              primary: '#7C3AED',
              secondary: '#FFFFFF'
            },
            style: {
              border: '1px solid #7C3AED',
              background: '#F5F3FF'
            }
          }
        }}
      />
    </div>
  );
};


// Main App Component with Context Providers
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
