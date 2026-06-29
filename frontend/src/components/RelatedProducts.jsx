// components/RelatedProducts.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Title } from './Title';
import  ProductItem  from './ProductItem';
import  ProductItemSkeleton  from './ProductItemSkeleton';

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
// RelatedProducts Component
// ============================================================
export const RelatedProducts = ({
  category,
  subCategory,
  currentProductId,
  displayCount = DEFAULT_DISPLAY_COUNT,
  showTitle = true,
  titleText1 = 'RELATED',
  titleText2 = 'PRODUCTS',
  description = 'You might also like these products',
  className = '',
  fallbackMessage = 'No related products found',
  excludeCurrentProduct = true,
  showQuickAdd = true,
  showWishlist = false,
  showSizeSelector = true,
  lazyLoad = true,
}) => {
  // --- Hooks ---
  const { products, isLoadingProducts, currency } = useShop();
  const [isLoading, setIsLoading] = useState(true);

  // --- Memoized Values ---
  const relatedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Start with a copy of all products
    let productsCopy = [...products];

    // Filter by category (if provided)
    if (category) {
      productsCopy = productsCopy.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by subCategory (if provided)
    if (subCategory) {
      productsCopy = productsCopy.filter(
        (item) => item.subCategory?.toLowerCase() === subCategory.toLowerCase()
      );
    }

    // Exclude current product (if provided)
    if (excludeCurrentProduct && currentProductId) {
      productsCopy = productsCopy.filter(
        (item) => item._id !== currentProductId && item.id !== currentProductId
      );
    }

    // If no products found with both category and subCategory, try just category
    if (productsCopy.length === 0 && category && subCategory) {
      productsCopy = products.filter(
        (item) => 
          item.category?.toLowerCase() === category.toLowerCase() &&
          item._id !== currentProductId &&
          item.id !== currentProductId
      );
    }

    // Sort by relevance (products that match both category and subCategory first)
    const sortedProducts = productsCopy.sort((a, b) => {
      const aMatchesBoth = 
        a.category?.toLowerCase() === category?.toLowerCase() &&
        a.subCategory?.toLowerCase() === subCategory?.toLowerCase();
      const bMatchesBoth = 
        b.category?.toLowerCase() === category?.toLowerCase() &&
        b.subCategory?.toLowerCase() === subCategory?.toLowerCase();
      
      if (aMatchesBoth && !bMatchesBoth) return -1;
      if (!aMatchesBoth && bMatchesBoth) return 1;
      
      // If both match or neither match, sort by rating or popularity
      return (b.rating || 0) - (a.rating || 0);
    });

    // Return limited number of products
    return sortedProducts.slice(0, displayCount);
  }, [products, category, subCategory, currentProductId, displayCount, excludeCurrentProduct]);

  // --- Effects ---
  useEffect(() => {
    if (isLoadingProducts) {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoadingProducts]);

  // --- Handlers ---
  const handleProductClick = useCallback((productId) => {
    // Track product click for analytics
    console.log(`[Analytics] Related product clicked: ${productId}`);
  }, []);

  // --- Render Helpers ---
  const renderSkeletons = useCallback(() => {
    const count = Math.min(displayCount, 5);
    return Array.from({ length: count }).map((_, index) => (
      <ProductItemSkeleton key={`skeleton-${index}`} variant="default" />
    ));
  }, [displayCount]);

  const renderProducts = useCallback(() => {
    if (relatedProducts.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="max-w-sm mx-auto">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-400 text-sm font-medium">{fallbackMessage}</p>
            {category && (
              <p className="text-xs text-gray-300 mt-1">
                No products found in {category} {subCategory ? `/ ${subCategory}` : ''}
              </p>
            )}
            <Link 
              to="/collection"
              className="inline-block mt-4 text-xs text-black underline hover:text-gray-600 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      );
    }

    return relatedProducts.map((item) => (
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
        onProductClick={handleProductClick}
        showQuickAdd={showQuickAdd}
        showWishlist={showWishlist}
        showSizeSelector={showSizeSelector}
        lazyLoad={lazyLoad}
        currency={currency}
        className="hover:shadow-lg transition-shadow duration-300 rounded-lg p-2 hover:bg-gray-50"
      />
    ));
  }, [
    relatedProducts, 
    handleProductClick, 
    fallbackMessage, 
    category, 
    subCategory, 
    showQuickAdd, 
    showWishlist, 
    showSizeSelector, 
    lazyLoad, 
    currency
  ]);

  // ============================================================
  // Render
  // ============================================================
  if (!category && !subCategory) {
    return null;
  }

  return (
    <section className={`my-12 md:my-24 ${className}`} aria-label="Related Products">
      {/* ===== Header ===== */}
      {showTitle && (
        <div className="text-center mb-8">
          <Title text1={titleText1} text2={titleText2} />
          {description && relatedProducts.length > 0 && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md mx-auto">
              {description}
            </p>
          )}
          {relatedProducts.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">
              We couldn't find related products
            </p>
          )}
        </div>
      )}

      {/* ===== Products Grid ===== */}
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

      {/* ===== View All Link ===== */}
      {relatedProducts.length > 0 && relatedProducts.length >= displayCount && (
        <div className="text-center mt-8">
          <Link 
            to={`/collection?category=${encodeURIComponent(category || '')}`}
            className="text-sm text-gray-500 hover:text-black transition-colors inline-flex items-center gap-2"
          >
            View All {category || 'Products'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
};

// ============================================================
// Default Export
// ============================================================
export default RelatedProducts;

// ============================================================
// Enhanced Related Products with Fallback
// ============================================================
export const RelatedProductsWithFallback = ({
  category,
  subCategory,
  currentProductId,
  fallbackCategory,
  fallbackMessage = 'No related products found',
  ...props
}) => {
  // --- Hooks ---
  const { products } = useShop();
  const [hasRelatedProducts, setHasRelatedProducts] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  // Check if there are related products
  useEffect(() => {
    if (products && products.length > 0 && category) {
      const related = products.filter(
        (item) => 
          item.category?.toLowerCase() === category.toLowerCase() &&
          item._id !== currentProductId &&
          item.id !== currentProductId
      );
      setHasRelatedProducts(related.length > 0);
    }
    setIsChecking(false);
  }, [products, category, currentProductId]);

  // Show loading skeleton while checking
  if (isChecking) {
    return (
      <div className="my-12 md:my-24">
        <div className="text-center mb-8">
          <Title text1="RELATED" text2="PRODUCTS" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 px-4 sm:px-0">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductItemSkeleton key={`checking-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  // If no related products and we have a fallback, render with fallback
  if (!hasRelatedProducts && fallbackCategory) {
    return (
      <RelatedProducts
        category={fallbackCategory}
        subCategory={null}
        currentProductId={currentProductId}
        titleText1="YOU MIGHT"
        titleText2="ALSO LIKE"
        description={`Explore our ${fallbackCategory} collection`}
        fallbackMessage={`No products found in ${fallbackCategory}`}
        {...props}
      />
    );
  }

  // If no related products and no fallback, render nothing
  if (!hasRelatedProducts && !fallbackCategory) {
    return null;
  }

  return (
    <RelatedProducts
      category={category}
      subCategory={subCategory}
      currentProductId={currentProductId}
      fallbackMessage={fallbackMessage}
      {...props}
    />
  );
};

// ============================================================
// Product Recommendations Component
// ============================================================
export const ProductRecommendations = ({ 
  productId, 
  category, 
  subCategory,
  maxItems = 4,
  titleText1 = 'YOU MIGHT',
  titleText2 = 'ALSO LIKE',
  ...props 
}) => {
  // --- Hooks ---
  const { products, currency } = useShop();

  // Find products similar to the current one
  const recommendations = useMemo(() => {
    if (!products || products.length === 0 || !productId) return [];

    const currentProduct = products.find(
      p => p._id === productId || p.id === productId
    );
    
    if (!currentProduct) return [];

    // Get products with similar tags or attributes
    const similarProducts = products
      .filter(p => p._id !== productId && p.id !== productId)
      .map(product => {
        let score = 0;
        const reasons = [];
        
        // Same category: +10 points
        if (product.category === currentProduct.category) {
          score += 10;
          reasons.push('Same category');
        }
        
        // Same subCategory: +10 points
        if (product.subCategory === currentProduct.subCategory) {
          score += 10;
          reasons.push('Same sub-category');
        }
        
        // Price range similarity: +5 points
        const priceDiff = Math.abs(product.price - currentProduct.price);
        if (priceDiff < currentProduct.price * 0.2) {
          score += 5;
          reasons.push('Similar price');
        }
        
        // Rating similarity: +3 points
        if (product.rating && currentProduct.rating) {
          const ratingDiff = Math.abs(product.rating - currentProduct.rating);
          if (ratingDiff < 1) {
            score += 3;
            reasons.push('Similar rating');
          }
        }
        
        // Return product with score and reasons
        return { 
          ...product, 
          score, 
          reasons,
          matchPercentage: Math.min(Math.round((score / 28) * 100), 100)
        };
      })
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems);

    return similarProducts;
  }, [products, productId, maxItems]);

  // --- Handlers ---
  const handleProductClick = useCallback((productId) => {
    console.log(`[Analytics] Recommended product clicked: ${productId}`);
  }, []);

  // If no recommendations, fallback to related products
  if (recommendations.length === 0) {
    return (
      <RelatedProducts 
        category={category}
        subCategory={subCategory}
        currentProductId={productId}
        titleText1={titleText1}
        titleText2={titleText2}
        {...props}
      />
    );
  }

  return (
    <section className="my-12 md:my-24" aria-label="Recommended Products">
      <div className="text-center mb-8">
        <Title text1={titleText1} text2={titleText2} />
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Recommended based on your interests
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 px-4 sm:px-0">
        {recommendations.map((item) => (
          <div key={item._id || item.id} className="relative">
            <ProductItem
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
              onProductClick={handleProductClick}
              currency={currency}
              showQuickAdd={true}
              showWishlist={true}
              className="hover:shadow-lg transition-shadow duration-300 rounded-lg p-2 hover:bg-gray-50"
            />
            {/* Match badge */}
            {item.matchPercentage > 50 && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                {item.matchPercentage}% Match
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};