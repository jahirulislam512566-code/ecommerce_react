import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';

/**
 * @component Orders
 * @description Administrative dashboard component to view and manage client orders catalog.
 */
const Orders = ({ token }) => { 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPath = "/api/order/list";

  // 1. Synchronize live placement values from backend service
  const fetchAllOrders = async () => {
    // 💡 THE CRITICAL FIX: Block API request compilation if the auth token hasn't resolved from App.jsx yet
    if (!token) {
      setLoading(true);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${backendUrl}${fetchPath}`, {
        headers: { token }
      });

      if (response.data.success) {
        setOrders(response.data.orders || response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to parse transactional log states.');
      }
    } catch (err) {
      console.error("Order Fetch Error:", err);
      setError(
        err.response?.data?.message || 
        'Unable to reach transaction api services. Confirm server port 4000 is active.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 💡 FIXED: Monitor token mutations so that data renders automatically when state finishes loading
  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
      <div className="mb-6">
        <h1 className='text-2xl font-black text-gray-900 tracking-tight'>Incoming Management Orders</h1>
        <p className='text-gray-500 text-sm mt-0.5'>
          Review client settlement properties, tracking codes, and operational fulfillment logs.
        </p>
      </div>

      {error && (
        <div className='p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg mb-5 text-sm font-semibold transition-all'>
          {error}
        </div>
      )}

      {loading ? (
        <div className='text-center py-12 text-gray-400 text-sm font-bold tracking-wide animate-pulse uppercase'>
          Syncing order ledgers...
        </div>
      ) : orders.length === 0 ? (
        <div className='text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50'>
          <p className="font-semibold text-sm">No transactions found.</p>
          <p className="text-xs text-gray-400 mt-1">When customers place orders on the frontend, they will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className='min-w-full bg-white text-left text-sm border-collapse'>
            <thead>
              <tr className='bg-gray-50/70 text-gray-500 uppercase font-bold text-[11px] tracking-widest border-b border-gray-100'>
                <th className='py-4 px-5'>Order ID</th>
                <th className='py-4 px-5'>Customer/Date</th>
                <th className='py-4 px-5'>Items Value Count</th>
                <th className='py-4 px-5 w-32'>Total Revenue</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 text-gray-700'>
              {orders.map((order, index) => {
                const itemsArray = Array.isArray(order.items) ? order.items : [];
                
                return (
                  <tr key={order._id || index} className='hover:bg-gray-50/60 transition-colors text-sm font-medium'>
                    <td className='py-4 px-5 font-mono text-xs text-gray-500 font-bold uppercase'>
                      #{order._id ? order._id.substring(order._id.length - 8) : index + 1}
                    </td>
                    <td className='py-4 px-5 text-gray-900'>
                      <div>{order.address?.firstName || 'Guest'} {order.address?.lastName || 'Buyer'}</div>
                      <div className='text-xs text-gray-400 font-normal mt-0.5'>
                        {order.date ? new Date(order.date).toLocaleDateString() : 'Recent Session'}
                      </div>
                    </td>
                    <td className='py-4 px-5 text-gray-500 font-semibold'>
                      {itemsArray.length} Units Specified
                    </td>
                    <td className='py-4 px-5 font-black text-gray-900 tracking-tight'>
                      ${Number(order.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;