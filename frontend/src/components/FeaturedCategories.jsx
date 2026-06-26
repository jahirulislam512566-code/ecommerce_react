import React from 'react';
import { Link } from 'react-router-dom';

// ============================================================
// FeaturedCategories Component
// ============================================================
export const FeaturedCategories = ({ onViewAll }) => {
  const categories = [
    { name: 'Men', icon: '👔', count: '120+', color: 'bg-blue-50', slug: 'men' },
    { name: 'Women', icon: '👗', count: '150+', color: 'bg-pink-50', slug: 'women' },
    { name: 'Kids', icon: '👶', count: '80+', color: 'bg-green-50', slug: 'kids' },
    { name: 'Accessories', icon: '👜', count: '60+', color: 'bg-purple-50', slug: 'accessories' },
  ];

  return (
    <div className="my-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
        <p className="text-sm text-gray-500 mt-1">Find what you're looking for</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={`/collection?category=${category.slug}`}
            onClick={() => onViewAll?.(category.name)}
            className={`${category.color} p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <h3 className="font-semibold text-gray-800">{category.name}</h3>
            <p className="text-xs text-gray-400">{category.count} products</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCategories;