// src/services/productService.js
import axios from 'axios';

// ✅ FIXED: Use the correct API URL structure
// Your backend is on Vercel at: https://ecommerce-react-gold-one.vercel.app
// The routes show: /api/product, /api/cart, /api/order, etc.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const createProduct = async (productData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(`${API_BASE_URL}/product/add`, productData, config);
  return response.data;
};

export const getProducts = async () => {
  // ✅ FIXED: Use /product not /api/product (since API_BASE_URL already includes /api)
  const response = await axios.get(`${API_BASE_URL}/product`);
  return response.data;
};

export const getProduct = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/product/${id}`);
  return response.data;
};

export const updateProduct = async (id, productData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_BASE_URL}/product/${id}`, productData, config);
  return response.data;
};

export const deleteProduct = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${API_BASE_URL}/product/${id}`, config);
  return response.data;
};

// ✅ Add debug function to test API connection
export const testAPI = async () => {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    const response = await axios.get(`${API_BASE_URL}/product`);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Test Failed:', error.response?.data || error.message);
    return null;
  }
};