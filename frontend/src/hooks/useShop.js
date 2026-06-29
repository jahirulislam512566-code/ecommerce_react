// src/hooks/useShop.js
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopContextProvider');
  }
  return context;
};