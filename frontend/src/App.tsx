import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components (we'll create these in upcoming steps)
import Header from './components/Header';
import Footer from './components/Footer';

// Pages (we'll create these in upcoming steps)
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartProvider'; // We'll need to create this
import { ThemeProvider } from './context/ThemeProvider'; // We'll need to create this

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

// Public Route Component (redirects authenticated users)
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
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          
          {/* Authentication Routes */}
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
          
          {/* Semi-Protected Routes (can view cart without auth, but need auth for checkout) */}
          <Route path="/cart" element={<CartPage />} />
          
          {/* Protected Routes (require authentication) */}
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
          
          {/* Admin Routes (future enhancement - for university admin) */}
          {user?.isUniversityStudent && (
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <h1 className="text-2xl font-bold text-heading">University Admin Panel (Coming Soon)</h1>
                  </div>
                </ProtectedRoute>
              } 
            />
          )}
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Toast Notifications with Authentication-aware styling */}
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
      
      {/* Development Helper - Shows authentication status */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 bg-logo-purple text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg z-50 flex items-center space-x-2">
          <span>SSecoM Dev 🚀</span>
          <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span>{isAuthenticated ? 'Auth ✓' : 'No Auth'}</span>
          {user?.isUniversityStudent && <span>🎓</span>}
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
