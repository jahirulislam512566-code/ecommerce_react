// components/MobileAddToCartFAB.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export const MobileAddToCartFAB = () => {
  const { cartItems, getCartTotalItems, getCartAmount, currency } = useShop();
  const location = useLocation();
  const [isHidden, setIsHidden] = useState(false);

  const totalItems = useMemo(() => {
    if (typeof getCartTotalItems === 'function') {
      return getCartTotalItems() || 0;
    }
    let count = 0;
    if (cartItems) {
      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          count += cartItems[productId][size] || 0;
        }
      }
    }
    return count;
  }, [cartItems, getCartTotalItems]);

  const subtotal = useMemo(() => {
    if (typeof getCartAmount === 'function') {
      return getCartAmount() || 0;
    }
    return 0;
  }, [cartItems, getCartAmount]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollPosition >= documentHeight - 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show on cart, checkout, or auth pages
  const hiddenPaths = ['/cart', '/place-order', '/login', '/register'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  if (totalItems === 0) {
    return null;
  }

  return (
    <div 
      className={`
        lg:hidden fixed bottom-24 right-4 z-40 
        transition-all duration-300 ease-in-out
        ${isHidden ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}
      `}
    >
      <Link
        to="/cart"
        className="flex items-center gap-3 bg-black text-white px-4 py-3 rounded-full shadow-xl hover:bg-gray-800 transition-all active:scale-95 hover:scale-105"
        aria-label="View cart"
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-lg animate-bounceIn">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </div>

        <div className="flex flex-col items-start">
          <span className="text-xs opacity-70">View Cart</span>
          <span className="text-sm font-bold">
            {currency}{subtotal.toFixed(2)}
          </span>
        </div>
      </Link>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MobileAddToCartFAB;