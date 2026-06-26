import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Title } from './Title';
import { ProductItem, ProductItemSkeleton } from './ProductItem';

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
  description = 'Explore our newest arrivals, curated specifically for the modern lifestyle. Quality meets elegance in every piece.'
}) => {
  // --- Hooks ---
  const { products, isLoadingProducts, productError } = useShop();
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
    // Show loading state while products are being fetched
    if (isLoadingProducts) {
      setIsLoading(true);
    } else {
      // Add a small delay for smoother transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoadingProducts]);

  // --- Handlers ---
  const handleProductClick = useCallback((productId) => {
    // Track product click for analytics if needed
    console.log(`[Analytics] Product clicked: ${productId}`);
  }, []);

  // --- Render Helpers ---
  const renderSkeletons = useCallback(() => {
    return Array.from({ length: displayCount }).map((_, index) => (
      <ProductItemSkeleton key={`skeleton-${index}`} />
    ));
  }, [displayCount]);

  const renderProducts = useCallback(() => {
    if (latestProducts.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-400">No products available at the moment</p>
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
        onProductClick={handleProductClick}
        className="hover:shadow-lg transition-shadow duration-300 rounded-lg p-2 hover:bg-gray-50"
      />
    ));
  }, [latestProducts, handleProductClick]);

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
            <a 
              href="/collection" 
              className="inline-block text-sm font-medium text-black border-b-2 border-black pb-1 hover:text-orange-600 hover:border-orange-600 transition-colors duration-300"
            >
              View All Collections →
            </a>
          </div>
        )}
      </div>

      {/* ===== Error State ===== */}
      {productError && (
        <div className="text-center py-8 px-4">
          <div className="inline-block bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <p className="text-red-600 text-sm">
              ⚠️ {productError}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
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
          gap-4 md:gap-6 
          px-4 sm:px-0
        `}>
          {isLoading ? renderSkeletons() : renderProducts()}
        </div>
      )}

      {/* ===== Empty State ===== */}
      {!isLoading && !productError && latestProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No products available</p>
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
  ...props 
}) => {
  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="my-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wider">{title}</h2>
        <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
      </div>
      
      <LatestCollection 
        displayCount={featuredProducts.length}
        titleText1={title}
        titleText2=""
        description={subtitle}
        showViewAll={false}
        {...props}
      />
    </div>
  );
};