// pages/Collection.jsx
import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useShop } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { Title } from "../components/Title";
import ProductItem from '../components/ProductItem';
import ProductItemSkeleton from '../components/ProductItemSkeleton';

// ============================================================
// Constants & Configuration
// ============================================================
const CATEGORIES = ['Men', 'Women', 'Kids'];
const SUB_CATEGORIES = ['Topwear', 'Bottomwear', 'Winterwear'];
const SORT_OPTIONS = [
  { value: 'relevant', label: 'Sort by: Relevant' },
  { value: 'low-high', label: 'Sort by: Low to High' },
  { value: 'high-low', label: 'Sort by: High to Low' },
  { value: 'rating', label: 'Sort by: Rating' },
  { value: 'newest', label: 'Sort by: Newest' },
];

const GRID_COLUMNS = {
  mobile: 'grid-cols-2',
  tablet: 'md:grid-cols-3',
  desktop: 'lg:grid-cols-4',
};

const ITEMS_PER_PAGE = 12;

// ============================================================
// Collection Component
// ============================================================
export const Collection = ({
  showFilterInitially = false,
  enablePagination = true,
  itemsPerPage = ITEMS_PER_PAGE,
  className = '',
}) => {
  // --- Hooks ---
  const { products, searchQuery, showSearchBar, isLoadingProducts, currency } = useShop();
  
  // --- State ---
  const [showFilter, setShowFilter] = useState(showFilterInitially);
  const [filterProducts, setFilterProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // --- Memoized Values ---
  const totalPages = useMemo(() => {
    return Math.ceil(filterProducts.length / itemsPerPage);
  }, [filterProducts.length, itemsPerPage]);

  const paginatedProducts = useMemo(() => {
    if (!enablePagination) return filterProducts;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filterProducts.slice(startIndex, endIndex);
  }, [filterProducts, currentPage, itemsPerPage, enablePagination]);

  // --- Handlers ---
  const toggleCategory = useCallback((category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(item => item !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  }, []);

  const toggleSubCategory = useCallback((subCategory) => {
    setSelectedSubCategories(prev => 
      prev.includes(subCategory)
        ? prev.filter(item => item !== subCategory)
        : [...prev, subCategory]
    );
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSortType('relevant');
    setCurrentPage(1);
  }, []);

  // --- Filter Logic ---
  const applyFilters = useCallback(() => {
    if (!products || products.length === 0) {
      setFilterProducts([]);
      return [];
    }

    let productsCopy = [...products];

    // Search filter
    if (showSearchBar && searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      productsCopy = productsCopy.filter(item => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.subCategory?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      productsCopy = productsCopy.filter(item => 
        selectedCategories.includes(item.category)
      );
    }

    // SubCategory filter
    if (selectedSubCategories.length > 0) {
      productsCopy = productsCopy.filter(item => 
        selectedSubCategories.includes(item.subCategory)
      );
    }

    return productsCopy;
  }, [products, searchQuery, showSearchBar, selectedCategories, selectedSubCategories]);

  // --- Sort Logic ---
  const sortProducts = useCallback((productsToSort) => {
    if (!productsToSort || productsToSort.length === 0) return [];

    const sorted = [...productsToSort];

    switch (sortType) {
      case 'low-high':
        return sorted.sort((a, b) => a.price - b.price);
      case 'high-low':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
      default: // 'relevant'
        return sorted;
    }
  }, [sortType]);

  // --- Effects ---
  // Apply filters and sorting
  useEffect(() => {
    const filtered = applyFilters();
    const sorted = sortProducts(filtered);
    setFilterProducts(sorted);
  }, [applyFilters, sortProducts]);

  // Reset loading state
  useEffect(() => {
    if (isLoadingProducts) {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoadingProducts]);

  // Reset page when products change
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  // --- Render Helpers ---
  const renderFilterCheckboxes = useCallback((items, selectedItems, toggleHandler, label) => {
    return (
      <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 cursor-pointer hover:text-black transition-colors">
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={() => toggleHandler(item)}
              className="w-4 h-4 accent-black cursor-pointer"
              aria-label={`Filter by ${item}`}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    );
  }, []);

  const renderSkeletons = useCallback(() => {
    const count = enablePagination ? Math.min(itemsPerPage, 12) : 8;
    return Array.from({ length: count }).map((_, index) => (
      <ProductItemSkeleton key={`skeleton-${index}`} variant="default" />
    ));
  }, [itemsPerPage, enablePagination]);

  const renderPagination = useCallback(() => {
    if (!enablePagination || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          ←
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-400">…</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 text-sm border rounded transition-colors ${
              currentPage === page
                ? 'bg-black text-white border-black'
                : 'hover:bg-gray-50'
            }`}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-400">…</span>}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          →
        </button>
      </div>
    );
  }, [currentPage, totalPages, enablePagination]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <section className={`flex flex-col sm:flex-row gap-4 sm:gap-10 pt-10 border-t ${className}`}>
      
      {/* ===== Filter Section ===== */}
      <aside className="min-w-60 flex-shrink-0">
        {/* Filter Toggle (Mobile) */}
        <div className="flex items-center justify-between sm:block">
          <button
            onClick={() => setShowFilter(prev => !prev)}
            className="my-2 text-xl flex items-center gap-2 uppercase tracking-widest hover:text-black transition-colors"
            aria-expanded={showFilter}
            aria-controls="filter-section"
          >
            Filters
            <img 
              className={`h-3 transition-transform duration-300 ${showFilter ? 'rotate-90' : ''} sm:hidden`} 
              src={assets.dropdown_icon} 
              alt="Toggle filters" 
            />
          </button>
          
          {/* Clear Filters Button */}
          {(selectedCategories.length > 0 || selectedSubCategories.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-black transition-colors sm:hidden"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Content */}
        <div 
          id="filter-section"
          className={`${showFilter ? 'block' : 'hidden'} sm:block`}
        >
          {/* Categories */}
          <div className="border border-gray-300 pl-5 py-3 mt-6">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider">Categories</h3>
            {renderFilterCheckboxes(
              CATEGORIES,
              selectedCategories,
              toggleCategory,
              'Category'
            )}
          </div>

          {/* SubCategories */}
          <div className="border border-gray-300 pl-5 py-3 my-5">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider">Type</h3>
            {renderFilterCheckboxes(
              SUB_CATEGORIES,
              selectedSubCategories,
              toggleSubCategory,
              'SubCategory'
            )}
          </div>

          {/* Active Filters Summary */}
          {(selectedCategories.length > 0 || selectedSubCategories.length > 0) && (
            <div className="hidden sm:block mt-4">
              <p className="text-xs text-gray-500 mb-2">Active filters:</p>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map(cat => (
                  <span 
                    key={cat}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {cat}
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="hover:text-red-500"
                      aria-label={`Remove ${cat} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedSubCategories.map(sub => (
                  <span 
                    key={sub}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {sub}
                    <button
                      onClick={() => toggleSubCategory(sub)}
                      className="hover:text-red-500"
                      aria-label={`Remove ${sub} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ===== Product Section ===== */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Results Count */}
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {filterProducts.length} {filterProducts.length === 1 ? 'product' : 'products'}
            </span>

            {/* Sort Dropdown */}
            <select
              value={sortType}
              onChange={(e) => {
                setSortType(e.target.value);
                setCurrentPage(1);
              }}
              className="border-2 border-gray-300 text-sm px-3 py-1.5 outline-none bg-white rounded focus:border-black transition-colors cursor-pointer"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`
          grid 
          ${GRID_COLUMNS.mobile} 
          ${GRID_COLUMNS.tablet} 
          ${GRID_COLUMNS.desktop} 
          gap-3 sm:gap-4 gap-y-6
        `}>
          {isLoading ? (
            renderSkeletons()
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map((item) => (
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
                currency={currency}
                showQuickAdd={true}
                showWishlist={true}
                showSizeSelector={true}
                className="hover:shadow-lg transition-shadow duration-300 rounded-lg p-2 hover:bg-gray-50"
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="max-w-sm mx-auto">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-400 text-lg font-medium mb-2">No products found</p>
                <p className="text-sm text-gray-300">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-black underline hover:text-gray-600 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && renderPagination()}
      </div>
    </section>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Collection;