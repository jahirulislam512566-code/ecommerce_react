import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Title } from './Title';
import { ProductItem, ProductItemSkeleton } from './ProductItem';

// ============================================================
// Constants
// ============================================================
const DEFAULT_DISPLAY_COUNT = 5;
const GRID_COLUMNS = {
  mobile: 'grid-cols-2',
  tablet: 'sm:grid-cols-3',
  desktop: 'md:grid-cols-4',
  large: 'lg:grid-cols-5',
};

// ============================================================
// BestSeller Component
// ============================================================
export const BestSeller = ({ 
  displayCount = DEFAULT_DISPLAY_COUNT,
  showViewAll = true,
  className = '',
  titleText1 = 'BEST',
  titleText2 = 'SELLERS',
  description = 'Our most-loved pieces, chosen by you. Discover the trends that are defining this season.',
  minSalesCount = 1, // Minimum sales count to be considered a bestseller
  sortBy = 'salesCount' // 'salesCount', 'rating', 'reviews'
}) => {
  // --- Hooks ---
  const { products, isLoadingProducts, productError } = useShop();
  const [isLoading, setIsLoading] = useState(true);

  // --- Memoized Values ---
  const bestSellerProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Filter products that are marked as bestsellers
    let filtered = products.filter((item) => {
      // Check if product has bestseller flag
      const isBestseller = item.bestseller === true;
      
      // Optional: Check sales count if available
      const hasMinimumSales = item.salesCount && item.salesCount >= minSalesCount;
      
      // Optional: Check rating if available
      const hasGoodRating = item.rating && item.rating >= 4.0;
      
      // Return true if product meets bestseller criteria
      return isBestseller || hasMinimumSales || hasGoodRating;
    });

    // Sort products based on sortBy parameter
    const sortedProducts = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'salesCount':
          return (b.salesCount || 0) - (a.salesCount || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return 0;
      }
    });

    // Return top N products
    return sortedProducts.slice(0, displayCount);
  }, [products, displayCount, minSalesCount, sortBy]);

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
    // Track product click for analytics
    console.log(`[Analytics] Best seller clicked: ${productId}`);
  }, []);

  // --- Render Helpers ---
  const renderSkeletons = useCallback(() => {
    return Array.from({ length: displayCount }).map((_, index) => (
      <ProductItemSkeleton key={`skeleton-${index}`} />
    ));
  }, [displayCount]);

  const renderProducts = useCallback(() => {
    if (bestSellerProducts.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-400">No bestseller products available at the moment</p>
        </div>
      );
    }

    return bestSellerProducts.map((item) => (
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
  }, [bestSellerProducts, handleProductClick]);

  // --- Badge Helper ---
  const renderBadge = useCallback(() => {
    if (bestSellerProducts.length === 0) return null;
    
    return (
      <div className="flex items-center gap-2 mt-2">
        <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
          <span className="text-lg">⭐</span>
          {displayCount} Top Picks
        </span>
      </div>
    );
  }, [bestSellerProducts.length, displayCount]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <section className={`my-10 md:my-16 ${className}`} aria-label="Best Sellers">
      {/* ===== Header Section ===== */}
      <div className='text-center py-8 px-4'>
        <Title text1={titleText1} text2={titleText2} />
        
        <p className='w-full max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mt-4'>
          {description}
        </p>

        {/* Badge and View All */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
          {renderBadge()}
          
          {showViewAll && bestSellerProducts.length > 0 && (
            <a 
              href="/collection?filter=bestseller" 
              className="inline-block text-sm font-medium text-black border-b-2 border-black pb-1 hover:text-orange-600 hover:border-orange-600 transition-colors duration-300"
            >
              View All Best Sellers →
            </a>
          )}
        </div>
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
      {!isLoading && !productError && bestSellerProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <p className="text-gray-400 mb-2">No bestseller products available</p>
            <p className="text-sm text-gray-300">
              Check back soon for our top-selling items
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

// ============================================================
// Default Export
// ============================================================
export default BestSeller;

// ============================================================
// Optional: BestSeller Analytics Component
// ============================================================
export const BestSellerWithAnalytics = ({ 
  onProductView,
  onProductClick,
  ...props 
}) => {
  const { products } = useShop();

  const handleProductClick = useCallback((productId) => {
    // Track product click
    if (onProductClick) {
      onProductClick(productId);
    }
    
    // Send analytics event
    if (window.gtag) {
      window.gtag('event', 'select_item', {
        items: [{
          item_id: productId,
          item_category: 'bestseller'
        }]
      });
    }
  }, [onProductClick]);

  const handleProductView = useCallback((productId) => {
    if (onProductView) {
      onProductView(productId);
    }
  }, [onProductView]);

  // Use Intersection Observer for view tracking
  useEffect(() => {
    if (!products || products.length === 0 || !handleProductView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const productId = entry.target.dataset.productId;
            if (productId) {
              handleProductView(productId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe product items
    const productElements = document.querySelectorAll('[data-product-id]');
    productElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [products, handleProductView]);

  return <BestSeller onProductClick={handleProductClick} {...props} />;
};

// ============================================================
// Optional: Top Rated Component
// ============================================================
export const TopRated = (props) => {
  return (
    <BestSeller 
      titleText1="TOP"
      titleText2="RATED"
      description="Our highest-rated products, loved by customers for their quality and style."
      sortBy="rating"
      displayCount={4}
      minSalesCount={0}
      {...props}
    />
  );
};