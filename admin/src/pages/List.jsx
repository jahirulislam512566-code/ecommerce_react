// admin/src/pages/List.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

/**
 * @component List
 * @description Catalog table management layout utilizing global backend configurations aligned with REST patterns.
 */
const List = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // ✅ Get token from props or localStorage
  const getToken = () => {
    return token || localStorage.getItem('token') || '';
  };

  // ✅ Create axios instance with auth header
  const api = axios.create({
    baseURL: backendUrl,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // ✅ Add token to every request
  api.interceptors.request.use(
    (config) => {
      const authToken = getToken();
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ✅ Handle 401 responses
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        toast.error('Session expired. Please login again.');
        window.location.href = '/admin/login';
      }
      return Promise.reject(error);
    }
  );

  // ✅ Fetch products
  const fetchProducts = useCallback(async () => {
    const authToken = getToken();
    
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/product/list');
      
      if (response.data.success) {
        setProducts(response.data.products || []);
      } else {
        setError(response.data.message || 'Failed to fetch products.');
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      } else {
        setError(
          err.response?.data?.message || 
          'Unable to reach backend services. Please ensure the server is running.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Delete product
  const handleDelete = useCallback(async (id, name) => {
    if (!id) {
      toast.error('Invalid product ID');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the catalog?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await api.delete(`/api/product/${id}`);

      if (response.data.success) {
        setProducts((prevProducts) => prevProducts.filter(item => item._id !== id));
        toast.success(`✅ "${name}" deleted successfully!`);
      } else {
        toast.error(response.data.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error("❌ Delete Error:", err);
      toast.error(
        err.response?.data?.message || 
        'Failed to delete product. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // ✅ Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // ✅ Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchTerm]);

  // ✅ Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // ✅ Get image URL
  const getImageUrl = useCallback((image) => {
    if (!image) return 'https://placehold.co/100x100?text=No+Image';
    if (Array.isArray(image)) {
      return image[0] || 'https://placehold.co/100x100?text=No+Image';
    }
    return image;
  }, []);

  // ✅ Format price
  const formatPrice = useCallback((price) => {
    return Number(price || 0).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }, []);

  // ✅ Get status badge
  const getStockStatus = useCallback((stock) => {
    if (stock <= 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    }
    if (stock <= 5) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700' };
  }, []);

  // ✅ Track token state
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ✅ Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div className='bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100'>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className='text-2xl font-black text-gray-900 tracking-tight'>📦 Product Catalog</h1>
            <p className='text-gray-500 text-sm mt-0.5'>
              Manage your product inventory and catalog listings.
            </p>
          </div>
          <Link 
            to="/add" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-lg">➕</span>
            Add Product
          </Link>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className='p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg mb-5 text-sm font-semibold flex items-start gap-3'>
          <span className="text-lg">⚠️</span>
          <span className="flex-1">{error}</span>
          <button 
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Filters */}
      {!loading && products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search products by name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              ⟳ Refresh
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className='text-center py-12'>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-3"></div>
          <p className='text-gray-400 text-sm font-medium uppercase tracking-wide'>
            Loading products...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className='text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50'>
          <div className="text-4xl mb-3">📭</div>
          <p className="font-semibold text-sm">Your product catalog is empty.</p>
          <p className="text-xs text-gray-400 mt-1">Navigate to the entry panel to upload stock items.</p>
          <Link 
            to="/add" 
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Add Your First Product
          </Link>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className='text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50'>
          <p className="font-semibold text-sm">No products match your filters.</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <>
          {/* Products Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className='min-w-full bg-white text-left text-sm border-collapse'>
              <thead>
                <tr className='bg-gray-50/70 text-gray-500 uppercase font-bold text-[11px] tracking-widest border-b border-gray-100'>  
                  <th className='py-4 px-5 w-20'>Image</th>
                  <th className='py-4 px-5'>Product</th>
                  <th className='py-4 px-5 w-24'>Price</th>
                  <th className='py-4 px-5 w-28'>Stock</th>
                  <th className='py-4 px-5 w-32 text-center'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 text-gray-700'>  
                {paginatedProducts.map((item) => (
                  <tr key={item._id} className='hover:bg-gray-50/60 transition-colors group'>
                    <td className='py-4 px-5 align-middle'>
                      <img 
                        src={getImageUrl(item.image)} 
                        alt={item.name || "Product"} 
                        className='w-12 h-12 object-cover rounded-lg border border-gray-100 shadow-sm'
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/100x100?text=No+Image";
                        }}
                      />
                    </td>
                    
                    <td className='py-4 px-5'>
                      <div className="font-semibold text-gray-900 text-sm">
                        {item.name || 'Unnamed Product'}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {item.category || 'Uncategorized'}
                        {item.subCategory && ` / ${item.subCategory}`}
                      </div>
                    </td>
                    
                    <td className='py-4 px-5 font-bold text-gray-900 text-sm'>
                      ${formatPrice(item.price)}
                    </td>

                    <td className='py-4 px-5'>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(item.stock).color}`}>
                        {getStockStatus(item.stock).label}
                      </span>
                    </td>
                    
                    <td className='py-4 px-5 text-center align-middle'>
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className='bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium py-1.5 px-3 rounded-lg text-xs transition-all border border-transparent hover:border-blue-200'
                          onClick={() => window.location.href = `/product/${item._id}`}
                        >
                          View
                        </button>
                        <button 
                          className='bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-all border border-red-100 hover:border-transparent'
                          onClick={() => handleDelete(item._id, item.name)}
                          disabled={isDeleting}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
                {filteredProducts.length} products
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border rounded transition-colors ${
                        currentPage === pageNum
                          ? 'bg-black text-white border-black'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default List;