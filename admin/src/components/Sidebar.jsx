// admin/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useShop } from '../context/ShopContext'; // ✅ Fixed path

const Sidebar = ({ setToken }) => {
  const { user } = useShop();

  const navLinkStyles = ({ isActive }) => 
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
      isActive 
        ? 'bg-blue-50 text-blue-600 font-medium' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setToken('');
    }
  };

  return (
    <div className="h-full flex flex-col py-4">
      <div className="flex-1 px-3 space-y-1">
        <NavLink to="/dashboard" className={navLinkStyles}>
          <span className="text-xl">📊</span>
          <span className="hidden sm:inline text-sm">Dashboard</span>
        </NavLink>
        
        <NavLink to="/add" className={navLinkStyles}>
          <span className="text-xl">➕</span>
          <span className="hidden sm:inline text-sm">Add Product</span>
        </NavLink>
        
        <NavLink to="/list" className={navLinkStyles}>
          <span className="text-xl">📋</span>
          <span className="hidden sm:inline text-sm">Product List</span>
        </NavLink>
        
        <NavLink to="/orders" className={navLinkStyles}>
          <span className="text-xl">📦</span>
          <span className="hidden sm:inline text-sm">Orders</span>
        </NavLink>
      </div>

      <div className="px-3 mt-auto border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400">{user?.email || 'admin@example.com'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all text-center"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;