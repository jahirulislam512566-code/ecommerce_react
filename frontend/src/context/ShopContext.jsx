import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { productAPI, cartAPI, authAPI } from "../services/apiService";

const STORAGE_KEYS = {
  TOKEN: "ecom_token",
  CART: "ecom_cart_items",
  USER: "ecom_user_data",
};

export const ShopContext = createContext(null);

export const useShop = () => {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error(
      "useShop must be used within ShopContextProvider"
    );
  }

  return context;
};

export const ShopContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // ============================
  // STATE
  // ============================

  const [token, setToken] = useState(
    () => localStorage.getItem(STORAGE_KEYS.TOKEN) || ""
  );

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);

  // ============================
  // LOCAL STORAGE SYNC
  // ============================

  useEffect(() => {
    token
      ? localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      : localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }, [token]);

  useEffect(() => {
    user
      ? localStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(user)
        )
      : localStorage.removeItem(STORAGE_KEYS.USER);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.CART,
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  // ============================
  // PRODUCTS
  // ============================

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      setProductError(null);

      const response = await productAPI.getAll();
      
      console.log('📦 Products API Response:', response);
      
      let productsData = [];
      let success = false;
      
      // Handle different response structures
      if (response) {
        // Check if response has data property
        if (response.data) {
          if (response.data.products) {
            productsData = response.data.products;
            success = response.data.success !== false;
          } else if (Array.isArray(response.data)) {
            productsData = response.data;
            success = true;
          } else {
            productsData = response.data.products || [];
            success = response.data.success || false;
          }
        } else if (response.products) {
          // Direct response with products
          productsData = response.products;
          success = response.success !== false;
        } else if (Array.isArray(response)) {
          // Direct array response
          productsData = response;
          success = true;
        }
      }
      
      if (success || productsData.length > 0) {
        setProducts(productsData);
        console.log(`✅ Loaded ${productsData.length} products`);
      } else {
        console.warn('⚠️ Failed to load products or empty response:', response);
        setProducts([]);
        if (!success) {
          setProductError('Failed to load products');
          toast.error('Failed to load products');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProductError(error.message || 'Failed to load products');
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // ============================
  // AUTH
  // ============================

  const syncCartWithBackend = useCallback(async (authToken) => {
    try {
      if (!authToken) return;
      // Optional API sync
      // await cartAPI.sync(cartItems);
    } catch (error) {
      console.error('Sync cart error:', error);
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      try {
        const response = await authAPI.login({
          email,
          password,
        });

        if (response.success) {
          setToken(response.token);
          setUser(response.user);

          await syncCartWithBackend(response.token);

          toast.success("Login successful");
          navigate("/");

          return true;
        }

        toast.error(response.message || "Login failed");
        return false;
      } catch (error) {
        console.error('Login error:', error);
        toast.error(
          error.response?.data?.message ||
            "Login failed"
        );
        return false;
      }
    },
    [navigate, syncCartWithBackend]
  );

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
    setCartItems({});

    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CART);

    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('cartCleared'));

    toast.success("Logged out");
    navigate("/login");
  }, [navigate]);

  // ============================
  // CART
  // ============================

  const addToCart = useCallback(
    async (productId, size, quantity = 1) => {
      try {
        setCartItems((prev) => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            [size]:
              (prev[productId]?.[size] || 0) + quantity,
          },
        }));

        // Dispatch event to update UI
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        if (token) {
          await cartAPI.add({
            productId,
            size,
            quantity,
          });
        }

        toast.success(`Added ${quantity} item(s) to cart`);
        return true;
      } catch (error) {
        console.error('Add to cart error:', error);
        toast.error("Failed to add item");
        return false;
      }
    },
    [token]
  );

  const updateQuantity = useCallback(
    async (productId, size, quantity) => {
      try {
        setCartItems((prev) => {
          const updated = { ...prev };

          if (!updated[productId]) {
            updated[productId] = {};
          }

          if (quantity <= 0) {
            delete updated[productId][size];

            if (
              Object.keys(updated[productId]).length === 0
            ) {
              delete updated[productId];
            }
          } else {
            updated[productId][size] = quantity;
          }

          // Dispatch event to update UI
          window.dispatchEvent(new CustomEvent('cartUpdated'));

          return updated;
        });

        if (token) {
          await cartAPI.update({
            productId,
            size,
            quantity,
          });
        }
      } catch (error) {
        console.error('Update quantity error:', error);
        toast.error("Failed to update cart");
      }
    },
    [token]
  );

  const clearCart = useCallback(() => {
    setCartItems({});
    localStorage.removeItem(STORAGE_KEYS.CART);
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('cartCleared'));
    console.log('🧹 Cart cleared');
  }, []);

  const getCartTotalItems = useCallback(() => {
    let total = 0;

    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        total += cartItems[productId][size] || 0;
      }
    }

    return total;
  }, [cartItems]);

  const getCartAmount = useCallback(() => {
    let total = 0;

    for (const productId in cartItems) {
      const product = products.find(
        (item) => item._id === productId
      );

      if (!product) continue;

      for (const size in cartItems[productId]) {
        total +=
          (product.price || 0) *
          (cartItems[productId][size] || 0);
      }
    }

    return total;
  }, [cartItems, products]);

  // ✅ Alias for getCartSubtotal (for backward compatibility)
  const getCartSubtotal = useCallback(() => {
    return getCartAmount();
  }, [getCartAmount]);

  // ✅ Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ============================
  // CONTEXT VALUE
  // ============================

  const contextValue = useMemo(
    () => ({
      // Auth
      token,
      setToken,
      user,
      setUser,
      login,
      logout,
      isAuthenticated: !!token,

      // Products
      products,
      fetchProducts,
      isLoadingProducts,
      productError,

      // Cart
      cartItems,
      setCartItems,
      addToCart,
      updateQuantity,
      clearCart,
      getCartTotalItems,
      getCartAmount,
      getCartSubtotal,

      // Utilities
      navigate,

      // Constants
      currency: "$",
      delivery_fee: 10,
      backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
    }),
    [
      token,
      setToken,
      user,
      setUser,
      login,
      logout,
      products,
      fetchProducts,
      isLoadingProducts,
      productError,
      cartItems,
      setCartItems,
      addToCart,
      updateQuantity,
      clearCart,
      getCartTotalItems,
      getCartAmount,
      getCartSubtotal,
      navigate,
    ]
  );

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;