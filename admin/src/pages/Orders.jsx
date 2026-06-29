// admin/src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = ({ token }) => { 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const getToken = () => {
    return token || localStorage.getItem('token') || '';
  };

  const api = axios.create({
    baseURL: backendUrl,
    headers: {
      'Content-Type': 'application/json',
    }
  });

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

  const fetchAllOrders = async () => {
    const authToken = getToken();
    
    if (!authToken) {
      setLoading(false);
      setError('Authentication required. Please login.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.get('/api/order/list');

      if (response.data.success) {
        setOrders(response.data.orders || response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch orders.');
      }
    } catch (err) {
      console.error("Order Fetch Error:", err);
      
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
          'Unable to reach order services. Please ensure the backend server is running on port 4000.'
        );
      }
      
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = [...orders];

    if (filter !== 'all') {
      filtered = filtered.filter(order => 
        order.status?.toLowerCase() === filter.toLowerCase()
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const orderId = order._id?.toLowerCase() || '';
        const firstName = order.address?.firstName?.toLowerCase() || '';
        const lastName = order.address?.lastName?.toLowerCase() || '';
        const email = order.address?.email?.toLowerCase() || '';
        return orderId.includes(term) || 
               firstName.includes(term) || 
               lastName.includes(term) || 
               email.includes(term);
      });
    }

    return filtered;
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const filteredOrders = getFilteredOrders();

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'processing': 'bg-blue-100 text-blue-700',
      'shipped': 'bg-purple-100 text-purple-700',
      'delivered': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
      'refunded': 'bg-gray-100 text-gray-700'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'pending': '⏳',
      'processing': '⚙️',
      'shipped': '🚚',
      'delivered': '✅',
      'cancelled': '❌',
      'refunded': '↩️'
    };
    return iconMap[status?.toLowerCase()] || '📦';
  };

  return (
    <div className='bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100'>
      <div className="mb-6">
        <h1 className='text-2xl font-black text-gray-900 tracking-tight'>📦 Order Management</h1>
        <p className='text-gray-500 text-sm mt-0.5'>
          Review client orders, tracking codes, and operational fulfillment logs.
        </p>
      </div>

      {error && (
        <div className='p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg mb-5 text-sm font-semibold transition-all flex items-start gap-3'>
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

      {!loading && orders.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={fetchAllOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              ⟳ Refresh
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className='text-center py-12'>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-3"></div>
          <p className='text-gray-400 text-sm font-medium uppercase tracking-wide'>
            Loading orders...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className='text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50'>
          <div className="text-4xl mb-3">📭</div>
          <p className="font-semibold text-sm">No orders found.</p>
          <p className="text-xs text-gray-400 mt-1">
            When customers place orders on the frontend, they will appear here.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className='text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50'>
          <p className="font-semibold text-sm">No matching orders found.</p>
          <p className="text-xs text-gray-400 mt-1">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className='min-w-full bg-white text-left text-sm border-collapse'>
            <thead>
              <tr className='bg-gray-50/70 text-gray-500 uppercase font-bold text-[11px] tracking-widest border-b border-gray-100'>
                <th className='py-4 px-5'>Order ID</th>
                <th className='py-4 px-5'>Customer / Date</th>
                <th className='py-4 px-5'>Items</th>
                <th className='py-4 px-5'>Status</th>
                <th className='py-4 px-5 w-32'>Total</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 text-gray-700'>
              {filteredOrders.map((order, index) => {
                const itemsArray = Array.isArray(order.items) ? order.items : [];
                const totalItems = itemsArray.reduce((sum, item) => sum + (item.quantity || 0), 0);
                
                return (
                  <tr key={order._id || index} className='hover:bg-gray-50/60 transition-colors text-sm'>
                    <td className='py-4 px-5'>
                      <div className="font-mono text-xs text-gray-500 font-bold">
                        #{order._id ? order._id.substring(order._id.length - 8) : `ORD-${index + 1}`}
                      </div>
                    </td>
                    <td className='py-4 px-5'>
                      <div className="text-gray-900 font-medium">
                        {order.address?.firstName || 'Guest'} {order.address?.lastName || ''}
                      </div>
                      <div className='text-xs text-gray-400 font-normal mt-0.5'>
                        {order.address?.email || 'No email provided'}
                      </div>
                      <div className='text-xs text-gray-400 font-normal'>
                        📅 {formatDate(order.createdAt || order.date)}
                      </div>
                    </td>
                    <td className='py-4 px-5'>
                      <div className="text-gray-600">
                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {itemsArray.length} {itemsArray.length === 1 ? 'product' : 'products'}
                      </div>
                    </td>
                    <td className='py-4 px-5'>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className='py-4 px-5 font-black text-gray-900 tracking-tight'>
                      ${Number(order.totalAmount || order.amount || 0).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
          <span>
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
          <span>
            Total Revenue: <span className="font-bold text-gray-900">
              ${orders.reduce((sum, order) => sum + (order.totalAmount || order.amount || 0), 0).toLocaleString()}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

// ✅ Default export at the bottom
export default Orders;