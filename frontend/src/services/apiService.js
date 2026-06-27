// src/services/apiService.js
import axios from 'axios';

// ✅ Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-five-sigma-91.vercel.app/api';

// ✅ Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor - Automatically add token to ALL requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('ecom_token');
    
    // ✅ If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ Log request for debugging (remove in production)
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - Handle auth errors globally
api.interceptors.response.use(
  (response) => {
    // ✅ Log response for debugging
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // ✅ Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized request - redirecting to login');
      
      // Clear invalid token
      localStorage.removeItem('ecom_token');
      localStorage.removeItem('ecom_user_data');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
      
      // Show toast notification if available
      if (window.toast) {
        window.toast.error('Session expired. Please login again.');
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================================
// Public endpoints (don't require authentication)
// ============================================================

// Product API (public)
export const productAPI = {
  getAll: () => api.get('/product'),
  getById: (id) => api.get(`/product/${id}`),
};

// ============================================================
// Protected endpoints (require authentication)
// ============================================================

// Cart API (protected)
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (data) => api.put('/cart/update', data),
  clear: () => api.delete('/cart/clear'),
  sync: (data) => api.post('/cart/sync', data),
};

// Order API (protected)
export const orderAPI = {
  create: (data) => api.post('/order/place', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/order/${id}`),
  updateStatus: (id, status) => api.put(`/order/${id}/status`, { status }),
};

// User API (protected)
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/password', data),
};

// Auth API (public)
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export default api;