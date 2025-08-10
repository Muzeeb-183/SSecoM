import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPanel from './pages/AdminPanel'; // Added for affiliate management

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartProvider';
import { ThemeProvider } from './context/ThemeProvider';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-logo-purple"></div>
          <p className="text-subheading font-medium">Loading SSecoM...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirects authenticated users away from login/register)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-logo-purple"></div>
          <p className="text-subheading font-medium">Loading SSecoM...</p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Admin Route Component (only for platform owner)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-logo-purple"></div>
          <p className="text-subheading font-medium">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and is the platform admin
  const isAdmin = user?.email === 'your-admin-email@gmail.com'; // Replace with your actual Gmail
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-content-bg flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <a href="/" className="text-purple-600 hover:text-purple-800 underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// App Routes Component (inside AuthProvider)
const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-content-bg flex flex-col">
      {/* Header Navigation */}
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes - Anyone can access */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          
          {/* Authentication Routes - Only for non-authenticated users */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          
          {/* Semi-Protected Routes - Can view without auth, but better with auth */}
          <Route path="/cart" element={<CartPage />} />
          
          {/* Protected Routes - Require authentication */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Route - Only for platform owner (you) */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } 
          />
          
          {/* Affiliate Marketing Routes - Future enhancement */}
          <Route path="/deals" element={<ProductsPage />} />
          <Route path="/categories" element={<ProductsPage />} />
          <Route path="/wishlist" element={<CartPage />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Toast Notifications - Affiliate marketing focused */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#374151',
            border: '1px solid #E0F2FE',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 25px -3px rgba(124, 58, 237, 0.1)',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '500px'
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
      
      {/* Development Helper - Shows authentication and admin status */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 bg-logo-purple text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg z-50 flex items-center space-x-2">
          <span>SSecoM Dev 🚀</span>
          <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span>{isAuthenticated ? 'Auth ✓' : 'No Auth'}</span>
          {user?.email === 'your-admin-email@gmail.com' && <span>👑 Admin</span>}
          <span>💰 Affiliate Mode</span>
        </div>
      )}
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
