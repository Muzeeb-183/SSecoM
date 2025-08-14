// frontend/src/context/CartContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryName: string;
  quantity: number;
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

interface CartContextType extends CartState {
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCartFromServer: () => Promise<void>;
}

// Cart Actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

// Cart Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_CART':
      const items = action.payload;
      return {
        ...state,
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        isLoading: false
      };

    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // New item, add to cart
        updatedItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };

    case 'UPDATE_QUANTITY':
      const quantityUpdatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0); // Remove items with 0 quantity

      return {
        ...state,
        items: quantityUpdatedItems,
        totalItems: quantityUpdatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: quantityUpdatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };

    default:
      return state;
  }
};

// Initial State
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false
};

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate(); // ✅ Added for navigation

  // Sync cart from server when user logs in
  useEffect(() => {
    if (isAuthenticated && user && token) {
      syncCartFromServer();
    }
  }, [isAuthenticated, user, token]);

  // Sync cart from server
  const syncCartFromServer = async () => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const cartItems: CartItem[] = data.cartItems.map((item: any) => ({
          id: item.productId,
          name: item.productName,
          price: item.price,
          originalPrice: item.originalPrice,
          imageUrl: item.imageUrl,
          categoryName: item.categoryName,
          quantity: item.quantity,
          addedAt: new Date(item.addedAt)
        }));
        
        dispatch({ type: 'SET_CART', payload: cartItems });
      }
    } catch (error) {
      console.error('Error syncing cart from server:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ✅ ENHANCED: Add item to cart with authentication check
  const addToCart = async (product: any) => {
    // ✅ FORCE LOGIN: When unauthenticated user clicks "Add to Cart"
    if (!isAuthenticated) {
      toast.error(
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔒</span>
          <div>
            <div className="font-bold">Login Required</div>
            <div className="text-sm">Please login to add items to cart</div>
          </div>
        </div>,
        {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
            color: '#ef4444',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            fontWeight: 'bold',
          },
        }
      );
      // Redirect to login page
      navigate('/login');
      return;
    }

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.images?.[0] || product.imageUrl || '',
      categoryName: product.categoryName,
      quantity: 1,
      addedAt: new Date()
    };

    // Update local state immediately for better UX
    dispatch({ type: 'ADD_ITEM', payload: cartItem });

    // Sync with server (only for authenticated users now)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        // Revert local change if server request failed
        dispatch({ type: 'REMOVE_ITEM', payload: product.id });
        toast.error(data.error || 'Failed to add item to cart');
      }
    } catch (error) {
      // Revert local change if request failed
      dispatch({ type: 'REMOVE_ITEM', payload: product.id });
      toast.error('Failed to add item to cart');
    }
  };

  // ✅ ENHANCED: Remove item from cart with authentication check
  const removeFromCart = async (productId: string) => {
    // ✅ FORCE LOGIN: When unauthenticated user tries to modify cart
    if (!isAuthenticated) {
      toast.error('Please login to modify cart');
      navigate('/login');
      return;
    }

    // Update local state immediately
    dispatch({ type: 'REMOVE_ITEM', payload: productId });

    // Sync with server
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to remove item from cart');
        // Optionally revert the local change
      }
    } catch (error) {
      toast.error('Failed to remove item from cart');
    }
  };

  // ✅ ENHANCED: Update quantity with authentication check
  const updateQuantity = async (productId: string, quantity: number) => {
    // ✅ FORCE LOGIN: When unauthenticated user tries to modify cart
    if (!isAuthenticated) {
      toast.error('Please login to modify cart');
      navigate('/login');
      return;
    }

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    // Update local state immediately
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });

    // Sync with server
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to update cart');
      }
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  // ✅ ENHANCED: Clear cart with authentication check
  const clearCart = async () => {
    // ✅ FORCE LOGIN: When unauthenticated user tries to clear cart
    if (!isAuthenticated) {
      toast.error('Please login to access cart');
      navigate('/login');
      return;
    }

    dispatch({ type: 'CLEAR_CART' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to clear cart');
      }
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCartFromServer
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
