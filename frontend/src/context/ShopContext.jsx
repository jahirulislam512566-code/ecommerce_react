import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

// ============================================================
// Constants & Configuration
// ============================================================
const STORAGE_KEYS = {
  TOKEN: 'ecom_token',
  CART: 'ecom_cart_items',
  USER: 'ecom_user_data'
};

const DEFAULT_CONFIG = {
  CURRENCY: '৳',
  DELIVERY_FEE: 60,
};

// ============================================================
// Context Creation
// ============================================================
const ShopContext = createContext(null);

// ============================================================
// Custom Hook
// ============================================================
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopContextProvider');
  }
  return context;
};

// ============================================================
// Provider Component
// ============================================================
export const ShopContextProvider = ({ children }) => {
  // --- Hooks ---
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // --- State Management ---
  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || '';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    return savedCart ? JSON.parse(savedCart) : {};
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  // ============================================================
  // Cart Persistence
  // ============================================================
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  // ============================================================
  // Product Data Fetching
  // ============================================================
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      setProductError(null);

      const response = await axios.get(`${backendUrl}/api/product/list`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (response.data.success) {
        setProducts(response.data.products || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unable to load products';
      setProductError(errorMessage);
      toast.error(errorMessage);
      console.error('Product Fetch Error:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ============================================================
  // Cart Operations
  // ============================================================
  const addToCart = useCallback(async (productId, size, quantity = 1) => {
    if (!productId || !size) {
      toast.error('Please select both a product and size');
      return false;
    }

    try {
      const newCart = { ...cartItems };
      
      if (!newCart[productId]) {
        newCart[productId] = {};
      }
      
      newCart[productId][size] = (newCart[productId][size] || 0) + quantity;
      
      setCartItems(newCart);
      toast.success(`${quantity > 1 ? quantity : ''} item${quantity > 1 ? 's' : ''} added to cart!`);
      
      if (token) {
        await axios.post(
          `${backendUrl}/api/cart/add`,
          { productId, size, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      return true;
    } catch (error) {
      toast.error('Failed to add item to cart');
      console.error('Add to Cart Error:', error);
      return false;
    }
  }, [cartItems, token, backendUrl]);

  const updateCartQuantity = useCallback(async (productId, size, quantity) => {
    if (!productId || !size || quantity < 0) {
      toast.error('Invalid update request');
      return false;
    }

    try {
      const newCart = { ...cartItems };

      if (quantity === 0) {
        if (newCart[productId]?.[size]) {
          delete newCart[productId][size];
          if (Object.keys(newCart[productId]).length === 0) {
            delete newCart[productId];
          }
        }
      } else {
        if (!newCart[productId]) {
          newCart[productId] = {};
        }
        newCart[productId][size] = quantity;
      }

      setCartItems(newCart);

      if (token) {
        await axios.put(
          `${backendUrl}/api/cart/update`,
          { productId, size, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      return true;
    } catch (error) {
      toast.error('Failed to update cart');
      console.error('Cart Update Error:', error);
      return false;
    }
  }, [cartItems, token, backendUrl]);

  const removeFromCart = useCallback(async (productId, size) => {
    return updateCartQuantity(productId, size, 0);
  }, [updateCartQuantity]);

  const clearCart = useCallback(async () => {
    try {
      setCartItems({});
      
      if (token) {
        await axios.delete(
          `${backendUrl}/api/cart/clear`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      toast.info('Cart cleared');
      return true;
    } catch (error) {
      toast.error('Failed to clear cart');
      console.error('Clear Cart Error:', error);
      return false;
    }
  }, [token, backendUrl]);

  // ============================================================
  // Cart Calculations
  // ============================================================
  const getCartTotalItems = useCallback(() => {
    let total = 0;
    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        total += cartItems[productId][size] || 0;
      }
    }
    return total;
  }, [cartItems]);

  const getCartSubtotal = useCallback(() => {
    let subtotal = 0;
    for (const productId in cartItems) {
      const product = products.find(p => p._id === productId);
      if (!product) continue;
      
      for (const size in cartItems[productId]) {
        const quantity = cartItems[productId][size];
        if (quantity > 0) {
          subtotal += (product.price || 0) * quantity;
        }
      }
    }
    return subtotal;
  }, [cartItems, products]);

  const getCartTotal = useCallback(() => {
    const subtotal = getCartSubtotal();
    const total = subtotal + (subtotal > 0 ? DEFAULT_CONFIG.DELIVERY_FEE : 0);
    return total;
  }, [getCartSubtotal]);

  const getItemCount = useCallback((productId, size) => {
    return cartItems[productId]?.[size] || 0;
  }, [cartItems]);

  // ============================================================
  // Authentication Operations
  // ============================================================
  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        toast.success('Welcome back!');
        
        await syncCartWithBackend(response.data.token);
        
        navigate('/');
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      console.error('Login Error:', error);
      return false;
    }
  }, [backendUrl, navigate]);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    setCartItems({});
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CART);
    toast.info('Logged out successfully');
    navigate('/login');
  }, [navigate]);

  // ============================================================
  // Cart Backend Sync
  // ============================================================
  const syncCartWithBackend = useCallback(async (authToken = token) => {
    if (!authToken || Object.keys(cartItems).length === 0) return;

    try {
      await axios.post(
        `${backendUrl}/api/cart/sync`,
        { cartItems },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    } catch (error) {
      console.error('Cart Sync Error:', error);
    }
  }, [cartItems, token, backendUrl]);

  // ============================================================
  // Context Values (Memoized) - ✅ FIXED: Properly include setToken
  // ============================================================
  const contextValue = useMemo(() => ({
    // Auth - ✅ setToken is properly included
    token,
    setToken, // ✅ This is the key fix - make sure setToken is here
    user,
    setUser,
    login,
    logout,
    isAuthenticated: !!token,

    // Products
    products,
    isLoadingProducts,
    productError,
    fetchProducts,
    refreshProducts: fetchProducts,

    // Cart
    cartItems,
    setCartItems, // ✅ Also expose setCartItems if needed
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotalItems,
    getCartSubtotal,
    getCartTotal,
    getItemCount,
    syncCartWithBackend,

    // UI
    searchQuery,
    setSearchQuery,
    showSearchBar,
    setShowSearchBar,

    // Config
    currency: DEFAULT_CONFIG.CURRENCY,
    deliveryFee: DEFAULT_CONFIG.DELIVERY_FEE,
    backendUrl,

    // Navigation
    navigate,
  }), [
    token,
    setToken, // ✅ Added to dependencies
    user,
    setUser,
    login,
    logout,
    products,
    isLoadingProducts,
    productError,
    fetchProducts,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotalItems,
    getCartSubtotal,
    getCartTotal,
    getItemCount,
    syncCartWithBackend,
    searchQuery,
    showSearchBar,
    backendUrl,
    navigate,
  ]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

// Default export at the END
export default ShopContextProvider;