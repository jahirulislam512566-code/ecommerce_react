// src/services/apiService.js
import axios from 'axios';
import { toast } from 'react-toastify';

// ✅ API Base URL with /api at the end
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

console.log('🔧 API Base URL:', API_BASE_URL);

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ============================================================
// Interceptors
// ============================================================

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecom_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized request - redirecting to login');
      
      localStorage.removeItem('ecom_token');
      localStorage.removeItem('ecom_user_data');
      localStorage.removeItem('ecom_cart_items');
      
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
      
      toast.error('Session expired. Please login again.');
    }
    
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    }
    
    if (error.response?.status === 404) {
      console.warn('404 Not Found:', error.config?.url);
    }
    
    if (error.response?.status === 409) {
      toast.error(error.response?.data?.message || 'Conflict occurred.');
    }
    
    if (error.response?.status === 422) {
      const message = error.response?.data?.message || 'Validation error. Please check your input.';
      toast.error(message);
    }
    
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// ============================================================
// AUTH API - ✅ WITHOUT /api prefix (since it's in base URL)
// ============================================================

export const authAPI = {
  // ✅ POST /user/register (full URL: http://localhost:4000/api/user/register)
  register: async (data) => {
    try {
      console.log('📤 Registering user at:', `${API_BASE_URL}/user/register`);
      const response = await api.post('/user/register', data);
      return response.data;
    } catch (error) {
      console.error('❌ Register API error:', error);
      throw error;
    }
  },
  
  // ✅ POST /user/login
  login: async (data) => {
    try {
      console.log('📤 Logging in at:', `${API_BASE_URL}/user/login`);
      const response = await api.post('/user/login', data);
      return response.data;
    } catch (error) {
      console.error('❌ Login API error:', error);
      throw error;
    }
  },
  
  // ✅ POST /user/admin
  adminLogin: async (data) => {
    try {
      const response = await api.post('/user/admin', data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin login API error:', error);
      throw error;
    }
  },
  
  // ✅ GET /user/profile
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('❌ Get profile API error:', error);
      throw error;
    }
  },
  
  // ✅ PUT /user/profile
  updateProfile: async (data) => {
    try {
      const response = await api.put('/user/profile', data);
      return response.data;
    } catch (error) {
      console.error('❌ Update profile API error:', error);
      throw error;
    }
  },
  
  // ✅ PUT /user/password
  changePassword: async (data) => {
    try {
      const response = await api.put('/user/password', data);
      return response.data;
    } catch (error) {
      console.error('❌ Change password API error:', error);
      throw error;
    }
  },
  
  // ✅ POST /user/forgot-password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/user/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      throw error;
    }
  },
  
  // ✅ POST /user/reset-password
  resetPassword: async (data) => {
    try {
      const response = await api.post('/user/reset-password', data);
      return response.data;
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  },
  
  // ✅ Logout
  logout: async () => {
    try {
      localStorage.removeItem('ecom_token');
      localStorage.removeItem('ecom_user_data');
      localStorage.removeItem('ecom_cart_items');
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  },
};

// ============================================================
// PRODUCT API - ✅ WITHOUT /api prefix
// ============================================================

export const productAPI = {
  // ✅ GET /product
  getAll: async (params) => {
    try {
      console.log('📤 Fetching products from:', `${API_BASE_URL}/product`);
      const response = await api.get('/product', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Get products API error:', error);
      throw error;
    }
  },
  
  // ✅ GET /product/:id
  getById: async (id) => {
    try {
      const response = await api.get(`/product/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Get product ${id} API error:`, error);
      throw error;
    }
  },
  
  // ✅ GET /product/category/:category
  getByCategory: async (category) => {
    try {
      const response = await api.get(`/product/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Get products by category ${category} API error:`, error);
      throw error;
    }
  },
  
  // ✅ GET /product/search
  search: async (query) => {
    try {
      const response = await api.get('/product/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error(`❌ Search products "${query}" API error:`, error);
      throw error;
    }
  },
};

// ============================================================
// CART API - ✅ WITHOUT /api prefix
// ============================================================

export const cartAPI = {
  // ✅ GET /cart
  get: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('❌ Get cart API error:', error);
      throw error;
    }
  },
  
  // ✅ POST /cart/add
  add: async (data) => {
    try {
      const response = await api.post('/cart/add', data);
      return response.data;
    } catch (error) {
      console.error('❌ Add to cart API error:', error);
      throw error;
    }
  },
  
  // ✅ PUT /cart/update
  update: async (data) => {
    try {
      const response = await api.put('/cart/update', data);
      return response.data;
    } catch (error) {
      console.error('❌ Update cart API error:', error);
      throw error;
    }
  },
  
  // ✅ DELETE /cart/remove/:productId
  remove: async (productId, size) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`, { data: { size } });
      return response.data;
    } catch (error) {
      console.error(`❌ Remove from cart ${productId} API error:`, error);
      throw error;
    }
  },
  
  // ✅ DELETE /cart/clear
  clear: async () => {
    try {
      const response = await api.delete('/cart/clear');
      return response.data;
    } catch (error) {
      console.error('❌ Clear cart API error:', error);
      throw error;
    }
  },
  
  // ✅ POST /cart/sync
  sync: async (data) => {
    try {
      const response = await api.post('/cart/sync', data);
      return response.data;
    } catch (error) {
      console.error('❌ Sync cart API error:', error);
      throw error;
    }
  },
};

// ============================================================
// ORDER API - ✅ WITHOUT /api prefix
// ============================================================

export const orderAPI = {
  // ✅ POST /order/place
  create: async (data) => {
    try {
      const response = await api.post('/order/place', data);
      return response.data;
    } catch (error) {
      console.error('❌ Create order API error:', error);
      throw error;
    }
  },
  
  // ✅ GET /orders
  getAll: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      console.error('❌ Get orders API error:', error);
      throw error;
    }
  },
  
  // ✅ GET /order/:id
  getById: async (id) => {
    try {
      const response = await api.get(`/order/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Get order ${id} API error:`, error);
      throw error;
    }
  },
  
  // ✅ GET /orders/user/:userId
  getByUser: async (userId) => {
    try {
      const response = await api.get(`/orders/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Get orders for user ${userId} API error:`, error);
      throw error;
    }
  },
  
  // ✅ PUT /order/:id/status
  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/order/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`❌ Update order ${id} status API error:`, error);
      throw error;
    }
  },
  
  // ✅ PUT /order/:id/cancel
  cancel: async (id) => {
    try {
      const response = await api.put(`/order/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`❌ Cancel order ${id} API error:`, error);
      throw error;
    }
  },
};

// ============================================================
// ADMIN API - ✅ WITHOUT /api prefix
// ============================================================

export const adminAPI = {
  // ✅ GET /admin/users
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('❌ Get all users API error:', error);
      throw error;
    }
  },
  
  // ✅ PUT /admin/users/:id/role
  updateUserRole: async (id, role) => {
    try {
      const response = await api.put(`/admin/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      console.error(`❌ Update user ${id} role API error:`, error);
      throw error;
    }
  },
  
  // ✅ POST /admin/products
  createProduct: async (data) => {
    try {
      const response = await api.post('/admin/products', data);
      return response.data;
    } catch (error) {
      console.error('❌ Create product API error:', error);
      throw error;
    }
  },
  
  // ✅ PUT /admin/products/:id
  updateProduct: async (id, data) => {
    try {
      const response = await api.put(`/admin/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Update product ${id} API error:`, error);
      throw error;
    }
  },
  
  // ✅ DELETE /admin/products/:id
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Delete product ${id} API error:`, error);
      throw error;
    }
  },
  
  // ✅ GET /admin/orders
  getAllOrders: async (params) => {
    try {
      const response = await api.get('/admin/orders', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Get all orders (admin) API error:', error);
      throw error;
    }
  },
};

// ============================================================
// FILE UPLOAD - ✅ WITHOUT /api prefix
// ============================================================

export const uploadAPI = {
  // ✅ POST /upload
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ File upload error:', error);
      throw error;
    }
  },
  
  // ✅ POST /upload/multiple
  uploadMultipleFiles: async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Multiple files upload error:', error);
      throw error;
    }
  },
};

export default api;