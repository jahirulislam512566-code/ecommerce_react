// components/ProductItemSkeleton.jsx
import React from 'react';

// ============================================================
// ProductItemSkeleton Component
// ============================================================
export const ProductItemSkeleton = ({ variant = 'default' }) => {
  // Compact variant - for horizontal layouts
  if (variant === 'compact') {
    return (
      <div className="flex gap-4 items-center animate-pulse">
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  // Featured variant - for hero/featured sections
  if (variant === 'featured') {
    return (
      <div className="animate-pulse bg-white rounded-2xl overflow-hidden shadow-xl">
        <div className="aspect-[16/9] bg-gray-200" />
        <div className="p-6 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  // Default variant - for grid layouts
  return (
    <div className="animate-pulse bg-white rounded-xl overflow-hidden border border-gray-100">
      {/* Image skeleton */}
      <div className="aspect-[3/4] bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        
        {/* Sizes skeleton */}
        <div className="flex gap-1 mt-1">
          <div className="h-5 w-8 bg-gray-200 rounded" />
          <div className="h-5 w-8 bg-gray-200 rounded" />
          <div className="h-5 w-8 bg-gray-200 rounded" />
        </div>
        
        {/* Add to cart button skeleton */}
        <div className="h-10 bg-gray-200 rounded w-full mt-2" />
      </div>
    </div>
  );
};

// ✅ Default export
export default ProductItemSkeleton;