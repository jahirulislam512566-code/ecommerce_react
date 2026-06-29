import React, { useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { Title } from '../components/Title';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// ============================================================
// Constants
// ============================================================
const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-400',
  [ORDER_STATUS.PROCESSING]: 'bg-blue-400',
  [ORDER_STATUS.SHIPPED]: 'bg-purple-400',
  [ORDER_STATUS.DELIVERED]: 'bg-green-500',
  [ORDER_STATUS.CANCELLED]: 'bg-red-500',
  [ORDER_STATUS.REFUNDED]: 'bg-gray-400',
};

const STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.REFUNDED]: 'Refunded',
};

const STATUS_ICONS = {
  [ORDER_STATUS.PENDING]: '⏳',
  [ORDER_STATUS.PROCESSING]: '⚙️',
  [ORDER_STATUS.SHIPPED]: '🚚',
  [ORDER_STATUS.DELIVERED]: '✅',
  [ORDER_STATUS.CANCELLED]: '❌',
  [ORDER_STATUS.REFUNDED]: '↩️',
};

const ITEMS_PER_PAGE = 10;
const API_TIMEOUT = 15000;

// ============================================================
// OrderItem Component
// ============================================================
const OrderItem = React.memo(({ item, currency, onTrackOrder, onReorder, uniqueKey }) => {
  const getStatusColor = useCallback((status) => {
    return STATUS_COLORS[status] || 'bg-gray-400';
  }, []);

  const getStatusLabel = useCallback((status) => {
    return STATUS_LABELS[status] || status;
  }, []);

  const getStatusIcon = useCallback((status) => {
    return STATUS_ICONS[status] || '📦';
  }, []);

  const getImageUrl = useCallback(() => {
    if (!item.image) return '/placeholder-image.png';
    if (Array.isArray(item.image)) {
      return item.image[0] || '/placeholder-image.png';
    }
    return item.image;
  }, [item.image]);

  return (
    <div 
      className="py-4 border-t first:border-t-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Product Info */}
        <div className="flex items-start gap-4 sm:gap-6 text-sm">
          <div className="flex-shrink-0">
            <img
              className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-lg border border-gray-100"
              src={getImageUrl()}
              alt={item.name || 'Product'}
              loading="lazy"
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="sm:text-base font-medium text-gray-900 truncate">
              {item.name || 'Unnamed Product'}
            </p>
            
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">
                {currency}{item.price?.toLocaleString() || '0'}
              </p>
              <span className="text-gray-300">•</span>
              <p>Qty: <span className="font-medium">{item.quantity || 0}</span></p>
              <span className="text-gray-300">•</span>
              <p className="px-2 py-0.5 bg-gray-100 text-xs rounded border border-gray-200">
                Size: <span className="font-medium">{item.size || 'N/A'}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
              <p>📅 <span className="text-gray-700 font-medium">{item.date || 'N/A'}</span></p>
              <p>💳 <span className="text-gray-700 font-medium uppercase">{item.payment || 'COD'}</span></p>
              {item.trackingNumber && (
                <p>📦 Tracking: <span className="text-gray-700 font-medium">{item.trackingNumber}</span></p>
              )}
            </div>

            {item.totalItems && item.totalItems > 1 && (
              <p className="text-xs text-gray-400 mt-1">
                + {item.totalItems - 1} more item{item.totalItems - 1 > 1 ? 's' : ''} in this order
              </p>
            )}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="md:w-1/2 flex flex-wrap items-center justify-between gap-3 md:pl-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`min-w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></span>
            <span className="text-sm font-medium capitalize text-gray-700 flex items-center gap-1">
              {getStatusIcon(item.status)} {getStatusLabel(item.status)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTrackOrder(item.orderId || item._id)}
              className="px-4 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-black hover:border-black hover:text-white transition-all duration-300"
              aria-label={`Track order ${item.orderId || item._id}`}
            >
              Track Order
            </button>
            
            {item.status === ORDER_STATUS.DELIVERED && (
              <button
                onClick={() => onReorder(item)}
                className="px-4 py-1.5 text-xs font-medium bg-black text-white rounded hover:bg-gray-800 transition-all duration-300"
                aria-label="Reorder this product"
              >
                Reorder
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

OrderItem.displayName = 'OrderItem';

// ============================================================
// OrderSkeleton Component
// ============================================================
const OrderSkeleton = () => {
  return (
    <div className="py-4 border-t first:border-t-0 border-b border-gray-200 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="md:w-1/2 flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// EmptyState Component
// ============================================================
const EmptyState = ({ statusFilter, isAuthenticated }) => {
  if (!isAuthenticated) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <div className="max-w-sm mx-auto">
          <div className="text-4xl mb-4">🔒</div>
          <p className="font-medium text-gray-700">Please login to view your orders</p>
          <p className="text-sm text-gray-400 mt-1">
            Login to see your order history and track your purchases
          </p>
          <Link
            to="/login"
            className="inline-block mt-4 px-6 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <div className="max-w-sm mx-auto">
        <div className="text-4xl mb-4">📦</div>
        <p className="font-medium text-gray-700">No orders found</p>
        <p className="text-sm text-gray-400 mt-1">
          {statusFilter !== 'all'
            ? `No ${statusFilter.toLowerCase()} orders found. Try adjusting your filter.`
            : "You haven't placed any orders yet. Start shopping!"}
        </p>
        <Link
          to="/collection"
          className="inline-block mt-4 px-6 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
};

// ============================================================
// TrackOrderModal Component
// ============================================================
const TrackOrderModal = ({ orderId, onClose }) => {
  if (!orderId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Track Order</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Order ID: <span className="font-medium text-gray-900">{orderId}</span>
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Order is being processed
          </div>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              Order Confirmed
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
              Processing
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Shipped - In Transit
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <span className="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
              Delivered
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Main Orders Component
// ============================================================
export const Orders = ({
  titleText1 = 'MY',
  titleText2 = 'ORDERS',
  className = '',
  showFilters = true,
  itemsPerPage = ITEMS_PER_PAGE,
}) => {
  // --- Hooks ---
  const shopContext = useShop();
  
  // ✅ Safely get context values with fallbacks
  const backendUrl = shopContext.backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const token = shopContext.token || localStorage.getItem('ecom_token') || '';
  const currency = shopContext.currency || '$';
  const isAuthenticated = shopContext.isAuthenticated || !!token;

  // --- Refs ---
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  // --- State ---
  const [orderData, setOrderData] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Memoized Values ---
  const totalPages = useMemo(() => {
    return Math.ceil(filteredOrders.length / itemsPerPage);
  }, [filteredOrders.length, itemsPerPage]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const statusCounts = useMemo(() => {
    const counts = { all: orderData.length };
    Object.values(ORDER_STATUS).forEach(status => {
      counts[status] = orderData.filter(item => item.status === status).length;
    });
    return counts;
  }, [orderData]);

  const totalOrders = useMemo(() => orderData.length, [orderData]);

  // --- Generate Unique Key Helper ---
  const generateUniqueKey = useCallback((item, index) => {
    const orderId = item.orderId || item._id || 'unknown';
    const productId = item.productId || item._id || 'unknown';
    const size = item.size || 'nosize';
    const timestamp = item.date || Date.now();
    
    return `${orderId}-${productId}-${size}-${index}-${timestamp}`;
  }, []);

  // --- Handlers ---
  const loadOrderData = useCallback(async (showLoading = true) => {
    if (!token || !isAuthenticated) {
      setOrderData([]);
      setFilteredOrders([]);
      setIsLoading(false);
      return;
    }

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const response = await axios.get(
        `${backendUrl}/api/order/userorders`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: API_TIMEOUT,
          signal: abortControllerRef.current.signal,
        }
      );

      if (!isMounted.current) return;

      if (response.data.success) {
        const allOrdersItemized = [];
        let totalSpentAmount = 0;
        
        const orders = response.data.orders || [];
        
        if (orders.length === 0) {
          setOrderData([]);
          setFilteredOrders([]);
          setTotalSpent(0);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        orders.forEach((order) => {
          const items = order.items || [];
          
          const orderTotal = items.reduce((sum, item) => {
            return sum + (item.price || 0) * (item.quantity || 0);
          }, 0);
          
          totalSpentAmount += orderTotal;
          
          if (items.length > 0) {
            items.forEach((item, itemIndex) => {
              allOrdersItemized.push({
                ...item,
                orderId: order._id,
                status: order.status || ORDER_STATUS.PENDING,
                payment: order.paymentMethod || order.payment || 'COD',
                date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-BD', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : new Date().toLocaleDateString('en-BD', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }),
                trackingNumber: order.trackingNumber || null,
                totalItems: items.length,
                orderItemIndex: itemIndex,
                orderDate: order.createdAt || order.date || new Date().toISOString(),
              });
            });
          } else {
            allOrdersItemized.push({
              orderId: order._id,
              status: order.status || ORDER_STATUS.PENDING,
              payment: order.paymentMethod || order.payment || 'COD',
              date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-BD', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : new Date().toLocaleDateString('en-BD', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }),
              trackingNumber: order.trackingNumber || null,
              totalItems: 0,
              name: 'Order #' + order._id.slice(-6),
              price: order.total || 0,
              quantity: 1,
              image: ['/placeholder-image.png'],
              size: 'N/A',
              orderItemIndex: 0,
              orderDate: order.createdAt || order.date || new Date().toISOString(),
            });
          }
        });

        allOrdersItemized.sort((a, b) => {
          return new Date(b.orderDate) - new Date(a.orderDate);
        });

        setTotalSpent(totalSpentAmount);
        setOrderData(allOrdersItemized);
        setFilteredOrders(allOrdersItemized);
        setCurrentPage(1);
      } else {
        throw new Error(response.data.message || 'Failed to load orders');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return;
      }

      if (!isMounted.current) return;

      console.error('❌ Orders fetch error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to load your orders';
      
      setError(errorMessage);
      
      if (error.response?.status === 401) {
        setOrderData([]);
        setFilteredOrders([]);
        toast.error('Please login to view your orders');
      } else if (error.response?.status === 404) {
        setError('Order service not available. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [backendUrl, token, isAuthenticated]);

  const applyFilters = useCallback(() => {
    let filtered = [...orderData];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orderData, statusFilter]);

  const handleTrackOrder = useCallback((orderId) => {
    setSelectedOrder(orderId);
  }, []);

  const handleReorder = useCallback((item) => {
    toast.success(`Adding ${item.name} to cart...`);
    // Add to cart logic here
  }, []);

  const handleRetry = useCallback(() => {
    loadOrderData(true);
  }, [loadOrderData]);

  const handleRefresh = useCallback(() => {
    loadOrderData(false);
  }, [loadOrderData]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // --- Effects ---
  useEffect(() => {
    isMounted.current = true;
    
    if (isAuthenticated) {
      loadOrderData(true);
    } else {
      setOrderData([]);
      setFilteredOrders([]);
      setIsLoading(false);
    }

    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isAuthenticated, loadOrderData]);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, applyFilters]);

  // ============================================================
  // Render Helpers
  // ============================================================
  const renderStatusFilters = useCallback(() => {
    if (!showFilters) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200
              ${statusFilter === status
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
              ${count === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={count === 0}
            aria-label={`Filter by ${status} (${count} items)`}
          >
            {status === 'all' ? 'All' : status}
            <span className="ml-1 text-xs opacity-70">({count})</span>
          </button>
        ))}
      </div>
    );
  }, [statusCounts, statusFilter, showFilters]);

  const renderPagination = useCallback(() => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          ←
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-400">…</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={`page-${page}`}
            onClick={() => handlePageChange(page)}
            className={`
              px-3 py-1 text-sm border rounded transition-colors
              ${currentPage === page
                ? 'bg-black text-white border-black'
                : 'hover:bg-gray-50'
              }
            `}
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
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          →
        </button>
      </div>
    );
  }, [currentPage, totalPages, handlePageChange]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`border-t pt-8 md:pt-16 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Title text1={titleText1} text2={titleText2} />
        
        <div className="flex items-center gap-4">
          {/* Order Stats */}
          {!isLoading && totalOrders > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                Total Orders: <span className="font-semibold text-gray-900">{totalOrders}</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">
                Total Spent: <span className="font-semibold text-gray-900">{currency}{totalSpent.toLocaleString()}</span>
              </span>
            </div>
          )}

          {/* Refresh Button */}
          {isAuthenticated && !isLoading && totalOrders > 0 && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Refresh orders"
            >
              {isRefreshing ? '⟳' : '↻'}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {!isLoading && orderData.length > 0 && renderStatusFilters()}

      {/* Orders List */}
      <div className="mt-6">
        {!isAuthenticated ? (
          <EmptyState statusFilter={statusFilter} isAuthenticated={false} />
        ) : isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <OrderSkeleton key={`skeleton-${index}`} />
          ))
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-block bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
              <button
                onClick={handleRetry}
                className="mt-4 text-sm text-red-600 hover:text-red-800 underline transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        ) : paginatedOrders.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
            {paginatedOrders.map((item, index) => {
              const uniqueKey = generateUniqueKey(item, index);
              return (
                <OrderItem
                  key={uniqueKey}
                  item={item}
                  currency={currency}
                  onTrackOrder={handleTrackOrder}
                  onReorder={handleReorder}
                  uniqueKey={uniqueKey}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState statusFilter={statusFilter} isAuthenticated={true} />
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && paginatedOrders.length > 0 && renderPagination()}

      {/* Track Order Modal */}
      <TrackOrderModal 
        orderId={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Orders;