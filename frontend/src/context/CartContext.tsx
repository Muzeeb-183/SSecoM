import React, { createContext } from 'react';

const CartContext = createContext(null);

export const CartProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <CartContext.Provider value={null}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
