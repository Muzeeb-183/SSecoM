import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartProvider';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();

  // Check if current user is admin (platform owner)
  const isAdmin = user?.email === 'your-admin-email@gmail.com'; // Replace with your actual Gmail

  return (
    <header className="bg-navbar-bg shadow-student border-b border-border-light sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-logo-purple to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">SS</span>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-heading">SSecoM</h1>
                <p className="text-xs text-purple-600">Student Deals & More</p>
              </div>
            </a>
          </div>

          {/* Navigation - Affiliate Marketing Focused */}
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-nav-text hover:text-nav-hover flex items-center">
              🏠 Home
            </a>
            <a href="/products" className="text-nav-text hover:text-nav-hover flex items-center">
              🛍️ All Products
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
            </a>
            <a href="/deals" className="text-nav-text hover:text-nav-hover flex items-center">
              🔥 Best Deals
              <span className="ml-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">HOT</span>
            </a>
            <a href="/categories" className="text-nav-text hover:text-nav-hover">
              📂 Categories
            </a>
            <a href="/wishlist" className="text-nav-text hover:text-nav-hover relative">
              ❤️ Wishlist
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-logo-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </a>
            
            {/* Admin Link - Only visible to platform owner */}
            {isAdmin && (
              <a href="/admin" className="text-nav-text hover:text-nav-hover flex items-center">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs mr-1">
                  👑
                </span>
                Admin Panel
              </a>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.picture} 
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border-2 border-purple-200"
                />
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-heading font-medium">{user?.name}</span>
                    {isAdmin && (
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs">
                        👑 Owner
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-purple-600">💰 Saved: ₹2,450 this month</div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-logo-purple hover:bg-button-hover rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-logo-purple hover:bg-button-hover rounded-lg transition-colors"
              >
                🎯 Join & Save Money
              </a>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle - Future Enhancement */}
        <div className="md:hidden">
          <button className="text-gray-500 hover:text-gray-700">
            ☰ Menu
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
