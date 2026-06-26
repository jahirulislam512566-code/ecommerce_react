import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useShop } from '../context/ShopContext';

// ============================================================
// Constants
// ============================================================
const AUTH_MODES = {
  LOGIN: 'Login',
  SIGNUP: 'Sign Up',
  FORGOT_PASSWORD: 'Forgot Password',
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// ============================================================
// PasswordStrength Component
// ============================================================
const PasswordStrength = ({ password }) => {
  const getStrength = useCallback(() => {
    if (!password) return { score: 0, label: 'Empty', color: 'bg-gray-200' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;
    
    const strengths = [
      { score: 0, label: 'Weak', color: 'bg-red-500' },
      { score: 2, label: 'Fair', color: 'bg-orange-500' },
      { score: 3, label: 'Good', color: 'bg-yellow-500' },
      { score: 4, label: 'Strong', color: 'bg-green-500' },
      { score: 5, label: 'Very Strong', color: 'bg-emerald-600' },
    ];
    
    return strengths.find(s => score <= s.score + 1) || strengths[strengths.length - 1];
  }, [password]);

  const strength = getStrength();

  if (!password) return null;

  return (
    <div className="mt-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${
          strength.score <= 2 ? 'text-red-500' :
          strength.score <= 3 ? 'text-orange-500' :
          strength.score <= 4 ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {strength.label}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-0.5">
        {strength.score < 3 ? 'Use 8+ chars with letters, numbers & symbols' : 'Great password!'}
      </p>
    </div>
  );
};

// ============================================================
// InputField Component
// ============================================================
const InputField = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = true,
  disabled = false,
  autoComplete,
  icon,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full px-3 py-2.5 border rounded-lg outline-none transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:ring-2 focus:ring-black focus:border-black'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ============================================================
// Main Login Component
// ============================================================
export const Login = ({
  onSuccess,
  redirectTo = '/',
  showSocialLogin = true,
  showRememberMe = true,
  className = '',
}) => {
  // --- Hooks ---
  const navigate = useNavigate();
  const { token, setToken, isAuthenticated } = useShop(); // ✅ Use setToken directly
  const formRef = useRef(null);

  // --- State ---
  const [currentState, setCurrentState] = useState(AUTH_MODES.LOGIN);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // --- Memoized Backend URL ---
  const backendUrl = import.meta.env.VITE_BACKEND_URL || BACKEND_URL;

  // --- Effects ---
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // --- Handlers ---
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const { name, email, password, confirmPassword } = formData;

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Name validation for signup
    if (currentState === AUTH_MODES.SIGNUP) {
      if (!name) {
        newErrors.name = 'Name is required';
      } else if (name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
      if (password && password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, currentState]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const { name, email, password } = formData;
      const endpoint = currentState === AUTH_MODES.SIGNUP 
        ? '/api/user/register' 
        : '/api/user/login';
      
      const payload = currentState === AUTH_MODES.SIGNUP
        ? { name: name.trim(), email: email.toLowerCase().trim(), password }
        : { email: email.toLowerCase().trim(), password };

      const response = await axios.post(`${backendUrl}${endpoint}`, payload, {
        timeout: 15000,
      });

      if (response.data.success) {
        const { token: responseToken, user } = response.data;

        // ✅ Save token using setToken from context
        if (responseToken) {
          localStorage.setItem('token', responseToken);
          setToken(responseToken); // ✅ Now this works because setToken is exposed
        }

        // Save user data
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Remember email
        if (rememberMe && email) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Show success message
        const message = currentState === AUTH_MODES.SIGNUP
          ? 'Account created successfully! Welcome aboard 🎉'
          : 'Welcome back! 🎉';
        toast.success(message);

        // Call onSuccess callback
        if (onSuccess) {
          onSuccess({ token: responseToken, user });
        }

        // Navigate to redirectTo
        navigate(redirectTo);
      } else {
        throw new Error(response.data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication Error:', error);
      
      let errorMessage = error.response?.data?.message || error.message;
      
      // User-friendly error messages
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, currentState, backendUrl, setToken, rememberMe, onSuccess, navigate, redirectTo, validateForm]);

  const handleForgotPassword = useCallback(async () => {
    const email = formData.email;
    if (!email) {
      toast.warning('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warning('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/forgot-password`, {
        email: email.toLowerCase().trim(),
      });

      if (response.data.success) {
        toast.success('Password reset link sent to your email!');
        setCurrentState(AUTH_MODES.LOGIN);
      } else {
        throw new Error(response.data.message || 'Failed to send reset link');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, backendUrl]);

  const toggleState = useCallback((state) => {
    setCurrentState(state);
    setErrors({});
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
  }, []);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`min-h-[70vh] flex items-center justify-center py-12 ${className}`}>
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {currentState === AUTH_MODES.LOGIN && 'Welcome Back'}
              {currentState === AUTH_MODES.SIGNUP && 'Create Account'}
              {currentState === AUTH_MODES.FORGOT_PASSWORD && 'Reset Password'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {currentState === AUTH_MODES.LOGIN && 'Sign in to continue shopping'}
              {currentState === AUTH_MODES.SIGNUP && 'Join our community of fashion lovers'}
              {currentState === AUTH_MODES.FORGOT_PASSWORD && 'We\'ll send you a reset link'}
            </p>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Signup only) */}
            {currentState === AUTH_MODES.SIGNUP && (
              <InputField
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                icon="👤"
                error={errors.name}
                disabled={isLoading}
                autoComplete="name"
              />
            )}

            {/* Email Field */}
            <InputField
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              icon="✉️"
              error={errors.email}
              disabled={isLoading}
              autoComplete="email"
            />

            {/* Password Field */}
            <div className="relative">
              <InputField
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                icon="🔒"
                error={errors.password}
                disabled={isLoading}
                autoComplete={currentState === AUTH_MODES.SIGNUP ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Password Strength (Signup only) */}
            {currentState === AUTH_MODES.SIGNUP && (
              <PasswordStrength password={formData.password} />
            )}

            {/* Confirm Password (Signup only) */}
            {currentState === AUTH_MODES.SIGNUP && (
              <InputField
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                icon="✓"
                error={errors.confirmPassword}
                disabled={isLoading}
                autoComplete="new-password"
              />
            )}

            {/* Remember Me & Forgot Password */}
            {currentState === AUTH_MODES.LOGIN && (
              <div className="flex items-center justify-between text-sm">
                {showRememberMe && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => toggleState(AUTH_MODES.FORGOT_PASSWORD)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Forgot Password Actions */}
            {currentState === AUTH_MODES.FORGOT_PASSWORD && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => toggleState(AUTH_MODES.LOGIN)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            )}

            {/* Submit Button */}
            {currentState !== AUTH_MODES.FORGOT_PASSWORD && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {currentState === AUTH_MODES.LOGIN ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  currentState === AUTH_MODES.LOGIN ? 'Sign In' : 'Create Account'
                )}
              </button>
            )}
          </form>

          {/* Divider */}
          {showSocialLogin && currentState !== AUTH_MODES.FORGOT_PASSWORD && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400">or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  <span>🔵</span> Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  <span>🐦</span> Twitter
                </button>
              </div>
            </div>
          )}

          {/* Toggle Auth Mode */}
          {currentState !== AUTH_MODES.FORGOT_PASSWORD && (
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">
                {currentState === AUTH_MODES.LOGIN 
                  ? "Don't have an account? " 
                  : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => toggleState(
                  currentState === AUTH_MODES.LOGIN 
                    ? AUTH_MODES.SIGNUP 
                    : AUTH_MODES.LOGIN
                )}
                className="text-black font-medium hover:underline transition-colors"
              >
                {currentState === AUTH_MODES.LOGIN ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          )}

          {/* Terms & Privacy */}
          {currentState === AUTH_MODES.SIGNUP && (
            <p className="mt-4 text-xs text-center text-gray-400">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-gray-600 hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-gray-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Login;