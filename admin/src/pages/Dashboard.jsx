// admin/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

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
      console.log('📤 Request:', config.method.toUpperCase(), config.url);
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ✅ Handle response errors
  api.interceptors.response.use(
    (response) => {
      console.log('📥 Response:', response.status, response.config.url);
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        console.error('🔒 Unauthorized - Redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/admin/login';
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ✅ Check if token exists
      const authToken = getToken();
      if (!authToken) {
        console.warn('No token found, redirecting to login');
        window.location.href = '/admin/login';
        return;
      }

      console.log('🔑 Token found:', authToken.substring(0, 20) + '...');
      
      // Fetch products
      const productsRes = await api.get('/api/product');
      console.log('Products response:', productsRes.data);
      
      // Fetch orders
      const ordersRes = await api.get('/api/order/list');
      console.log('Orders response:', ordersRes.data);

      const products = productsRes.data.products || [];
      const orders = ordersRes.data.orders || [];

      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const recentOrders = orders.slice(0, 5);
      const lowStockProducts = products.filter(p => p.stock < 5 && p.stock > 0);

      setStats({
        totalProducts,
        totalOrders,
        totalUsers: 0,
        totalRevenue,
        recentOrders,
        lowStockProducts
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/admin/login';
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component remains the same
  const StatCard = ({ title, value, icon, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loading ? (
              <span className="inline-block w-12 h-8 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              value.toLocaleString()
            )}
          </p>
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const RecentOrdersTable = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Recent Orders</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                </tr>
              ))
            ) : stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order._id?.slice(-6) || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.address?.firstName || 'N/A'} {order.address?.lastName || ''}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${order.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const LowStockAlert = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Low Stock Alert</h3>
        <Link to="/list" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
          View All
        </Link>
      </div>
      <div className="p-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className="w-10 h-10 bg-gray-200 animate-pulse rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div>
                <div className="h-3 bg-gray-200 animate-pulse rounded w-20 mt-1"></div>
              </div>
              <div className="h-6 bg-gray-200 animate-pulse rounded w-16"></div>
            </div>
          ))
        ) : stats.lowStockProducts.length > 0 ? (
          stats.lowStockProducts.map((product) => (
            <div key={product._id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
              <img 
                src={Array.isArray(product.image) ? product.image[0] : product.image || '/placeholder-image.png'} 
                alt={product.name}
                className="w-10 h-10 object-cover rounded-lg"
                onError={(e) => e.target.src = '/placeholder-image.png'}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">{product.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-4">All products are well stocked ✅</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats.totalProducts} icon="📦" color="blue" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon="📋" color="green" />
        <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="purple" />
        <StatCard title="Total Revenue" value={stats.totalRevenue} icon="💰" color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable />
        </div>
        <div className="lg:col-span-1">
          <LowStockAlert />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/add" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-2xl">➕</span>
            <span className="text-sm font-medium text-gray-700">Add Product</span>
          </Link>
          <Link to="/list" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-2xl">📋</span>
            <span className="text-sm font-medium text-gray-700">Product List</span>
          </Link>
          <Link to="/orders" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-2xl">📦</span>
            <span className="text-sm font-medium text-gray-700">View Orders</span>
          </Link>
          <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-2xl">🏠</span>
            <span className="text-sm font-medium text-gray-700">Go to Store</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;