// frontend/src/components/Header.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartSidebar from './CartSidebar'; // ✅ Fixed: Correct import path

// Search suggestion interface
interface SearchSuggestion {
  suggestion: string;
  type: 'product' | 'category';
}

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart(); // ✅ Use real cart data
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);

  // 🔥 NEW: Search functionality state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect for invisible background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔥 NEW: Search functions
  const fetchSearchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchSuggestions(data.suggestions);
        setShowSuggestions(data.suggestions.length > 0);
      }
    } catch (error) {
      console.error('❌ Search suggestions error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.suggestion);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(suggestion.suggestion)}`);
  }, [navigate]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounced suggestions
    const timeoutId = setTimeout(() => {
      fetchSearchSuggestions(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [fetchSearchSuggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current && !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Fixed: Handle cart click - Open sidebar instead of navigating
  const handleCartClick = () => {
    console.log('Cart clicked!');
    setShowCartSidebar(true); // ✅ Open sidebar
    setShowProfileMenu(false); // Close profile menu if open
    setShowSuggestions(false); // Close search suggestions if open
    // ✅ Removed: navigate('/cart') - Let sidebar handle navigation
  };

  // ✅ NEW: Handle profile page navigation
  const handleProfileClick = () => {
    setShowProfileMenu(false); // Close dropdown
    setShowSuggestions(false); // Close search suggestions if open
    navigate('/profile'); // Navigate to profile page
  };

  return (
    <>
      {/* Custom CSS for animations - Fixed for React */}
      <style>{`
        @keyframes fireGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 146, 60, 0.6), 0 0 40px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 30px rgba(251, 146, 60, 0.8), 0 0 60px rgba(239, 68, 68, 0.6); }
        }
        @keyframes fireFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(120deg); }
          66% { transform: translateY(8px) rotate(240deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes logoSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(251, 146, 60, 0.5); }
          50% { text-shadow: 0 0 20px rgba(251, 146, 60, 0.8), 0 0 30px rgba(239, 68, 68, 0.5); }
        }
        @keyframes cartBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.1); }
        }
        @keyframes profilePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .fire-glow { animation: fireGlow 2s ease-in-out infinite; }
        .fire-float { animation: fireFloat 3s ease-in-out infinite; }
        .sparkle { animation: sparkle 1.5s ease-in-out infinite; }
        .slide-down { animation: slideDown 0.3s ease-out; }
        .logo-spin { animation: logoSpin 0.6s ease-in-out; }
        .text-glow { animation: textGlow 3s ease-in-out infinite; }
        .cart-bounce { animation: cartBounce 2s ease-in-out infinite; }
        .profile-pulse { animation: profilePulse 2s ease-in-out infinite; }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
      `}</style>

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out mb-6 ${
        isScrolled 
          ? 'bg-transparent backdrop-blur-none shadow-none py-2' 
          : 'bg-gradient-to-r from-gray-900/95 via-black/95 to-red-900/95 backdrop-blur-md shadow-2xl shadow-orange-500/20 py-3'
      }`}>
        
        {/* Fire Border - Only visible when not scrolled */}
        {!isScrolled && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 opacity-80"></div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* 🔥 LEFT: Logo Section - Fixed positioning */}
            <div className={`flex items-center group transition-all duration-500 ${
              isScrolled ? 'scale-90' : 'scale-100'
            } flex-shrink-0`}>
              <a href="/" className="flex items-center">
                {/* Fire Logo with Enhanced Animation */}
                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:logo-spin transition-all duration-300 fire-glow border-2 border-orange-400 ${
                    isScrolled ? 'w-10 h-10' : 'w-12 h-12'
                  }`}>
                    <span className={`font-bold text-white transition-all duration-300 text-glow ${
                      isScrolled ? 'text-sm' : 'text-lg'
                    }`}>
                      🔥
                    </span>
                  </div>
                  
                  {/* Floating Fire Particles */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full sparkle opacity-90"></div>
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-orange-500 rounded-full sparkle opacity-80" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute top-0 left-0 w-1 h-1 bg-red-500 rounded-full sparkle opacity-75" style={{animationDelay: '1s'}}></div>
                </div>
                
                {/* Brand Text - Compact */}
                <div className={`ml-3 group-hover:translate-x-1 transition-all duration-300 ${
                  isScrolled ? 'hidden md:block' : 'block'
                }`}>
                 <h1 className={`font-bold bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent text-glow transition-all duration-300 ${
                    isScrolled ? 'text-lg' : 'text-xl'
                  }`}>
                    Student Store ecoM
                  </h1>
                  {!isScrolled && (
                    <p className="text-xs text-orange-400 opacity-90 fire-float">
                      🔥 Deals So Hot They Burn
                    </p>
                  )}
                </div>
              </a>
            </div>

            {/* 🔥 CENTER: Fire Search Bar - Perfect positioning */}
            <div className="flex-1 max-w-xl mx-6 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                {/* Search Container - Fixed design */}
                <div className={`relative bg-gray-800/90 backdrop-blur-sm rounded-xl border-2 border-orange-500/50 hover:border-orange-400/70 focus-within:border-orange-400 transition-all duration-300 shadow-lg hover:shadow-orange-500/30 ${
                  isScrolled ? 'py-2' : 'py-3'
                }`}>
                  
                  {/* Search Icon */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 z-10">
                    <svg className={`transition-all duration-300 ${isScrolled ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Search Input - Fixed padding */}
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => {
                      if (searchSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="🔥 Search fire deals..."
                    className={`w-full bg-transparent text-orange-100 placeholder-orange-400/70 font-medium outline-none transition-all duration-300 ${
                      isScrolled ? 'pl-11 pr-20 py-1 text-sm' : 'pl-12 pr-24 py-2 text-base'
                    }`}
                  />

                  {/* Loading Spinner */}
                  {isSearching && (
                    <div className="absolute right-20 top-1/2 transform -translate-y-1/2 z-10">
                      <div className={`animate-spin rounded-full border-2 border-orange-200 border-t-orange-500 ${
                        isScrolled ? 'h-4 w-4' : 'h-4 w-4'
                      }`}></div>
                    </div>
                  )}

                  {/* 🔥 FIXED: Search Button - Perfect positioning */}
                  <button
                    type="submit"
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-bold hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-orange-500/50 z-10 flex items-center justify-center ${
                      isScrolled ? 'px-3 py-1.5 text-xs min-w-[60px]' : 'px-4 py-2 text-sm min-w-[80px]'
                    }`}
                  >
                    <span className="flex items-center space-x-1">
                      <span>🔥</span>
                      <span className={isScrolled ? 'hidden lg:inline' : 'hidden sm:inline'}>SEARCH</span>
                    </span>
                  </button>
                </div>

                {/* Fire-themed Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-orange-500/30 border-2 border-orange-500/50 overflow-hidden z-50 animate-slideDown"
                  >
                    {/* Fire Border Animation */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 animate-pulse"></div>
                    
                    <div className="relative z-10 py-2">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-6 py-3 text-left hover:bg-orange-500/20 transition-all duration-200 flex items-center space-x-3 group"
                        >
                          {/* Suggestion Icon */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-200 group-hover:scale-110 ${
                            suggestion.type === 'product' 
                              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' 
                              : 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                          }`}>
                            {suggestion.type === 'product' ? '📦' : '📂'}
                          </div>
                          
                          {/* Suggestion Text */}
                          <div className="flex-1">
                            <div className="text-orange-100 font-medium group-hover:text-orange-50 transition-colors">
                              {suggestion.suggestion}
                            </div>
                            <div className={`text-xs font-medium transition-colors ${
                              suggestion.type === 'product' 
                                ? 'text-blue-400 group-hover:text-blue-300' 
                                : 'text-purple-400 group-hover:text-purple-300'
                            }`}>
                              {suggestion.type === 'product' ? '🔥 Product' : '📁 Category'}
                            </div>
                          </div>

                          {/* Fire Arrow */}
                          <div className="text-orange-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* 🔥 RIGHT: User Actions - Fixed positioning */}
            <div className={`flex items-center space-x-3 transition-all duration-500 ${
              isScrolled ? 'scale-90' : 'scale-100'
            } flex-shrink-0`}>
              {isAuthenticated && user ? (
                <>
                  {/* ✅ CART ICON - Updated with real cart data */}
                  <button
                    onClick={handleCartClick}
                    className={`relative bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-orange-500/40 transition-all duration-300 hover:bg-gray-700/90 group border border-orange-500/30 fire-glow cart-bounce ${
                      isScrolled ? 'p-2' : 'p-3'
                    }`}
                  >
                    {/* Cart Icon */}
                    <svg 
                      className={`text-orange-400 group-hover:text-orange-300 transition-colors duration-300 ${
                        isScrolled ? 'w-5 h-5' : 'w-6 h-6'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" 
                      />
                    </svg>
                    
                    {/* Cart Badge - Shows real cart count */}
                    {totalItems > 0 && (
                      <div className={`absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full font-bold text-xs border-2 border-yellow-500 fire-glow sparkle ${
                        isScrolled ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs'
                      } flex items-center justify-center`}>
                        {totalItems > 99 ? '99+' : totalItems}
                      </div>
                    )}
                  </button>

                  {/* Compact User Profile */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowProfileMenu(!showProfileMenu);
                        setShowSuggestions(false); // Close search suggestions
                      }}
                      className={`flex items-center space-x-2 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-orange-500/40 transition-all duration-300 hover:bg-gray-700/90 group border border-orange-500/30 fire-glow ${
                        isScrolled ? 'p-2' : 'p-3'
                      }`}
                    >
                      {/* Profile Picture with Fire Ring */}
                      <div className="relative">
                        <img 
                          src={`${user.picture}?t=${Date.now()}`}
                          alt={user.name}
                          className={`rounded-full border-2 border-orange-500 shadow-lg group-hover:scale-110 transition-transform duration-300 fire-float object-cover ${
                            isScrolled ? 'w-7 h-7' : 'w-9 h-9'
                          }`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=f97316&color=fff&size=300`;
                          }}
                        />
                        
                        {/* Admin Crown */}
                        {user.role === 'admin' && (
                          <div className={`absolute -top-1 -right-1 text-yellow-500 fire-float ${
                            isScrolled ? 'text-xs' : 'text-sm'
                          }`}>
                            👑
                          </div>
                        )}
                      </div>
                      
                      {/* User Info - Responsive */}
                      {!isScrolled && (
                        <div className="text-left hidden lg:block">
                          <p className="text-sm font-bold text-orange-200 group-hover:text-orange-100">
                            {user.name?.split(' ')[0]}
                          </p>
                          <p className="text-xs text-orange-400 flex items-center">
                            🔥 Fire Saver
                          </p>
                        </div>
                      )}
                      
                      {/* Fire Arrow */}
                      <div className={`text-orange-400 transition-transform duration-200 sparkle ${showProfileMenu ? 'rotate-180' : ''}`}>
                        🔥
                      </div>
                    </button>

                    {/* Profile Dropdown - Simplified for space */}
                    {showProfileMenu && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-orange-500/30 border-2 border-orange-500/50 slide-down overflow-hidden">
                        {/* User Details */}
                        <div className="p-4 border-b border-orange-500/30">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={`${user.picture}?t=${Date.now()}`}
                              alt={user.name}
                              className="w-12 h-12 rounded-full border-2 border-orange-500 object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-bold text-orange-200">{user.name}</h3>
                              <p className="text-sm text-orange-400">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="p-3 space-y-2">
                          <button
                            onClick={handleProfileClick}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-indigo-800/50 hover:bg-indigo-700/50 transition-all"
                          >
                            <span>👤</span>
                            <span className="font-bold text-indigo-200">Profile</span>
                          </button>

                          <button
                            onClick={handleCartClick}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-blue-800/50 hover:bg-blue-700/50 transition-all"
                          >
                            <span>🛒</span>
                            <span className="font-bold text-blue-200">Cart ({totalItems})</span>
                          </button>

                          {user.role === 'admin' && (
                            <a
                              href="/admin"
                              className="flex items-center space-x-3 p-3 rounded-xl bg-purple-800/50 hover:bg-purple-700/50 transition-all"
                            >
                              <span>⚙️</span>
                              <span className="font-bold text-purple-200">Admin Panel</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compact Logout Button */}
                  <button
                    onClick={logout}
                    className={`bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-red-500/50 fire-glow border border-orange-500/80 ${
                      isScrolled ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
                    }`}
                  >
                    <span className="flex items-center space-x-1">
                      <span>🔥</span>
                      <span className={isScrolled ? 'hidden xl:inline' : 'hidden lg:inline'}>LOGOUT</span>
                    </span>
                  </button>
                </>
              ) : (
                /* Fire Login Button */
                <a
                  href="/login"
                  className={`bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/50 flex items-center space-x-2 fire-glow border border-orange-400 ${
                    isScrolled ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'
                  }`}
                >
                  <span className="sparkle">🔥</span>
                  <span>JOIN FIRE</span>
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Click outside to close dropdowns */}
        {(showProfileMenu || showSuggestions) && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setShowProfileMenu(false);
              setShowSuggestions(false);
            }}
          ></div>
        )}
      </header>

      {/* Header Spacer */}
      <div className={`transition-all duration-500 ${
        isScrolled ? 'h-16' : 'h-20'
      }`}></div>
      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      />
    </>
  );
};

export default Header;
