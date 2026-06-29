// admin/src/context/ShopContext.jsx
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const ShopContext = createContext(null);

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within ShopContextProvider');
  }
  return context;
};

export const ShopContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken || savedToken === "undefined" || savedToken === "null") {
      return '';
    }
    return savedToken;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    setCartItems({});
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('cartItems');
  }, []);

  const value = useMemo(() => ({
    token,
    setToken,
    user,
    setUser,
    cartItems,
    setCartItems,
    products,
    setProducts,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    logout,
    // Admin specific functions
    getToken: () => token,
    getUser: () => user,
  }), [token, user, cartItems, products, logout]);

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;