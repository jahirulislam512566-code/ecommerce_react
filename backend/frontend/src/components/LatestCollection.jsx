// components/LatestCollection.jsx
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Title } from './Title';
import  ProductItem  from './ProductItem';
import ProductItemSkeleton  from './ProductItemSkeleton';

// ============================================================
// Constants
// ============================================================
const DEFAULT_DISPLAY_COUNT = 10;
const GRID_COLUMNS = {
  mobile: 'grid-cols-2',
  tablet: 'sm:grid-cols-3',
  desktop: 'md:grid-cols-4',
  large: 'lg:grid-cols-5',
};

// ============================================================
// LatestCollection Component
// ============================================================
export const LatestCollection = ({ 
  displayCount = DEFAULT_DISPLAY_COUNT,
  showViewAll = true,
  className = '',
  titleText1 = 'LATEST',
  titleText2 = 'COLLECTIONS',
  description = 'Explore our newest arrivals, curated specifically for the modern lifestyle. Quality meets elegance in every piece.',
  showQuickAdd = true,
  showWishlist = true,
  showSizeSelector = true,
  lazyLoad = true,
}) => {
  // --- Hooks ---
  const { products, isLoadingProducts, productError, currency } = useShop();
  const [isLoading, setIsLoading] = useState(true);

  // --- Memoized Values ---
  const latestProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    // Sort by creation date (newest first) if available
    const sortedProducts = [...products].sort((a, b) => {
      // If products have createdAt field, sort by it
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // Fallback: sort by _id (usually chronological)
      if (a._id && b._id) {
        return b._id.localeCompare(a._id);
      }
      return 0;
    });
    
    return sortedProducts.slice(0, displayCount);
  }, [products, displayCount]);

  // --- Effects ---
  useEffect(() => {
    if (isLoadingProducts) {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoadingProducts]);

  // --- Handlers ---
  const handleProductClick = useCallback((productId) => {
    console.log(`[Analytics] Product clicked: ${productId}`);
  }, []);

  // --- Render Helpers ---
  const renderSkeletons = useCallback(() => {
    const count = Math.min(displayCount, 10);
    return Array.from({ length: count }).map((_, index) => (
      <ProductItemSkeleton key={`skeleton-${index}`} variant="default" />
    ));
  }, [displayCount]);

  const renderProducts = useCallback(() => {
    if (latestProducts.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="max-w-sm mx-auto">
            <div className="text-4xl mb-3">🛍️</div>
            <p className="text-gray-400 text-sm font-medium">No products available at the moment</p>
            <p className="text-xs text-gray-300 mt-1">Check back later for new arrivals</p>
          </div>
        </div>
      );
    }

    return latestProducts.map((item) => (
      <ProductItem
        key={item._id || item.id}
        id={item._id || item.id}
        image={item.image}
        name={item.name}
        price={item.price}
        discount={item.discount}
        category={item.category}
        sizes={item.sizes}
        rating={item.rating}
        reviewCount={item.reviewCount}
        stock={item.stock}
        isNew={item.isNew}
        isBestSeller={item.isBestSeller}
        onProductClick={handleProductClick}
        showQuickAdd={showQuickAdd}
        showWishlist={showWishlist}
        showSizeSelector={showSizeSelector}
        lazyLoad={lazyLoad}
        currency={currency}
        className="hover:shadow-lg transition-shadow duration-300 rounded-lg p-2 hover:bg-gray-50"
      />
    ));
  }, [latestProducts, handleProductClick, showQuickAdd, showWishlist, showSizeSelector, lazyLoad, currency]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <section className={`my-10 md:my-16 ${className}`} aria-label="Latest Collections">
      {/* ===== Header Section ===== */}
      <div className='text-center py-8 px-4'>
        <Title text1={titleText1} text2={titleText2} />
        
        <p className='w-full max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mt-4'>
          {description}
        </p>

        {/* View All Link */}
        {showViewAll && latestProducts.length > 0 && (
          <div className="mt-6">
            <Link 
              to="/collection" 
              className="inline-block text-sm font-medium text-black border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors duration-300"
            >
              View All Collections →
            </Link>
          </div>
        )}
      </div>

      {/* ===== Error State ===== */}
      {productError && (
        <div className="text-center py-8 px-4">
          <div className="inline-block bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <p className="text-red-600 text-sm font-medium">
              ⚠️ {productError}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ===== Products Grid ===== */}
      {!productError && (
        <div className={`
          grid 
          ${GRID_COLUMNS.mobile} 
          ${GRID_COLUMNS.tablet} 
          ${GRID_COLUMNS.desktop} 
          ${GRID_COLUMNS.large} 
          gap-3 sm:gap-4 md:gap-6 
          px-2 sm:px-0
        `}>
          {isLoading ? renderSkeletons() : renderProducts()}
        </div>
      )}

      {/* ===== Empty State ===== */}
      {!isLoading && !productError && latestProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-400 text-sm font-medium">No products available</p>
            <p className="text-xs text-gray-300 mt-1">Check back later for new arrivals</p>
          </div>
        </div>
      )}
    </section>
  );
};

// ============================================================
// Default Export
// ============================================================
export default LatestCollection;

// ============================================================
// Optional: Featured Collection Component
// ============================================================
export const FeaturedCollection = ({ 
  products: featuredProducts, 
  title = 'Featured',
  subtitle = 'Handpicked just for you',
  showQuickAdd = true,
  showWishlist = true,
  showSizeSelector = true,
  className = '',
  ...props 
}) => {
  // --- Hooks ---
  const { currency } = useShop();

  // --- Handlers ---
  const handleProductClick = useCallback((productId) => {
    console.log(`[Analytics] Featured product clicked: ${productId}`);
  }, []);

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className={`my-12 ${className}`} aria-label="Featured Products">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-gray-900">
          {title}
        </h2>
        <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
        <div className="w-16 h-0.5 bg-black mx-auto mt-3"></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0">
        {featuredProducts.map((item) => (
          <ProductItem
            key={item._id || item.id}
            id={item._id || item.id}
            image={item.image}
            name={item.name}
            price={item.price}
            discount={item.discount}
            category={item.category}
            sizes={item.sizes}
            rating={item.rating}
            reviewCount={item.reviewCount}
            stock={item.stock}
            isNew={item.isNew}
            isBestSeller={item.isBestSeller}
            onProductClick={handleProductClick}
            showQuickAdd={showQuickAdd}
            showWishlist={showWishlist}
            showSizeSelector={showSizeSelector}
            currency={currency}
            className="hover:shadow-lg transition-shadow duration-300 rounded-lg p-2 hover:bg-gray-50"
            {...props}
          />
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center mt-8">
        <Link 
          to="/collection" 
          className="inline-block text-sm font-medium text-black border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors duration-300"
        >
          View All Products →
        </Link>
      </div>
    </section>
  );
};

// ============================================================
// Optional: Trending Products Component
// ============================================================
export const TrendingProducts = ({ 
  limit = 6,
  title = 'TRENDING',
  subtitle = 'What\'s hot right now',
  ...props 
}) => {
  // --- Hooks ---
  const { products, currency } = useShop();

  // --- Memoized Values ---
  const trendingProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    // Get products with highest ratings or bestseller status
    const sorted = [...products]
      .filter(p => p.rating >= 4 || p.isBestSeller)
      .sort((a, b) => {
        // Sort by rating first, then by popularity
        if (a.rating && b.rating) {
          return b.rating - a.rating;
        }
        if (a.isBestSeller && !b.isBestSeller) return -1;
        if (!a.isBestSeller && b.isBestSeller) return 1;
        return 0;
      })
      .slice(0, limit);
    
    return sorted;
  }, [products, limit]);

  if (trendingProducts.length === 0) {
    return null;
  }

  return (
    <FeaturedCollection 
      products={trendingProducts}
      title={title}
      subtitle={subtitle}
      {...props}
    />
  );
};

// ============================================================
// Optional: Category Collection Component
// ============================================================
export const CategoryCollection = ({ 
  category,
  title,
  limit = 6,
  ...props 
}) => {
  // --- Hooks ---
  const { products, currency } = useShop();

  // --- Memoized Values ---
  const categoryProducts = useMemo(() => {
    if (!products || products.length === 0 || !category) return [];
    
    return products
      .filter(p => p.category?.toLowerCase() === category.toLowerCase())
      .slice(0, limit);
  }, [products, category, limit]);

  if (categoryProducts.length === 0) {
    return null;
  }

  return (
    <FeaturedCollection 
      products={categoryProducts}
      title={title || category}
      subtitle={`Explore our ${category} collection`}
      {...props}
    />
  );
};