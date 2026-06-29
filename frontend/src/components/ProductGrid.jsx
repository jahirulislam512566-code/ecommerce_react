// components/ProductGrid.jsx
import React from 'react';
import ProductItem from './ProductItem';
import ProductItemSkeleton from './ProductItemSkeleton';

const GRID_COLUMNS = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
};

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
  emptyMessage = 'No products found',
  emptySubMessage = 'Check back later for new arrivals',
}) => {
  // Loading State
  if (loading) {
    return (
      <div className={`grid ${GRID_COLUMNS[columns] || GRID_COLUMNS[4]} gap-4 md:gap-6 ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductItemSkeleton key={`skeleton-${index}`} variant="default" />
        ))}
      </div>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🛍️</div>
        <h3 className="text-lg font-medium text-gray-900">{emptyMessage}</h3>
        <p className="text-gray-500 mt-1 text-sm">{emptySubMessage}</p>
      </div>
    );
  }

  // Grid Variant Styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact': 
        return 'gap-2 sm:gap-3';
      case 'featured': 
        return 'gap-6 md:gap-8';
      default: 
        return 'gap-3 sm:gap-4 md:gap-6';
    }
  };

  return (
    <div className={`grid ${GRID_COLUMNS[columns] || GRID_COLUMNS[4]} ${getVariantClasses()} ${className}`}>
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
          className="hover:shadow-lg transition-shadow duration-300 rounded-lg p-2 hover:bg-gray-50"
        />
      ))}
    </div>
  );
};

export default ProductGrid;