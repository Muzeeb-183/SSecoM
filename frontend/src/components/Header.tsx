// frontend/src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartSidebar from './CartSidebar'; // ✅ Fixed: Correct import path

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart(); // ✅ Use real cart data
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);

  // Handle scroll effect for invisible background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Fixed: Handle cart click - Open sidebar instead of navigating
  const handleCartClick = () => {
    console.log('Cart clicked!');
    setShowCartSidebar(true); // ✅ Open sidebar
    setShowProfileMenu(false); // Close profile menu if open
    // ✅ Removed: navigate('/cart') - Let sidebar handle navigation
  };

  // ✅ NEW: Handle profile page navigation
  const handleProfileClick = () => {
    setShowProfileMenu(false); // Close dropdown
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
          <div className="flex justify-between items-center">
            
            {/* Logo Section - Always Visible */}
            <div className={`flex items-center group transition-all duration-500 ${
              isScrolled ? 'scale-90' : 'scale-100'
            }`}>
              <a href="/" className="flex items-center">
                {/* Fire Logo with Enhanced Animation */}
                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:logo-spin transition-all duration-300 fire-glow border-2 border-orange-400 ${
                    isScrolled ? 'w-10 h-10' : 'w-12 h-12'
                  }`}>
                    <span className={`font-bold text-white transition-all duration-300 text-glow ${
                      isScrolled ? 'text-sm' : 'text-lg'
                    }`}>
                      SSM
                    </span>
                  </div>
                  
                  {/* Floating Fire Particles */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full sparkle opacity-90"></div>
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-orange-500 rounded-full sparkle opacity-80" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute top-0 left-0 w-1 h-1 bg-red-500 rounded-full sparkle opacity-75" style={{animationDelay: '1s'}}></div>
                </div>
                
                {/* Brand Text - Responsive */}
                <div className={`ml-3 group-hover:translate-x-1 transition-all duration-300 ${
                  isScrolled ? 'hidden sm:block' : 'block'
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

            {/* User Section - Always Visible */}
            <div className={`flex items-center space-x-3 transition-all duration-500 ${
              isScrolled ? 'scale-90' : 'scale-100'
            }`}>
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
                        isScrolled ? 'w-6 h-6' : 'w-7 h-7'
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
                    
                    {/* Fire particles around cart on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute -top-1 left-2 w-1 h-1 bg-yellow-500 rounded-full sparkle"></div>
                      <div className="absolute top-1 -right-1 w-1 h-1 bg-orange-500 rounded-full sparkle" style={{animationDelay: '0.3s'}}></div>
                      <div className="absolute -bottom-1 left-1 w-1 h-1 bg-red-500 rounded-full sparkle" style={{animationDelay: '0.6s'}}></div>
                    </div>
                  </button>

                  {/* Compact User Profile */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className={`flex items-center space-x-2 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-orange-500/40 transition-all duration-300 hover:bg-gray-700/90 group border border-orange-500/30 fire-glow ${
                        isScrolled ? 'p-2' : 'p-3'
                      }`}
                    >
                      {/* Profile Picture with Fire Ring - ✅ FIXED WITH CACHE-BUSTING */}
                      <div className="relative">
                        <img 
                          src={`${user.picture}?t=${Date.now()}`} // ✅ CRITICAL FIX: Cache-busting timestamp
                          alt={user.name}
                          className={`rounded-full border-2 border-orange-500 shadow-lg group-hover:scale-110 transition-transform duration-300 fire-float object-cover ${
                            isScrolled ? 'w-8 h-8' : 'w-10 h-10'
                          }`}
                          onError={(e) => {
                            // Fallback to default avatar if image fails to load
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=f97316&color=fff&size=300`;
                          }}
                        />
                        
                        {/* Admin Crown */}
                        {user.role === 'admin' && (
                          <div className={`absolute -top-2 -right-2 text-yellow-500 fire-float ${
                            isScrolled ? 'text-sm' : 'text-base'
                          }`}>
                            👑
                          </div>
                        )}

                        {/* ✅ NEW: Profile Picture Upload Indicator */}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border border-white opacity-80 profile-pulse">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            <span className="text-green-600 text-[8px]">📸</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* User Info - Responsive */}
                      {!isScrolled && (
                        <div className="text-left hidden sm:block">
                          <p className="text-sm font-bold text-orange-200 group-hover:text-orange-100">
                            {user.name?.split(' ')[0]}
                          </p>
                          <p className="text-xs text-orange-400 flex items-center">
                            🔥 Fire Saver
                            {user.role === 'admin' && (
                              <span className="ml-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold fire-glow">
                                ADMIN
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      
                      {/* Fire Arrow */}
                      <div className={`text-orange-400 transition-transform duration-200 sparkle ${showProfileMenu ? 'rotate-180' : ''}`}>
                        🔥
                      </div>
                    </button>

                    {/* Enhanced Fire Dropdown Menu */}
                    {showProfileMenu && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-orange-500/30 border-2 border-orange-500/50 slide-down overflow-hidden">
                        
                        {/* Animated Fire Border */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 fire-glow"></div>
                        
                        {/* User Details - ✅ FIXED WITH CACHE-BUSTING */}
                        <div className="p-6 border-b border-orange-500/30 relative z-10">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img 
                                src={`${user.picture}?t=${Date.now()}`} // ✅ CRITICAL FIX: Cache-busting timestamp
                                alt={user.name}
                                className="w-16 h-16 rounded-full border-3 border-orange-500 shadow-lg fire-float object-cover"
                                onError={(e) => {
                                  // Fallback avatar
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=f97316&color=fff&size=300`;
                                }}
                              />
                              <div className="absolute inset-0 rounded-full fire-glow"></div>
                              
                              {/* ✅ NEW: Profile Picture Edit Indicator */}
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" 
                                   title="Click to update profile picture">
                                <div className="w-full h-full rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">📷</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-orange-200 text-glow">{user.name}</h3>
                              <p className="text-sm text-orange-400">{user.email}</p>
                              {user.role === 'admin' && (
                                <div className="flex items-center mt-2">
                                  <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold fire-glow">
                                    🔥 FIRE ADMIN 👑
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Fire Stats */}
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-gradient-to-br from-green-800/50 to-green-600/50 rounded-xl border border-green-500/50 fire-glow">
                              <div className="text-xl font-bold text-green-200">₹2,450</div>
                              <div className="text-xs text-green-300">🔥 Money Saved</div>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-br from-orange-800/50 to-red-600/50 rounded-xl border border-orange-500/50 fire-glow">
                              <div className="text-xl font-bold text-orange-200">{totalItems}</div>
                              <div className="text-xs text-orange-300">🛒 Cart Items</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="p-4 space-y-2 relative z-10">
                          {/* ✅ NEW: Profile Management Action */}
                          <button
                            onClick={handleProfileClick}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-indigo-800/50 hover:bg-indigo-700/50 transition-all group border border-indigo-500/30 fire-glow"
                          >
                            <span className="text-indigo-400 group-hover:scale-125 transition-transform profile-pulse">👤</span>
                            <div className="flex-1 text-left">
                              <span className="font-bold text-indigo-200 group-hover:text-indigo-100">🔥 Fire Profile</span>
                              <div className="text-xs text-indigo-300">
                                Update picture & settings
                              </div>
                            </div>
                            <div className="text-indigo-400 group-hover:text-indigo-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>

                          {/* ✅ Cart Action in Dropdown - Updated with real count */}
                          <button
                            onClick={handleCartClick}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-blue-800/50 hover:bg-blue-700/50 transition-all group border border-blue-500/30 fire-glow"
                          >
                            <span className="text-blue-400 group-hover:scale-125 transition-transform cart-bounce">🛒</span>
                            <div className="flex-1 text-left">
                              <span className="font-bold text-blue-200 group-hover:text-blue-100">🔥 Fire Cart</span>
                              <div className="text-xs text-blue-300">
                                {totalItems === 0 ? 'Cart is empty' : `${totalItems} item${totalItems > 1 ? 's' : ''} ready`}
                              </div>
                            </div>
                            {totalItems > 0 && (
                              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {totalItems}
                              </div>
                            )}
                          </button>

                          {user.role === 'admin' && (
                            <a
                              href="/admin"
                              className="flex items-center space-x-3 p-3 rounded-xl bg-purple-800/50 hover:bg-purple-700/50 transition-all group border border-purple-500/30 fire-glow"
                            >
                              <span className="text-purple-400 group-hover:scale-125 transition-transform fire-float">⚙️</span>
                              <span className="font-bold text-purple-200 group-hover:text-purple-100">🔥 ADMIN PANEL</span>
                            </a>
                          )}
                          
                          <a
                            href="/wishlist"
                            className="flex items-center space-x-3 p-3 rounded-xl bg-pink-800/50 hover:bg-pink-700/50 transition-all group border border-purple-500/30 fire-glow"
                          >
                            <span className="text-pink-400 group-hover:scale-125 transition-transform sparkle">❤️</span>
                            <span className="font-bold text-pink-200 group-hover:text-pink-100">🔥 Hot Wishlist</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compact Logout Button */}
                  <button
                    onClick={logout}
                    className={`bg-gradient-to-r from-red-600 via-orange-500 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:via-orange-600 hover:to-red-800 transition-all transform hover:scale-110 shadow-lg hover:shadow-red-500/50 fire-glow border-2 border-orange-500/80 relative overflow-hidden group ${
                      isScrolled ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
                    }`}
                  >
                    {/* Fire background animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 fire-glow"></div>
                    
                    {/* Button content */}
                    <div className="relative z-10 flex items-center space-x-2">
                      <span className="sparkle">🔥</span>
                      <span className="group-hover:scale-110 transition-transform">LOGOUT</span>
                      <span className="sparkle">💥</span>
                    </div>
                    
                    {/* Fire particles on hover */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute top-1 left-2 w-1 h-1 bg-yellow-500 rounded-full sparkle"></div>
                      <div className="absolute top-2 right-3 w-1 h-1 bg-orange-500 rounded-full sparkle" style={{animationDelay: '0.2s'}}></div>
                      <div className="absolute bottom-1 left-4 w-1 h-1 bg-red-500 rounded-full sparkle" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </button>
                </>
              ) : (
                /* Fire Login Button */
                <a
                  href="/login"
                  className={`bg-gradient-to-r from-orange-600 via-red-500 to-orange-700 text-white rounded-xl font-bold hover:from-orange-700 hover:via-red-600 hover:to-orange-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/50 flex items-center space-x-2 fire-glow border-2 border-orange-400 ${
                    isScrolled ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'
                  }`}
                >
                  <span className="sparkle">🔥</span>
                  <span>JOIN FIRE</span>
                  <span className="fire-float">💥</span>
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Click outside to close dropdown */}
        {showProfileMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowProfileMenu(false)}
          ></div>
        )}
      </header>

      {/* Header Spacer to prevent content overlap */}
      <div className={`transition-all duration-500 ${
        isScrolled ? 'h-16' : 'h-20'
      }`}></div>
      
      {/* ✅ Cart Sidebar - Fixed positioning */}
      <CartSidebar 
        isOpen={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      />
    </>
  );
};

export default Header;
