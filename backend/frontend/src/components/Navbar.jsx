import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { assets } from "../assets/assets";
import { useShop } from "../context/ShopContext";
import { toast } from 'react-toastify';

// ============================================================
// Navigation Configuration
// ============================================================
const NAV_ITEMS = [
  { label: 'HOME', path: '/', icon: '🏠' },
  { label: 'COLLECTION', path: '/collection', icon: '👗' },
  { label: 'ABOUT', path: '/about', icon: 'ℹ️' },
  { label: 'CONTACT', path: '/contact', icon: '📞' },
];

const MOBILE_BREAKPOINT = 640;
const SCROLL_THRESHOLD = 10;

// ============================================================
// Navbar Component
// ============================================================
export const Navbar = () => {
  // --- Hooks ---
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  const { 
    setShowSearchBar, 
    getCartTotalItems, 
    isAuthenticated, 
    logout,
    user,
    currency,
  } = useShop();

  // --- Memoized Values ---
  const cartCount = useMemo(() => {
    try {
      const count = getCartTotalItems();
      return count > 0 ? count : null;
    } catch {
      return null;
    }
  }, [getCartTotalItems]);

  const userInitials = useMemo(() => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  // --- Handlers ---
  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen(prev => !prev);
    setShowSearchBar(prev => !prev);
    if (!isSearchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [setShowSearchBar, isSearchOpen]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setShowSearchBar(false);
      setSearchQuery('');
    }
  }, [searchQuery, setShowSearchBar, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
      setIsMobileMenuOpen(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  }, [logout]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleProfileDropdownToggle = useCallback(() => {
    setIsProfileDropdownOpen(prev => !prev);
  }, []);

  const handleClickOutside = useCallback((e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsProfileDropdownOpen(false);
    }
  }, []);

  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setShowSearchBar(false);
      setIsProfileDropdownOpen(false);
      setIsMobileMenuOpen(false);
    }
  }, [setShowSearchBar]);

  // --- Effects ---
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside for dropdown
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Handle escape key
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [handleEscapeKey]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= MOBILE_BREAKPOINT && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = '';
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // --- Render Helpers ---
  const getNavLinkClass = useCallback(({ isActive }) => 
    `flex flex-col items-center gap-1 transition-all duration-300 relative group ${
      isActive ? 'text-black font-semibold' : 'text-gray-600 hover:text-black'
    }`,
    []
  );

  const getMobileNavLinkClass = useCallback(({ isActive }) => 
    `py-4 pl-10 border-b border-gray-50 text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
      isActive 
        ? 'text-black bg-gray-50 border-l-4 border-black' 
        : 'text-gray-600 hover:bg-gray-50 hover:pl-12'
    }`,
    []
  );

  // ============================================================
  // Component JSX
  // ============================================================
  return (
    <>
      <nav 
        className={`
          sticky top-0 z-50 transition-all duration-300 border-b border-gray-100
          ${isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-white/90 backdrop-blur-sm'
          }
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4 lg:px-8">
          
          {/* ===== Logo ===== */}
          <Link 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 flex-shrink-0"
            aria-label="Homepage"
          >
            <img 
              src={assets.logo} 
              className="w-24 sm:w-28 md:w-36 h-auto" 
              alt="Brand Logo" 
              loading="lazy"
            />
          </Link>

          {/* ===== Desktop Navigation ===== */}
          <ul className="hidden sm:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            {NAV_ITEMS.map(({ label, path }) => (
              <li key={label}>
                <NavLink 
                  to={path} 
                  className={getNavLinkClass}
                  aria-current="page"
                >
                  <span className="tracking-wide uppercase">{label}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full" />
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ===== Right Side Actions ===== */}
          <div className="flex items-center gap-3 md:gap-5">
            
            {/* Search Button */}
            <button
              onClick={handleSearchToggle}
              className="p-1.5 hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-black/20 rounded-full"
              aria-label={isSearchOpen ? 'Close search' : 'Open search'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSearchOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                )}
              </svg>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleProfileDropdownToggle}
                className="flex items-center gap-2 p-1 hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-black/20 rounded-full"
                aria-label="User profile"
                aria-expanded={isProfileDropdownOpen}
                aria-haspopup="true"
              >
                {isAuthenticated && user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    alt={user.name || 'User avatar'}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : isAuthenticated ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-black to-gray-700 text-white flex items-center justify-center text-xs font-medium">
                    {userInitials}
                  </div>
                ) : (
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-3 w-64 py-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-20 animate-slideDown"
                  role="menu"
                  aria-label="User menu"
                >
                  {isAuthenticated ? (
                    <>
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {user?.avatar ? (
                            <img 
                              src={user.avatar} 
                              className="w-10 h-10 rounded-full object-cover"
                              alt={user.name}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-black to-gray-700 text-white flex items-center justify-center text-sm font-medium">
                              {userInitials}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                        role="menuitem"
                      >
                        <span className="text-lg" aria-hidden="true">👤</span>
                        My Profile
                      </Link>
                      
                      <Link
                        to="/orders"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                        role="menuitem"
                      >
                        <span className="text-lg" aria-hidden="true">📦</span>
                        My Orders
                      </Link>
                      
                      <Link
                        to="/wishlist"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                        role="menuitem"
                      >
                        <span className="text-lg" aria-hidden="true">❤️</span>
                        Wishlist
                      </Link>
                      
                      <hr className="my-1 border-gray-100" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        role="menuitem"
                      >
                        <span className="text-lg" aria-hidden="true">🚪</span>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                        role="menuitem"
                      >
                        <span className="text-lg" aria-hidden="true">🔑</span>
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                        role="menuitem"
                      >
                        <span className="text-lg" aria-hidden="true">📝</span>
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart Button */}
            <Link 
              to="/cart" 
              className="relative p-1 hover:scale-110 transition-transform duration-200 group"
              aria-label={`Shopping cart ${cartCount ? `(${cartCount} items)` : ''}`}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              
              {/* Cart Badge */}
              {cartCount && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-black text-white text-[10px] font-bold rounded-full shadow-lg animate-bounceIn">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={handleMobileMenuToggle}
              className="sm:hidden p-1.5 hover:opacity-70 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-black/20 rounded"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`block h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* ===== Search Bar ===== */}
        <div 
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isSearchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="container mx-auto px-4 pb-4">
            <form onSubmit={handleSearchSubmit} className="relative" role="search">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full py-3 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                aria-label="Search products"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Submit search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* ===== Mobile Sidebar ===== */}
      <>
        {/* Backdrop overlay */}
        <div 
          className={`
            sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300
            ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={handleMobileMenuClose}
          aria-hidden="true"
        />

        {/* Sidebar panel */}
        <div 
          id="mobile-menu"
          ref={mobileMenuRef}
          className={`
            sm:hidden fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 
            transition-transform duration-300 ease-in-out shadow-2xl
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
              <Link to="/" onClick={handleMobileMenuClose} className="flex-shrink-0">
                <img src={assets.logo} className="h-8 w-auto" alt="Logo" />
              </Link>
              <button
                onClick={handleMobileMenuClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            {isAuthenticated && (
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      className="w-10 h-10 rounded-full object-cover"
                      alt={user.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-black to-gray-700 text-white flex items-center justify-center text-sm font-medium">
                      {userInitials}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || ''}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-2">
              {NAV_ITEMS.map(({ label, path, icon }) => (
                <NavLink
                  key={label}
                  to={path}
                  onClick={handleMobileMenuClose}
                  className={getMobileNavLinkClass}
                  aria-current="page"
                >
                  <span className="text-lg" aria-hidden="true">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={handleMobileMenuClose}
                    className="block w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleMobileMenuClose}
                    className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-center"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </>

      {/* ===== Styles ===== */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out forwards;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
};

// Default export
export default Navbar;