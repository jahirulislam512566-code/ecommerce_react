import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Custom hook for wishlist operations
const useWishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRemoving, setIsRemoving] = useState({});
  const [isMovingToCart, setIsMovingToCart] = useState({});

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user token from secure storage
      const token = localStorage.getItem('authToken');
      if (!token) {
        // If no token, still show empty state without error
        setItems([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - clear token
          localStorage.removeItem('authToken');
          setItems([]);
          return;
        }
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();
      setItems(data.data || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromWishlist = useCallback(async (itemId) => {
    try {
      setIsRemoving(prev => ({ ...prev, [itemId]: true }));
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Please login to manage your wishlist');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from wishlist');
      }

      setItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed from wishlist');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsRemoving(prev => ({ ...prev, [itemId]: false }));
    }
  }, []);

  const moveToCart = useCallback(async (item) => {
    try {
      setIsMovingToCart(prev => ({ ...prev, [item.id]: true }));
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Please login to add items to cart');
        return;
      }
      
      // Add to cart
      const cartResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: 1,
          variant: item.variant || null,
        }),
      });

      if (!cartResponse.ok) {
        throw new Error('Failed to add item to cart');
      }

      // Remove from wishlist
      await removeFromWishlist(item.id);
      toast.success('Item moved to cart successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsMovingToCart(prev => ({ ...prev, [item.id]: false }));
    }
  }, [removeFromWishlist]);

  const clearWishlist = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Please login to manage your wishlist');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/wishlist/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear wishlist');
      }

      setItems([]);
      toast.success('Wishlist cleared');
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  return {
    items,
    loading,
    error,
    isRemoving,
    isMovingToCart,
    fetchWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
  };
};

// Wishlist Item Component
const WishlistItem = React.memo(({ 
  item, 
  onRemove, 
  onMoveToCart, 
  isRemoving, 
  isMovingToCart 
}) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative w-full overflow-hidden bg-gray-200" style={{ paddingBottom: '100%' }}>
        <img
          src={imageError ? '/placeholder-image.jpg' : (item.image || '/placeholder-image.jpg')}
          alt={item.name}
          className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={() => setImageError(true)}
        />
        
        {/* Wishlist badge */}
        {item.isNew && (
          <span className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-md">
            New
          </span>
        )}
        
        {item.discount && (
          <span className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-md">
            {item.discount}% OFF
          </span>
        )}

        {/* Remove button */}
        <button
          onClick={() => onRemove(item.id)}
          disabled={isRemoving}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remove from wishlist"
        >
          {isRemoving ? (
            <svg className="h-5 w-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
          <a href={`/product/${item.slug || item.id}`} className="block">
            {item.name}
          </a>
        </h3>
        
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-gray-900">
              ${item.discountedPrice || item.price}
            </p>
            {item.discountedPrice && (
              <p className="text-sm text-gray-400 line-through">
                ${item.price}
              </p>
            )}
          </div>
          {item.stock <= 0 && (
            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
          )}
        </div>
        
        {item.rating && (
          <div className="mt-1 flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(item.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-500">
              ({item.reviewCount || 0})
            </span>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onMoveToCart(item)}
            disabled={isMovingToCart || item.stock <= 0}
            className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            {isMovingToCart ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Moving...
              </span>
            ) : (
              item.stock <= 0 ? 'Out of Stock' : 'Move to Cart'
            )}
          </button>
          <button
            onClick={() => onRemove(item.id)}
            disabled={isRemoving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
});

WishlistItem.displayName = 'WishlistItem';

// Main Wishlist Component
const Wishlist = () => {
  const navigate = useNavigate();
  const {
    items,
    loading,
    error,
    isRemoving,
    isMovingToCart,
    fetchWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
  } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Memoized sorted items
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      // Show in-stock items first
      if (a.stock > 0 && b.stock <= 0) return -1;
      if (a.stock <= 0 && b.stock > 0) return 1;
      // Then sort by date added (newest first)
      return new Date(b.addedAt) - new Date(a.addedAt);
    });
  }, [items]);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Handle navigation
  const handleContinueShopping = useCallback(() => {
    navigate('/collection');
  }, [navigate]);

  // Handle view cart
  const handleViewCart = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Something went wrong</h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            <button
              onClick={handleContinueShopping}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Your Wishlist is Empty</h2>
          <p className="mt-2 text-gray-600">Start adding items you love!</p>
          <button
            onClick={handleContinueShopping}
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Wishlist</h1>
          <p className="mt-1 text-sm text-gray-500">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleViewCart}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            View Cart
          </button>
          {items.length > 1 && (
            <button
              onClick={clearWishlist}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedItems.map((item) => (
          <WishlistItem
            key={item.id}
            item={item}
            onRemove={removeFromWishlist}
            onMoveToCart={moveToCart}
            isRemoving={isRemoving[item.id]}
            isMovingToCart={isMovingToCart[item.id]}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;