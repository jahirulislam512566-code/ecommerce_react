// components/ProductCard.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { toast } from 'react-toastify';

export const ProductCard = ({ 
  product, 
  currency, 
  className = '',
  showQuickAdd = true,
  showWishlist = false,
}) => {
  const { addToCart, addToWishlist, isAuthenticated } = useShop();
  const [selectedSize, setSelectedSize] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning('Please login to add items to cart');
      return;
    }

    if (!product.sizes || product.sizes.length === 0) {
      toast.error('No sizes available for this product');
      return;
    }

    if (product.sizes.length === 1) {
      const size = product.sizes[0];
      setIsAdding(true);
      try {
        await addToCart(product._id, size, 1);
        toast.success('Added to cart! 🛒');
      } catch (error) {
        toast.error('Failed to add to cart');
      } finally {
        setIsAdding(false);
      }
      return;
    }

    if (!selectedSize) {
      setShowSizeSelector(true);
      toast.info('Please select a size');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product._id, selectedSize, 1);
      toast.success('Added to cart! 🛒');
      setSelectedSize('');
      setShowSizeSelector(false);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  }, [product, selectedSize, addToCart, isAuthenticated]);

  const handleSizeSelect = useCallback((size, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);
    setShowSizeSelector(false);
  }, []);

  const handleWishlistToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.warning('Please login to add items to wishlist');
      return;
    }
    
    setIsWishlisted(prev => !prev);
    addToWishlist({ 
      id: product._id, 
      name: product.name, 
      price: product.price, 
      image: Array.isArray(product.image) ? product.image[0] : product.image 
    });
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  }, [isAuthenticated, addToWishlist, product, isWishlisted]);

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className={`group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      <Link to={`/product/${product._id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={Array.isArray(product.image) ? product.image[0] : (product.image || '/placeholder-image.png')}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/placeholder-image.png';
            }}
          />
        </div>

        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}

        {showWishlist && (
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110 z-10"
          >
            <svg 
              className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}`}
              fill={isWishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm px-4 py-2 border-2 border-white rounded">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-3 sm:p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          {product.category || 'Uncategorized'}
        </p>

        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm sm:text-base font-medium text-gray-800 hover:text-black transition-colors mt-1 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-lg font-bold text-gray-900">
            {currency}{product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {currency}{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.sizes.slice(0, 4).map((size) => (
              <span 
                key={size}
                className={`text-xs px-2 py-0.5 border rounded ${
                  selectedSize === size 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                {size}
              </span>
            ))}
          </div>
        )}

        {showQuickAdd && !isOutOfStock && (
          <div className="mt-3">
            {product.sizes && product.sizes.length > 1 && showSizeSelector ? (
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="text-xs text-gray-500 w-full">Select Size:</span>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleSizeSelect(size, e)}
                    className="text-xs px-3 py-1 border border-gray-300 rounded hover:border-black hover:bg-gray-50 transition-colors"
                  >
                    {size}
                  </button>
                ))}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSizeSelector(false);
                    setSelectedSize('');
                  }}
                  className="text-xs px-2 py-1 text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`
                  w-full py-2 px-3 text-xs font-medium rounded-lg transition-all duration-300
                  ${isAdding 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-600 text-white hover:bg-gray-700 active:scale-95'
                  }
                  flex items-center justify-center gap-2
                `}
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {!isAuthenticated && !isOutOfStock && (
          <div className="mt-2">
            <Link 
              to="/login" 
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              🔒 Login to add to cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;