import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Title } from '../components/Title';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

// ============================================================
// OrderItem Component
// ============================================================
const OrderItem = ({ item, currency, onTrackOrder, onReorder, uniqueKey }) => {
  const getStatusColor = useCallback((status) => {
    return STATUS_COLORS[status] || 'bg-gray-400';
  }, []);

  const getStatusLabel = useCallback((status) => {
    return STATUS_LABELS[status] || status;
  }, []);

  return (
    <div 
      key={uniqueKey} 
      className="py-4 border-t first:border-t-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Product Info */}
        <div className="flex items-start gap-4 sm:gap-6 text-sm">
          <div className="flex-shrink-0">
            <img
              className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-lg border border-gray-100"
              src={Array.isArray(item.image) ? item.image[0] : (item.image || '/placeholder-image.png')}
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
              <p>Date: <span className="text-gray-700 font-medium">{item.date || 'N/A'}</span></p>
              <p>Payment: <span className="text-gray-700 font-medium uppercase">{item.payment || 'COD'}</span></p>
              {item.trackingNumber && (
                <p>Tracking: <span className="text-gray-700 font-medium">{item.trackingNumber}</span></p>
              )}
            </div>

            {/* Order Items Summary (if multiple items) */}
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
            <span className="text-sm font-medium capitalize text-gray-700">
              {getStatusLabel(item.status)}
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
};

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
// Main Orders Component
// ============================================================
export const Orders = ({
  titleText1 = 'MY',
  titleText2 = 'ORDERS',
  className = '',
  showFilters = true,
  itemsPerPage = 10,
}) => {
  // --- Hooks ---
  const { backendUrl, token, currency } = useShop();
  
  // --- State ---
  const [orderData, setOrderData] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
  const totalSpent = useMemo(() => {
    return orderData.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  }, [orderData]);

  // --- Generate Unique Key Helper ---
  const generateUniqueKey = useCallback((item, index) => {
    // Create a unique key combining multiple identifiers
    const orderId = item.orderId || item._id || 'unknown';
    const productId = item.productId || item._id || 'unknown';
    const size = item.size || 'nosize';
    const timestamp = item.date || Date.now();
    
    // Use a combination that's guaranteed to be unique
    return `${orderId}-${productId}-${size}-${index}-${timestamp}`;
  }, []);

  // --- Handlers ---
  const loadOrderData = useCallback(async () => {
    if (!token) {
      setOrderData([]);
      setFilteredOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { 
          headers: { 
            token,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      if (response.data.success) {
        const allOrdersItemized = [];
        
        // Process each order
        response.data.orders.forEach((order) => {
          // Ensure items array exists
          const items = order.items || [];
          
          // If order has items, flatten them
          if (items.length > 0) {
            items.forEach((item, itemIndex) => {
              allOrdersItemized.push({
                ...item,
                orderId: order._id,
                status: order.status || ORDER_STATUS.PENDING,
                payment: order.paymentMethod || order.payment || 'COD',
                date: order.date ? new Date(order.date).toLocaleDateString() : new Date().toLocaleDateString(),
                trackingNumber: order.trackingNumber || null,
                totalItems: items.length,
                // Add unique identifiers
                orderItemIndex: itemIndex,
                orderDate: order.date || new Date().toISOString(),
              });
            });
          } else {
            // Handle empty orders (shouldn't happen, but just in case)
            allOrdersItemized.push({
              orderId: order._id,
              status: order.status || ORDER_STATUS.PENDING,
              payment: order.paymentMethod || order.payment || 'COD',
              date: order.date ? new Date(order.date).toLocaleDateString() : new Date().toLocaleDateString(),
              trackingNumber: order.trackingNumber || null,
              totalItems: 0,
              name: 'Order #' + order._id.slice(-6),
              price: order.total || 0,
              quantity: 1,
              image: ['/placeholder-image.png'],
              size: 'N/A',
              orderItemIndex: 0,
              orderDate: order.date || new Date().toISOString(),
            });
          }
        });

        // Sort by date (newest first)
        allOrdersItemized.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        setOrderData(allOrdersItemized);
        setFilteredOrders(allOrdersItemized);
        setCurrentPage(1);
      } else {
        throw new Error(response.data.message || 'Failed to load orders');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load your orders';
      setError(errorMessage);
      console.error('Orders fetch error:', error);
      
      // If unauthorized, clear orders
      if (error.response?.status === 401) {
        setOrderData([]);
        setFilteredOrders([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, token]);

  const applyFilters = useCallback(() => {
    let filtered = [...orderData];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orderData, statusFilter]);

  const handleTrackOrder = useCallback((orderId) => {
    // Open tracking modal or navigate to tracking page
    setSelectedOrder(orderId);
    console.log(`[Analytics] Track order clicked: ${orderId}`);
  }, []);

  const handleReorder = useCallback((item) => {
    // Add item to cart
    console.log('[Analytics] Reorder clicked:', item);
  }, []);

  const handleRetry = useCallback(() => {
    loadOrderData();
  }, [loadOrderData]);

  // --- Effects ---
  useEffect(() => {
    loadOrderData();
  }, [loadOrderData]);

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
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          ←
        </button>

        {pages.map(page => (
          <button
            key={`page-${page}`}
            onClick={() => setCurrentPage(page)}
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
  }, [currentPage, totalPages]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`border-t pt-8 md:pt-16 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Title text1={titleText1} text2={titleText2} />
        
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
      </div>

      {/* Filters */}
      {!isLoading && orderData.length > 0 && renderStatusFilters()}

      {/* Orders List */}
      <div className="mt-6">
        {isLoading ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <OrderSkeleton key={`skeleton-${index}`} />
          ))
        ) : error ? (
          // Error state
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
          // Orders list
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
            {paginatedOrders.map((item, index) => {
              // Generate a truly unique key for each item
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
          // Empty state
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
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && paginatedOrders.length > 0 && renderPagination()}

      {/* Track Order Modal (Placeholder) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Track Order</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Order ID: <span className="font-medium text-gray-900">{selectedOrder}</span>
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                Order is being processed
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Orders;