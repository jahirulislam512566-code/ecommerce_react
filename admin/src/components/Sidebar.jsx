import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListOrdered, 
  ShoppingBag, 
  LogOut 
} from 'lucide-react'; 

/**
 * @component Sidebar
 * @description Provides primary navigation links for the Admin Panel.
 */
const Sidebar = ({ setToken }) => {
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Add Items', path: '/add', icon: <PlusCircle size={20} /> },
    { name: 'List Items', path: '/list', icon: <ListOrdered size={20} /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingBag size={20} /> },
  ];

  // Professional logout function that avoids unmounted state updates
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of the admin panel?")) {
      // 1. Kill persistent storage cache first
      localStorage.removeItem('token');
      
      /* 2. Trigger state flip in App.jsx layout.
         Your top-level App component automatically handles the view cleanup.
         Removing manual navigate handles unmount race-conditions perfectly! */
      setToken(''); 
    }
  };

  return (
    <div className="h-full min-h-screen bg-white flex flex-col justify-between border-r border-gray-100">
      
      {/* Navigation Links Group Wrapper */}
      <div className="flex flex-col gap-1.5 pt-6 pl-4 pr-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                /* BRAND COLOR REFRESH: Swapped red themes for your core brand blue 
                   accent to unify layout style with Navbar header properties */
                isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            <span className="hidden sm:block">{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer Actions (Logout Section Container) */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut size={18} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;