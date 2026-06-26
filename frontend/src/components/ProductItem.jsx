import React, { useCallback, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { toast } from 'react-toastify';

// ============================================================
// Constants
// ============================================================
const PLACEHOLDER_SERVICE = {
  PICSUM: (seed, width = 600, height = 600) => 
    `https://picsum.photos/seed/${seed}/${width}/${height}`,
  PLACEHOLD: (width = 600, height = 600, text = 'Product') =>
    `https://placehold.co/${width}x${height}/000000/FFFFFF?text=${text}`,
};

// ============================================================
// ProductItem Component
// ============================================================
export const ProductItem = ({ 
  id, 
  image, 
  name, 
  price, 
  discount = 0,
  category = '',
  sizes = [],
  rating = null,
  reviewCount = 0,
  isNew = false,
  isBestSeller = false,
  stock = 10,
  className = '',
  lazyLoad = true,
  onProductClick,
  variant = 'default', // 'default', 'compact', 'featured'
  showQuickAdd = true,
  showWishlist = false,
  showSizeSelector = true,
  currency: propCurrency,
}) => {
  // --- Hooks ---
  const { currency: contextCurrency, addToCart, addToWishlist, isAuthenticated } = useShop();
  const currency = propCurrency || contextCurrency;
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // --- Computed Values ---
  const fallbackImage = useMemo(() => 
    PLACEHOLDER_SERVICE.PICSUM(id || 'product'), 
    [id]
  );

  const displayImage = useMemo(() => {
    if (imageError) return fallbackImage;
    
    const getImage = (img) => {
      if (!img) return fallbackImage;
      if (Array.isArray(img)) {
        const first = img[0];
        if (first?.includes('via.placeholder.com') || 
            first?.includes('placeholder.com') || 
            first?.includes('placehold.it')) {
          return fallbackImage;
        }
        return first;
      }
      if (typeof img === 'string') {
        if (img.includes('via.placeholder.com') || 
            img.includes('placeholder.com') || 
            img.includes('placehold.it')) {
          return fallbackImage;
        }
        return img;
      }
      return fallbackImage;
    };
    return getImage(image);
  }, [image, imageError, fallbackImage]);

  const formattedPrice = useMemo(() => 
    price?.toLocaleString() || '0', 
    [price]
  );

  const discountedPrice = useMemo(() => {
    if (discount > 0) {
      return (price * (1 - discount / 100)).toLocaleString();
    }
    return null;
  }, [price, discount]);

  const discountPercentage = discount > 0 ? discount : null;
  const isOutOfStock = stock <= 0;

  // --- Handlers ---
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleProductClick = useCallback((e) => {
    scrollToTop();
    if (onProductClick) {
      onProductClick(id);
    }
  }, [id, onProductClick, scrollToTop]);

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setTimeout(() => setImageError(false), 3000);
  }, []);

  const handleSizeSelect = useCallback((size, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(prev => prev === size ? '' : size);
  }, []);

  const handleWishlistToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.warning('Please login to add items to wishlist');
      return;
    }
    
    setIsWishlisted(prev => !prev);
    addToWishlist({ id, name, price, image: displayImage });
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  }, [isAuthenticated, addToWishlist, id, name, price, displayImage, isWishlisted]);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('This product is out of stock');
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      toast.warning('Please select a size');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(id, selectedSize || 'M', 1);
      toast.success(`${name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  }, [id, selectedSize, name, addToCart, isOutOfStock, sizes.length]);

  // ============================================================
  // Render Helpers
  // ============================================================
  const renderBadges = () => (
    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
      {isNew && (
        <div className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg">
          NEW
        </div>
      )}
      {isBestSeller && (
        <div className="bg-yellow-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg">
          BESTSELLER
        </div>
      )}
      {discountPercentage > 0 && (
        <div className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg">
          -{discountPercentage}%
        </div>
      )}
    </div>
  );

  const renderQuickAddButton = () => {
    if (!showQuickAdd) return null;

    return (
      <button
        onClick={handleAddToCart}
        disabled={isAdding || isOutOfStock}
        className={`
          absolute bottom-0 left-0 right-0 
          text-white font-medium py-3.5 px-4
          flex items-center justify-center gap-2
          transition-all duration-300 ease-in-out
          ${isOutOfStock 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-black/90 hover:bg-black hover:scale-[1.02] active:scale-[0.98]'
          }
          opacity-0 group-hover:opacity-100 
          translate-y-full group-hover:translate-y-0
          shadow-lg hover:shadow-xl
          z-10
        `}
        aria-label={`Quick Add ${name} to cart`}
      >
        {isAdding ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Adding...
          </>
        ) : isOutOfStock ? (
          'Out of Stock'
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Add to Cart
          </>
        )}
      </button>
    );
  };

  const renderWishlistButton = () => {
    if (!showWishlist) return null;

    return (
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110 z-10"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg 
          className={`w-5 h-5 transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}`}
          fill={isWishlisted ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    );
  };

  const renderSizes = () => {
    if (!showSizeSelector || sizes.length === 0) return null;

    return (
      <div className='flex gap-1 mt-1 flex-wrap'>
        {sizes.slice(0, 4).map((size) => (
          <button
            key={size}
            onClick={(e) => handleSizeSelect(size, e)}
            className={`
              text-[10px] font-medium px-2 py-0.5 rounded-md
              transition-all duration-200
              ${selectedSize === size 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {size}
          </button>
        ))}
        {sizes.length > 4 && (
          <span className='text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md'>
            +{sizes.length - 4}
          </span>
        )}
      </div>
    );
  };

  const renderRating = () => {
    if (!rating) return null;

    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        {reviewCount > 0 && (
          <span className="text-xs text-gray-400">({reviewCount})</span>
        )}
      </div>
    );
  };

  const renderStockStatus = () => {
    if (stock === undefined) return null;

    return (
      <div className="mt-1">
        {stock <= 0 ? (
          <span className="text-xs text-red-500 font-medium">Out of Stock</span>
        ) : stock <= 5 ? (
          <span className="text-xs text-orange-500 font-medium">Only {stock} left!</span>
        ) : null}
      </div>
    );
  };

  // ============================================================
  // Main Render
  // ============================================================
  return (
    <div className={`group relative ${className}`}>
      <Link 
        onClick={handleProductClick}
        className='text-gray-700 cursor-pointer block'
        to={`/product/${id}`}
        aria-label={`View ${name}`}
      >
        {/* ===== Image Container ===== */}
        <div className='relative overflow-hidden bg-gray-100 rounded-lg aspect-[3/4]'>
          {/* Placeholder / Skeleton */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
          )}

          {/* Product Image */}
          <img
            className={`
              w-full h-full object-cover transition-all duration-700 ease-in-out 
              group-hover:scale-110
              ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            src={displayImage}
            alt={name || 'Product image'}
            loading={lazyLoad ? 'lazy' : 'eager'}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Badges */}
          {renderBadges()}

          {/* Wishlist Button */}
          {renderWishlistButton()}

          {/* Quick Add to Cart Button */}
          {renderQuickAddButton()}

          {/* Overlay */}
          <div className="
            absolute inset-0 bg-black/20 
            opacity-0 group-hover:opacity-100 
            transition-opacity duration-300
            pointer-events-none
          " />
        </div>

        {/* ===== Product Details ===== */}
        <div className='pt-3 space-y-1.5'>
          {/* Category Tag */}
          {category && (
            <p className='text-xs text-gray-400 uppercase tracking-wider font-medium'>
              {category}
            </p>
          )}

          {/* Product Name */}
          <p className='text-sm font-semibold text-gray-800 group-hover:text-black transition-colors duration-300 line-clamp-2'>
            {name || 'Unnamed Product'}
          </p>

          {/* Rating */}
          {renderRating()}

          {/* Price Section */}
          <div className='flex items-center gap-2 flex-wrap'>
            {discountedPrice ? (
              <>
                <p className='text-lg font-bold text-gray-900'>
                  {currency}{discountedPrice}
                </p>
                <p className='text-sm text-gray-400 line-through'>
                  {currency}{formattedPrice}
                </p>
              </>
            ) : (
              <p className='text-lg font-bold text-gray-900'>
                {currency}{formattedPrice}
              </p>
            )}

            {/* Savings Tag */}
            {discountPercentage > 0 && (
              <span className='text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium'>
                Save {currency}{(price * discount / 100).toFixed(0)}
              </span>
            )}
          </div>

          {/* Sizes */}
          {renderSizes()}

          {/* Stock Status */}
          {renderStockStatus()}
        </div>
      </Link>

      {/* ===== CSS Animations ===== */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

// ============================================================
// ProductItemSkeleton Component
// ============================================================
export const ProductItemSkeleton = ({ variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className="flex gap-4 items-center animate-pulse">
        <div className="w-24 h-24 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="animate-pulse bg-white rounded-2xl overflow-hidden shadow-xl">
        <div className="aspect-[16/9] bg-gray-200" />
        <div className="p-6 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse bg-white rounded-xl overflow-hidden border border-gray-100">
      <div className="aspect-[3/4] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
};

// ============================================================
// ProductGrid Component
// ============================================================
export const ProductGrid = ({ 
  products = [], 
  columns = 4, 
  variant = 'default',
  className = '',
  onProductClick,
  showQuickAdd = true,
  showWishlist = true,
  showSizeSelector = true,
  loading = false,
  skeletonCount = 8,
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns] || gridCols[4]} gap-4 md:gap-6 ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductItemSkeleton key={`skeleton-${index}`} variant={variant} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🛍️</div>
        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
        <p className="text-gray-500 mt-1">Check back later for new arrivals</p>
      </div>
    );
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact': return 'gap-3';
      case 'featured': return 'gap-6';
      default: return 'gap-4 md:gap-6';
    }
  };

  return (
    <div className={`grid ${gridCols[columns] || gridCols[4]} ${getVariantClasses()} ${className}`}>
      {products.map((product, index) => (
        <ProductItem
          key={product._id || product.id || index}
          id={product._id || product.id}
          image={product.image}
          name={product.name}
          price={product.price}
          discount={product.discount}
          category={product.category}
          sizes={product.sizes}
          rating={product.rating}
          reviewCount={product.reviewCount}
          isNew={product.isNew}
          isBestSeller={product.isBestSeller}
          stock={product.stock}
          variant={variant}
          onProductClick={onProductClick}
          showQuickAdd={showQuickAdd}
          showWishlist={showWishlist}
          showSizeSelector={showSizeSelector}
        />
      ))}
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default ProductItem;