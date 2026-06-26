import React from 'react';
import { Link, NavLink } from 'react-router-dom';

/**
 * @component Navbar
 * @description The Admin Navigation Header layout.
 */
const Navbar = ({ setToken }) => {

  // Helper for dashboard active styling states
  const navLinkStyles = ({ isActive }) => 
    `px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
      isActive 
        ? 'bg-blue-600 text-white shadow-sm' 
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  // Clear token state and local storage variables on logout trigger
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of the admin panel?")) {
      // 1. Kill persistent storage cache first
      localStorage.removeItem('token'); 
      
      /* 2. Trigger state flip in App.jsx layout.
         Your top-level App component will immediately detect that token === '' 
         and clean-mount the Login interface automatically. No manual 'navigate' needed! */
      setToken(''); 
    }
  };

  return (
    <nav className='bg-gray-900 text-white py-3.5 px-6 shadow-md border-b border-gray-800'>
      <div className='w-full flex justify-between items-center'>
        
        {/* Brand Management Logo Context Dashboard Home */}
        <Link to='/' className='text-xl font-black tracking-wider flex items-center gap-1.5 hover:opacity-90 transition-opacity'>
          NEXUS<span className='text-blue-500'>BD</span>
          <span className='text-[10px] uppercase tracking-widest font-bold bg-gray-800 text-blue-400 px-2 py-0.5 rounded border border-gray-700'>
            Admin
          </span>
        </Link>

        {/* Dynamic Panel Routing Direct Link Buttons */}
        <div className='flex items-center space-x-2'>
          <NavLink to='/add' className={navLinkStyles}>
            Add Item
          </NavLink>
          
          <NavLink to='/list' className={navLinkStyles}>
            Product List
          </NavLink>

          <NavLink to='/orders' className={navLinkStyles}>
            Fulfill Orders
          </NavLink>
          
          {/* Vertical Separator line element block */}
          <div className='h-5 w-[1px] bg-gray-700 mx-2'></div>

          {/* Functional Logout Handler Button component */}
          <button 
            onClick={handleLogout}
            className='px-3.5 py-1.5 bg-red-600/90 text-white hover:bg-red-600 text-xs font-bold rounded-md transition-all uppercase tracking-wide active:scale-95 shadow-sm'
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;