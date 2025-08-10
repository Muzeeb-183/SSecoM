import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartProvider';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="bg-navbar-bg shadow-student border-b border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-logo-purple to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">SS</span>
            </div>
            <h1 className="ml-3 text-2xl font-bold text-heading">SSecoM</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-nav-text hover:text-nav-hover">Home</a>
            <a href="/products" className="text-nav-text hover:text-nav-hover">Products</a>
            <a href="/cart" className="text-nav-text hover:text-nav-hover relative">
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-logo-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.picture} 
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-heading">{user?.name}</span>
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
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
