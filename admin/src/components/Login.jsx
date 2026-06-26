import React, { useState } from 'react';
import { backendUrl } from '../App';
import axios from 'axios';

const Login = ({ setToken }) => {
  // 1. Form state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2. Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation check
    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      // 💡 FIXED: Cleaned up the Axios POST argument syntax
      // const response = await axios.post(`${backendUrl}/api/user/login`, { 
      //   email: email.trim(), 
      //   password 
      // });

      // Inside Login.jsx
      const response = await axios.post(`${backendUrl}/api/user/admin`, { 
        email: email.trim(), 
        password 
      });

      if (response.data.success) {
        // PERF ENHANCEMENT: Clean space tokens before cache insertion 
        const receivedToken = (response.data.token || '').trim();

        // Save token to persistent device memory cache
        localStorage.setItem('token', receivedToken);
        
        // Trigger context update to switch viewport layouts instantly
        setToken(receivedToken);
      } else {
        setError(response.data.message || 'Login failed. Please check your admin credentials.');
      }
    } catch (err) {
      console.error("Login Form Submission Error:", err);
      setError(
        err.response?.data?.message || 
        'Unable to reach administration gateway server. Ensure your Node terminal is active on port 4000.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4'>
      <div className='bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100'>
        
        <div className='text-center mb-6'>
          <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>Nexus<span className='text-blue-600'>BD</span></h1>
          <p className='text-gray-500 text-sm mt-1.5'>Please sign in to access your administrative workspace.</p>
        </div>

        {/* Dynamic Context Error Alert Banner */}
        {error && (
          <div className='bg-red-50 text-red-700 text-sm p-3.5 rounded-lg border border-red-200 mb-5 font-semibold transition-all'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address Column Input Group */}
          <div>
            <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5' htmlFor='email'>
              Admin Email Address
            </label>
            <input
              className='w-full border rounded-lg py-2.5 px-3.5 text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='admin@nexusbd.com'
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Secure Access Token Key Password Input Group */}
          <div>
            <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5' htmlFor='password'>
              Management Password
            </label>
            <input
              className='w-full border rounded-lg py-2.5 px-3.5 text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {/* Core Submission Trigger Action Component Button */}
          <button
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all focus:outline-none text-xs uppercase tracking-wider shadow-sm mt-2 active:scale-[0.99] ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type='submit'
            disabled={loading}
          >
            {loading ? 'Validating credentials...' : 'Enter Admin Panel'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;