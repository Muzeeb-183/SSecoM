// frontend/src/components/CartSidebar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getImageForContext } from '../utils/imageOptimization';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    items, 
    totalItems, 
    totalPrice, 
    isLoading,
    updateQuantity, 
    removeFromCart 
  } = useCart();
  
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // ✅ Handle product click - navigate to product detail page
  const handleProductClick = (productId: string) => {
    onClose(); // Close the sidebar first
    navigate(`/product/${productId}`); // Then navigate to product page
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle quantity update
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
        duration: 2000,
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

  // Handle view full cart
  const handleViewFullCart = () => {
    onClose();
    navigate('/cart');
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed with checkout');
      onClose();
      navigate('/login');
      return;
    }
    onClose();
    navigate('/checkout');
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-gradient-to-br from-gray-900 via-black to-red-900 
        shadow-2xl shadow-orange-500/20 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        border-l-2 border-orange-500/50
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-500/30 bg-gradient-to-r from-gray-800/90 to-black/90">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-orange-200 flex items-center">
              🔥 Fire Cart
            </h2>
            <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {totalItems}
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors text-orange-300 hover:text-orange-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
                  <p className="text-orange-300">Loading cart...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty Cart State */
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-bold text-orange-200 mb-2">Cart is Empty</h3>
                <p className="text-orange-400 mb-6">Add some fire deals to get started!</p>
                <button
                  onClick={handleContinueShopping}
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-colors border border-orange-400"
                >
                  🔥 Start Shopping
                </button>
              </div>
            ) : (
              /* Cart Items List */
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-br from-gray-800/50 to-black/50 rounded-xl p-4 border border-orange-500/20 hover:border-orange-500/40 transition-all"
                  >
                    <div className="flex space-x-3">
                      
                      {/* ✅ CLICKABLE Product Image + Details Section */}
                      <div 
                        className="flex space-x-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity group"
                        onClick={() => handleProductClick(item.id)}
                        title="Click to view product details"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-white rounded-lg overflow-hidden p-1 group-hover:shadow-lg group-hover:shadow-orange-500/30 transition-shadow">
                            {item.imageUrl ? (
                              <img
                                src={getImageForContext(item.imageUrl, 'thumbnail')}
                                alt={item.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                                <span className="text-lg text-gray-400">🛍️</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-orange-200 line-clamp-2 mb-1 group-hover:text-orange-100 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-xs text-orange-400 mb-2 group-hover:text-orange-300 transition-colors">
                            {item.categoryName}
                          </p>
                          
                          {/* Price */}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg font-bold text-green-400">
                              ₹{item.price.toLocaleString()}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{item.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Click indicator */}
                          <div className="text-xs text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            👆 View details
                          </div>
                        </div>
                      </div>

                      {/* ✅ NON-CLICKABLE Quantity Controls - Keep these separate and not clickable */}
                      <div className="flex flex-col justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering product click
                              handleQuantityUpdate(item.id, item.quantity - 1);
                            }}
                            disabled={updatingItems.has(item.id) || item.quantity <= 1}
                            className="bg-gray-700 hover:bg-gray-600 text-white w-6 h-6 rounded flex items-center justify-center disabled:opacity-50 text-sm"
                          >
                            -
                          </button>
                          
                          <span className="text-orange-200 font-bold text-sm min-w-8 text-center">
                            {updatingItems.has(item.id) ? (
                              <div className="animate-spin rounded-full h-3 w-3 border border-orange-500 border-t-transparent mx-auto"></div>
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
                            className="bg-gray-700 hover:bg-gray-600 text-white w-6 h-6 rounded flex items-center justify-center disabled:opacity-50 text-sm"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering product click
                            handleRemoveItem(item.id, item.name);
                          }}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors mt-2"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="mt-2 pt-2 border-t border-orange-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-orange-400">Subtotal:</span>
                        <span className="text-sm font-bold text-green-400">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Only show when cart has items */}
          {items.length > 0 && (
            <div className="border-t border-orange-500/30 bg-gradient-to-r from-gray-800/90 to-black/90 p-6">
              
              {/* Total */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-bold text-orange-200">Total:</span>
                  <span className="font-bold text-green-400">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-orange-400 mt-1">
                  Free shipping • {totalItems} item{totalItems > 1 ? 's' : ''}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg border border-orange-400"
                >
                  🔥 Checkout Now
                </button>
                
                <button
                  onClick={handleViewFullCart}
                  className="w-full bg-transparent border border-orange-500 text-orange-300 py-2 px-4 rounded-xl font-semibold hover:bg-orange-500/10 transition-colors text-sm"
                >
                  View Full Cart
                </button>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-green-900/30 rounded-lg border border-green-500/30">
                  <div className="text-sm font-bold text-green-300">
                    {totalItems}
                  </div>
                  <div className="text-xs text-green-400">Items</div>
                </div>
                <div className="text-center p-2 bg-orange-900/30 rounded-lg border border-orange-500/30">
                  <div className="text-sm font-bold text-orange-300">FREE</div>
                  <div className="text-xs text-orange-400">Shipping</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
