import React from 'react';

// ============================================================
// BrandShowcase Component
// ============================================================
export const BrandShowcase = () => {
  const brands = [
    { name: 'Nike', logo: '🔷' },
    { name: 'Adidas', logo: '⬛' },
    { name: 'Zara', logo: '❤️' },
    { name: 'H&M', logo: '💙' },
    { name: 'Puma', logo: '🐆' },
    { name: "Levi's", logo: '👖' },
  ];

  return (
    <div className="my-8 py-8 border-y border-gray-100">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-400 uppercase tracking-wider">Trusted by leading brands</p>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {brands.map((brand) => (
          <div key={brand.name} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl">{brand.logo}</span>
            <span className="text-sm font-medium">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandShowcase;