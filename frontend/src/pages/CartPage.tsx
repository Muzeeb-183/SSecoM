// frontend/src/pages/CartPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getImageForContext } from '../utils/imageOptimization';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { 
    items, 
    totalItems, 
    totalPrice, 
    isLoading,
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();
  
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // ✅ Handle product click - navigate to product detail page
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Handle quantity update with optimistic UI
  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setUpdatingItems(prev => new Set(prev).add(productId));
    
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  // Handle item removal
  const handleRemoveItem = async (productId: string, productName: string) => {
    try {
      await removeFromCart(productId);
      toast.success(`🔥 "${productName}" removed from cart`, {
        style: {
          background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
          color: '#ef4444',
          border: '1px solid #ef4444',
        },
      });
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  // Handle clear entire cart
  const handleClearCart = async () => {
    if (window.confirm('🔥 Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart();
        toast.success('🔥 Cart cleared successfully!', {
          style: {
            background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
            color: '#22c55e',
            border: '1px solid #22c55e',
          },
        });
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    }
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    navigate('/');
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  // Calculate savings
  const totalSavings = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-orange-200">Loading your fire cart...</p>
          <p className="text-sm text-orange-400">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-orange-200 mb-2 flex items-center">
                🔥 Your Fire Cart
              </h1>
              <p className="text-orange-400">
                {totalItems === 0 ? 'Your cart is empty' : `${totalItems} item${totalItems > 1 ? 's' : ''} ready to burn deals!`}
              </p>
            </div>
            
            {/* Back to Shopping */}
            <button
              onClick={handleContinueShopping}
              className="flex items-center space-x-2 text-orange-300 hover:text-orange-100 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold text-orange-200 mb-4">Your Cart is Empty</h2>
            <p className="text-orange-400 mb-8 text-lg">
              No fire deals in your cart yet. Let's fix that!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleContinueShopping}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-colors border-2 border-orange-400 transform hover:scale-105"
              >
                🔥 Start Shopping
              </button>
              
              <button
                onClick={() => navigate('/products')}
                className="bg-transparent border-2 border-orange-500 text-orange-300 px-8 py-3 rounded-xl font-semibold hover:bg-orange-500/10 transition-colors"
              >
                Browse Categories
              </button>
            </div>
          </div>
        ) : (
          /* Cart Items */
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left: Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Cart Actions Header */}
              <div className="flex items-center justify-between bg-gradient-to-br from-gray-800 to-black rounded-xl p-4 border border-orange-500/30">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xl font-bold text-orange-200">Cart Items ({totalItems})</h3>
                  {totalSavings > 0 && (
                    <span className="bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      💰 Saving ₹{totalSavings.toLocaleString()}!
                    </span>
                  )}
                </div>
                
                {items.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                  >
                    🗑️ Clear All
                  </button>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 border border-orange-500/30 shadow-xl hover:shadow-orange-500/20 transition-all"
                  >
                    <div className="flex items-start space-x-4">
                      
                      {/* ✅ CLICKABLE Product Image + Details Section */}
                      <div 
                        className="flex items-start space-x-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity group"
                        onClick={() => handleProductClick(item.id)}
                        title="Click to view product details"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 bg-white rounded-xl overflow-hidden p-2 group-hover:shadow-lg group-hover:shadow-orange-500/30 transition-shadow">
                            {item.imageUrl ? (
                              <img
                                src={getImageForContext(item.imageUrl, 'thumbnail')}
                                alt={item.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-2xl text-gray-400">🛍️</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-orange-200 mb-1 line-clamp-2 group-hover:text-orange-100 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-sm text-orange-400 mb-2 group-hover:text-orange-300 transition-colors">
                            Category: {item.categoryName}
                          </p>
                          
                          {/* Pricing */}
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-xl font-bold text-green-400">
                              ₹{item.price.toLocaleString()}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <>
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{item.originalPrice.toLocaleString()}
                                </span>
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                                </span>
                              </>
                            )}
                          </div>

                          {/* Click to view indicator */}
                          <div className="text-xs text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            👆 Click to view product details
                          </div>
                        </div>
                      </div>

                      {/* ✅ NON-CLICKABLE Quantity Controls and Remove Button */}
                      <div className="flex flex-col space-y-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <span className="text-orange-300 text-sm font-medium">Quantity:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering product click
                                handleQuantityUpdate(item.id, item.quantity - 1);
                              }}
                              disabled={updatingItems.has(item.id) || item.quantity <= 1}
                              className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              -
                            </button>
                            
                            <span className="bg-gray-700 text-orange-200 px-3 py-1 rounded-lg font-bold min-w-12 text-center">
                              {updatingItems.has(item.id) ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent mx-auto"></div>
                              ) : (
                                item.quantity
                              )}
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering product click
                                handleQuantityUpdate(item.id, item.quantity + 1);
                              }}
                              disabled={updatingItems.has(item.id)}
                              className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering product click
                            handleRemoveItem(item.id, item.name);
                          }}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors self-end"
                          title="Remove from cart"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Item Subtotal */}
                    <div className="mt-4 pt-4 border-t border-orange-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-400">Subtotal:</span>
                        <span className="text-xl font-bold text-green-400">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-400">You save:</span>
                          <span className="text-green-400 font-bold">
                            ₹{((item.originalPrice - item.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Cart Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                
                {/* Order Summary */}
                <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 border-2 border-orange-500/50 shadow-2xl">
                  <h3 className="text-2xl font-bold text-orange-200 mb-6 flex items-center">
                    🔥 Order Summary
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-400">Items ({totalItems}):</span>
                      <span className="text-orange-200 font-semibold">
                        ₹{totalPrice.toLocaleString()}
                      </span>
                    </div>
                    
                    {totalSavings > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-green-400">Total Savings:</span>
                        <span className="text-green-400 font-bold">
                          -₹{totalSavings.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-orange-400">Shipping:</span>
                      <span className="text-green-400 font-semibold">FREE 🔥</span>
                    </div>
                    
                    <div className="border-t border-orange-500/30 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-orange-200">Total:</span>
                        <span className="text-2xl font-bold text-green-400">
                          ₹{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg border-2 border-orange-400"
                    >
                      🔥 Proceed to Checkout
                    </button>
                    
                    <button
                      onClick={handleContinueShopping}
                      className="w-full bg-transparent border-2 border-orange-500 text-orange-300 py-3 px-6 rounded-xl font-semibold hover:bg-orange-500/10 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>

                {/* Trust Signals */}
                <div className="bg-gradient-to-br from-gray-800 to-black rounded-xl p-4 border border-orange-500/30">
                  <h4 className="font-bold text-orange-200 mb-3 text-center">🔒 Safe & Secure</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center space-x-2 text-orange-400">
                      <span>🛡️</span>
                      <span>Secure Payment Processing</span>
                    </div>
                    <div className="flex items-center space-x-2 text-orange-400">
                      <span>🚚</span>
                      <span>Free Shipping on All Orders</span>
                    </div>
                    <div className="flex items-center space-x-2 text-orange-400">
                      <span>💯</span>
                      <span>Student Verified Products</span>
                    </div>
                    <div className="flex items-center space-x-2 text-orange-400">
                      <span>🔥</span>
                      <span>Best Price Guarantee</span>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                {isAuthenticated && user && (
                  <div className="bg-gradient-to-br from-gray-800 to-black rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={user.picture} 
                        alt={user.name}
                        className="w-10 h-10 rounded-full border-2 border-orange-500"
                      />
                      <div>
                        <p className="text-orange-200 font-semibold">{user.name}</p>
                        <p className="text-orange-400 text-sm">🔥 Fire Shopper</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
