import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar' 
import Login from './components/Login'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import { Routes, Route } from 'react-router-dom' 
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const backendUrl = import.meta.env.VITE_BACKEND_URL

const App = () => {
  // 💡 FIXED: Strict string checks to prevent "undefined" or "null" string injection leaks
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken || savedToken === "undefined" || savedToken === "null") {
      return '';
    }
    return savedToken;
  });
  
  // Synchronize state with localStorage when token changes
  useEffect(() => {
    if (token && token !== "undefined" && token !== "null") {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <div className='min-h-screen bg-gray-50 text-gray-800 antialiased'> 
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" /> 
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} /> 
          
          <div className='flex w-full min-h-[calc(100vh-65px)]'>
            <div className='w-16 sm:w-64 flex-shrink-0 bg-white border-r border-gray-100'>
              <Sidebar setToken={setToken} />
            </div>

            <div className='flex-grow p-6 md:p-8 bg-gray-50/50'>
              <Routes>
                <Route path='/' element={<List token={token} />} /> 
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App;