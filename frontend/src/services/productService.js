// src/services/productService.js
import axios from 'axios';

// Base URL configuration (Optional but highly recommended)
const API_URL = 'http://localhost:4000/api/product'; 

export const createProduct = async (productData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, // Attaches your admin login token
    },
  };

  // We use the full or relative URL here
  const response = await axios.post(`${API_URL}/add`, productData, config);
  return response.data;
};