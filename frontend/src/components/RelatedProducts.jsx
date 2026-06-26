import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
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
}) => {
  // --- Hooks ---
  const { products, isLoadingProducts } = useShop();
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
      return 0;
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
    return Array.from({ length: displayCount }).map((_, index) => (
      <ProductItemSkeleton key={`skeleton-${index}`} />
    ));
  }, [displayCount]);

  const renderProducts = useCallback(() => {
    if (relatedProducts.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <div className="max-w-sm mx-auto">
            <p className="text-gray-400 text-sm">{fallbackMessage}</p>
            {category && (
              <p className="text-xs text-gray-300 mt-1">
                No products found in {category} {subCategory ? `/ ${subCategory}` : ''}
              </p>
            )}
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
        onProductClick={handleProductClick}
        className="hover:shadow-lg transition-shadow duration-300 rounded-lg p-2 hover:bg-gray-50"
      />
    ));
  }, [relatedProducts, handleProductClick, fallbackMessage, category, subCategory]);

  // ============================================================
  // Render
  // ============================================================
  if (!category && !subCategory) {
    return null; // Don't render if no category or subCategory provided
  }

  return (
    <section className={`my-12 md:my-24 ${className}`} aria-label="Related Products">
      {/* ===== Header ===== */}
      {showTitle && (
        <div className="text-center mb-8">
          <Title text1={titleText1} text2={titleText2} />
          {description && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md mx-auto">
              {description}
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
        gap-4 md:gap-6
        px-4 sm:px-0
      `}>
        {isLoading ? renderSkeletons() : renderProducts()}
      </div>
    </section>
  );
};

// ============================================================
// Default Export
// ============================================================
export default RelatedProducts;

// ============================================================
// Optional: Enhanced Related Products with Fallback
// ============================================================
export const RelatedProductsWithFallback = ({
  category,
  subCategory,
  currentProductId,
  fallbackCategory,
  ...props
}) => {
  // If no products found in the same category/subCategory, try fallback category
  const { products } = useShop();
  
  const [hasRelatedProducts, setHasRelatedProducts] = useState(true);

  // Check if there are related products
  useEffect(() => {
    if (products && products.length > 0 && category) {
      const related = products.filter(
        (item) => 
          item.category?.toLowerCase() === category.toLowerCase() &&
          item._id !== currentProductId
      );
      setHasRelatedProducts(related.length > 0);
    }
  }, [products, category, currentProductId]);

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
      {...props}
    />
  );
};

// ============================================================
// Optional: Product Recommendations Component
// ============================================================
export const ProductRecommendations = ({ 
  productId, 
  category, 
  subCategory,
  maxItems = 4,
  ...props 
}) => {
  const { products } = useShop();

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
        
        // Same category: +10 points
        if (product.category === currentProduct.category) score += 10;
        
        // Same subCategory: +10 points
        if (product.subCategory === currentProduct.subCategory) score += 10;
        
        // Price range similarity: +5 points
        const priceDiff = Math.abs(product.price - currentProduct.price);
        if (priceDiff < currentProduct.price * 0.2) score += 5;
        
        // Return product with score
        return { ...product, score };
      })
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems);

    return similarProducts;
  }, [products, productId, maxItems]);

  if (recommendations.length === 0) {
    return (
      <RelatedProducts 
        category={category}
        subCategory={subCategory}
        currentProductId={productId}
        titleText1="RELATED"
        titleText2="ITEMS"
        {...props}
      />
    );
  }

  return (
    <section className="my-12 md:my-24" aria-label="Recommended Products">
      <div className="text-center mb-8">
        <Title text1="YOU MIGHT" text2="ALSO LIKE" />
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Recommended based on your interests
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 px-4 sm:px-0">
        {recommendations.map((item) => (
          <ProductItem
            key={item._id || item.id}
            id={item._id || item.id}
            image={item.image}
            name={item.name}
            price={item.price}
            discount={item.discount}
            category={item.category}
            sizes={item.sizes}
          />
        ))}
      </div>
    </section>
  );
};