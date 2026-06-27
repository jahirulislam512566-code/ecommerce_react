// src/context/ShopContext.jsx - Updated token handling
import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { productAPI, cartAPI, authAPI, userAPI } from '../services/apiService';

const STORAGE_KEYS = {
  TOKEN: 'ecom_token',
  CART: 'ecom_cart_items',
  USER: 'ecom_user_data'
};

// ✅ Create context
export const ShopContext = createContext(null);

// ✅ Provider
export const ShopContextProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // ✅ Token state - initialize from localStorage
  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || '';
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // ✅ Update localStorage when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }, [token]);

  // ✅ Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  // ============================================================
  // Authentication
  // ============================================================
  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return false;
    }

    try {
      const response = await authAPI.login({ email, password });

      if (response.data.success) {
        const { token: authToken, user: userData } = response.data;
        
        // ✅ Save token
        setToken(authToken);
        setUser(userData);
        
        toast.success(`Welcome back, ${userData?.name || 'User'}!`);
        
        // ✅ Sync cart after login
        await syncCartWithBackend(authToken);
        
        navigate('/');
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      return false;
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    toast.info('Logged out successfully');
    navigate('/login');
  }, [navigate]);

  // ============================================================
  // Cart Operations with Token Handling
  // ============================================================
  const addToCart = useCallback(async (productId, size, quantity = 1) => {
    if (!productId || !size) {
      toast.error('Please select both a product and size');
      return false;
    }

    try {
      // ✅ Optimistic update
      const newCart = { ...cartItems };
      if (!newCart[productId]) {
        newCart[productId] = {};
      }
      newCart[productId][size] = (newCart[productId][size] || 0) + quantity;
      setCartItems(newCart);

      // ✅ Only sync if authenticated
      if (token) {
        await cartAPI.add({ productId, size, quantity });
      }
      
      toast.success('Added to cart!');
      return true;
    } catch (error) {
      console.error('Add to Cart Error:', error);
      
      // ✅ Handle unauthorized error
      if (error.response?.status === 401) {
        toast.error('Please login to add items to cart');
        navigate('/login');
      } else {
        toast.error('Failed to add item to cart');
      }
      return false;
    }
  }, [cartItems, token, navigate]);

  // ============================================================
  // Fetch Products (Public - No auth required)
  // ============================================================
  const fetchProducts = useCallback(async (forceRefresh = false) => {
    if (products.length > 0 && !forceRefresh) {
      return;
    }

    try {
      setIsLoadingProducts(true);
      setProductError(null);

      // ✅ No token needed for public endpoints
      const response = await productAPI.getAll();
      
      if (response.data.success) {
        setProducts(response.data.products || response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Product Fetch Error:', error);
      
      let errorMessage = 'Unable to load products.';
      if (error.response?.status === 401) {
        // Even if unauthorized, we should still show products
        // This means the products endpoint might need to be public
        errorMessage = 'Products temporarily unavailable';
      }
      
      setProductError(errorMessage);
      if (products.length === 0) {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoadingProducts(false);
    }
  }, [products.length]);

  // ============================================================
  // Context Value
  // ============================================================
  const contextValue = useMemo(() => ({
    token,
    setToken,
    user,
    setUser,
    login,
    logout,
    isAuthenticated: !!token,
    // ... other values
  }), [token, user, login, logout]);

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;