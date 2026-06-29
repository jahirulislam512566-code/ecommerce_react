// admin/src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdminLogin from './components/AdminLogin';

// Pages
import Add from './pages/Add';
import List from './pages/List';
import Orders from './pages/Orders';
import Dashboard from './pages/Dashboard';

// Context - ✅ Use the local ShopContext
import { ShopContextProvider } from './context/ShopContext';

export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// ============================================================
// Protected Route Component
// ============================================================
const ProtectedRoute = ({ children, token }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token || token === 'undefined' || token === 'null') {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }

  return children;
};

// ============================================================
// Main Admin App Component
// ============================================================
const AdminApp = () => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken || savedToken === "undefined" || savedToken === "null") {
      return '';
    }
    return savedToken;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.role === 'admin';
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (token && token !== "undefined" && token !== "null") {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
  }, [token]);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsAdmin(user.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);

  // If no token, show login page
  if (!token || token === "" || token === "undefined" || token === "null") {
    return (
      <div className='min-h-screen bg-gray-50 text-gray-800 antialiased'>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="light" 
        />
        <AdminLogin setToken={setToken} setIsAdmin={setIsAdmin} />
      </div>
    );
  }

  // If token exists, show admin panel
  return (
    <ShopContextProvider>
      <div className='min-h-screen bg-gray-50 text-gray-800 antialiased'>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="light" 
        />
        
        <Navbar setToken={setToken} /> 
        
        <div className='flex w-full min-h-[calc(100vh-65px)]'>
          {/* Desktop Sidebar */}
          <div className='hidden sm:block w-16 sm:w-64 flex-shrink-0 bg-white border-r border-gray-100'>
            <Sidebar setToken={setToken} />
          </div>

          {/* Mobile Sidebar Toggle */}
          <div className='sm:hidden fixed bottom-4 left-4 z-50'>
            <button 
              onClick={() => document.getElementById('mobile-sidebar').classList.toggle('hidden')}
              className='bg-black text-white p-3 rounded-full shadow-lg'
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Sidebar */}
          <div id='mobile-sidebar' className='sm:hidden fixed inset-0 z-40 hidden'>
            <div className='absolute inset-0 bg-black/50' onClick={() => document.getElementById('mobile-sidebar').classList.add('hidden')} />
            <div className='absolute left-0 top-0 h-full w-64 bg-white shadow-xl'>
              <Sidebar setToken={setToken} />
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-grow p-4 md:p-8 bg-gray-50/50 overflow-x-hidden'>
            <Routes>
              <Route 
                path='/' 
                element={
                  <ProtectedRoute token={token}>
                    <Dashboard token={token} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/dashboard' 
                element={
                  <ProtectedRoute token={token}>
                    <Dashboard token={token} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/add' 
                element={
                  <ProtectedRoute token={token}>
                    <Add token={token} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/list' 
                element={
                  <ProtectedRoute token={token}>
                    <List token={token} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/orders' 
                element={
                  <ProtectedRoute token={token}>
                    <Orders token={token} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='*' 
                element={<Navigate to='/' replace />} 
              />
            </Routes>
          </div>
        </div>
      </div>
    </ShopContextProvider>
  );
};

export default AdminApp;