// admin/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext'; // ✅ Fixed path: ../context/ShopContext

const Navbar = ({ setToken }) => {
  const location = useLocation();
  const { user } = useShop();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinkStyles = ({ isActive }) => 
    `px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
      isActive 
        ? 'bg-blue-600 text-white shadow-sm' 
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of the admin panel?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setToken(''); 
    }
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'A';
  };

  return (
    <nav className={`
      bg-gray-900 text-white py-2.5 px-4 md:px-6 shadow-md border-b border-gray-800
      sticky top-0 z-50 transition-all duration-300
      ${isScrolled ? 'shadow-xl backdrop-blur-sm bg-gray-900/95' : ''}
    `}>
      <div className='w-full flex justify-between items-center'>
        <div className="flex items-center gap-3">
          <Link to='/' className='text-lg sm:text-xl font-black tracking-wider flex items-center gap-1.5 hover:opacity-90 transition-opacity'>
            NEXUS<span className='text-blue-500'>BD</span>
            <span className='text-[8px] sm:text-[10px] uppercase tracking-widest font-bold bg-gray-800 text-blue-400 px-2 py-0.5 rounded border border-gray-700'>
              Admin
            </span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center space-x-2'>
          <NavLink to='/dashboard' className={navLinkStyles}>Dashboard</NavLink>
          <NavLink to='/add' className={navLinkStyles}>Add Item</NavLink>
          <NavLink to='/list' className={navLinkStyles}>Product List</NavLink>
          <NavLink to='/orders' className={navLinkStyles}>Orders</NavLink>
          
          <div className='h-5 w-[1px] bg-gray-700 mx-2'></div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {getUserInitials()}
            </div>
            <span className="text-xs text-gray-300 hidden lg:block">
              {user?.name || 'Admin'}
            </span>
          </div>

          <button 
            onClick={handleLogout}
            className='px-3.5 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-md transition-all uppercase tracking-wide active:scale-95 shadow-sm'
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`
        md:hidden transition-all duration-300 overflow-hidden
        ${isMobileMenuOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}
      `}>
        <div className='flex flex-col space-y-2 pb-3'>
          <NavLink to='/dashboard' className={({ isActive }) => 
            `px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }>Dashboard</NavLink>
          <NavLink to='/add' className={({ isActive }) => 
            `px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }>Add Item</NavLink>
          <NavLink to='/list' className={({ isActive }) => 
            `px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }>Product List</NavLink>
          <NavLink to='/orders' className={({ isActive }) => 
            `px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }>Orders</NavLink>

          <div className='border-t border-gray-700 my-2'></div>
          <button 
            onClick={handleLogout}
            className='px-4 py-2.5 bg-red-600/90 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all active:scale-95'
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;