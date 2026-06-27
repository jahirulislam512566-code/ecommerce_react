// src/components/Register.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useShop } from '../context/ShopContext';

// ============================================================
// Constants
// ============================================================
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const REGISTRATION_STEPS = {
  ACCOUNT: 'account',
  PROFILE: 'profile',
  VERIFY: 'verify',
};

const PASSWORD_REQUIREMENTS = [
  { id: 'minLength', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'lowercase', label: 'At least one lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'uppercase', label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'At least one number', test: (p) => /[0-9]/.test(p) },
  { id: 'symbol', label: 'At least one special character', test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

// ============================================================
// Sub-Components
// ============================================================

// Password Strength Indicator
const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = useCallback(() => {
    if (!password) return { score: 0, label: 'Empty', color: 'bg-gray-200', textColor: 'text-gray-400' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    const strengths = [
      { score: 0, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' },
      { score: 1, label: 'Weak', color: 'bg-red-400', textColor: 'text-red-400' },
      { score: 2, label: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-500' },
      { score: 3, label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
      { score: 4, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' },
      { score: 5, label: 'Very Strong', color: 'bg-emerald-600', textColor: 'text-emerald-600' },
    ];
    
    return strengths.find(s => s.score === score) || strengths[0];
  }, [password]);

  const strength = getStrength();
  const percentage = (strength.score / 5) * 100;

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${strength.color} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${strength.textColor} min-w-[70px] text-right`}>
          {strength.label}
        </span>
      </div>
    </div>
  );
};

// Password Requirements List
const PasswordRequirements = ({ password }) => {
  return (
    <div className="mt-2 space-y-1">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const isMet = req.test(password);
        return (
          <div key={req.id} className="flex items-center gap-2 text-xs">
            <span className={`transition-colors duration-300 ${isMet ? 'text-green-500' : 'text-gray-300'}`}>
              {isMet ? '✓' : '○'}
            </span>
            <span className={isMet ? 'text-green-600' : 'text-gray-400'}>
              {req.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Form Input Component
const FormInput = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  label,
  required = true,
  disabled = false,
  autoComplete,
  icon,
  error,
  className = '',
  ...props
}) => {
  const inputId = `input-${name}`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
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

// Step Indicator
const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isActive = index + 1 === currentStep;
        const isCompleted = index + 1 < currentStep;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                transition-all duration-300
                ${isActive 
                  ? 'bg-black text-white' 
                  : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }
              `}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className={`
                text-sm hidden sm:block
                ${isActive ? 'text-black font-medium' : 'text-gray-400'}
              `}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-12 h-0.5
                ${index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'}
              `} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================================
// Main Register Component
// ============================================================
export const Register = ({
  onSuccess,
  redirectTo = '/',
  showSocialLogin = true,
  className = '',
}) => {
  // --- Hooks ---
  const navigate = useNavigate();
  const { setToken, isAuthenticated } = useShop();
  const formRef = useRef(null);

  // --- State ---
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh',
  });
  const [errors, setErrors] = useState({});

  // --- Memoized Backend URL ---
  const backendUrl = import.meta.env.VITE_BACKEND_URL || BACKEND_URL;

  // --- Effects ---
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // --- Handlers ---
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleVerificationCodeChange = useCallback((index, value) => {
    const newCode = [...verificationCode];
    newCode[index] = value.slice(0, 1);
    setVerificationCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  }, [verificationCode]);

  const validateStep = useCallback((step) => {
    const newErrors = {};
    const { name, email, password, confirmPassword, phone, address, city, postalCode } = formData;

    if (step === 1) {
      // Account validation
      if (!name || name.trim().length < 2) {
        newErrors.name = 'Please enter your full name (minimum 2 characters)';
      }
      
      if (!email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[a-z]/.test(password)) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = 'Password must contain at least one number';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!agreeToTerms) {
        newErrors.terms = 'Please agree to the Terms of Service and Privacy Policy';
      }
    }

    if (step === 2) {
      // Profile validation
      if (!phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone)) {
        newErrors.phone = 'Please enter a valid Bangladesh phone number';
      }

      if (!address) {
        newErrors.address = 'Address is required';
      }

      if (!city) {
        newErrors.city = 'City is required';
      }

      if (!postalCode) {
        newErrors.postalCode = 'Postal code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, agreeToTerms]);

  const handleStepSubmit = useCallback(async (e) => {
    e?.preventDefault();

    if (!validateStep(currentStep)) {
      toast.warning('Please fix the errors before continuing');
      return;
    }

    if (currentStep === 1) {
      // Move to profile step
      setCurrentStep(2);
      toast.info('Great! Now tell us more about you');
      return;
    }

    if (currentStep === 2) {
      // Submit registration
      await handleRegistration();
    }
  }, [currentStep, validateStep]);

  const handleRegistration = useCallback(async () => {
    setIsLoading(true);

    try {
      const { name, email, password, phone, address, city, postalCode, country } = formData;
      
      const payload = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        profile: {
          phone,
          address: {
            street: address,
            city,
            postalCode,
            country,
          },
        },
        preferences: {
          newsletter: true,
          marketingEmails: true,
        },
        registeredAt: new Date().toISOString(),
      };

      const response = await axios.post(`${backendUrl}/api/user/register`, payload, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        const { token: responseToken, user, requiresVerification } = response.data;

        // If verification is required
        if (requiresVerification) {
          setCurrentStep(3);
          setResendTimer(60);
          toast.info('Please check your email for verification code');
          return;
        }

        // Auto-login if no verification required
        if (responseToken) {
          localStorage.setItem('token', responseToken);
          setToken(responseToken);
        }

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        toast.success('Account created successfully! Welcome aboard 🎉');

        if (onSuccess) {
          onSuccess({ token: responseToken, user });
        }

        navigate(redirectTo);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      
      let errorMessage = error.response?.data?.message || error.message;
      
      if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists. Please login instead.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Please check your information and try again.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, backendUrl, setToken, onSuccess, navigate, redirectTo]);

  const handleVerifyEmail = useCallback(async () => {
    const code = verificationCode.join('');
    
    if (code.length < 6) {
      toast.warning('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/user/verify`, {
        email: formData.email.toLowerCase().trim(),
        code,
      });

      if (response.data.success) {
        const { token: responseToken, user } = response.data;

        localStorage.setItem('token', responseToken);
        setToken(responseToken);

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        toast.success('Email verified successfully! Welcome aboard 🎉');

        if (onSuccess) {
          onSuccess({ token: responseToken, user });
        }

        navigate(redirectTo);
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, formData.email, backendUrl, setToken, onSuccess, navigate, redirectTo]);

  const handleResendCode = useCallback(async () => {
    if (resendTimer > 0) return;

    setIsResending(true);

    try {
      const response = await axios.post(`${backendUrl}/api/user/resend-verification`, {
        email: formData.email.toLowerCase().trim(),
      });

      if (response.data.success) {
        setResendTimer(60);
        toast.success('New verification code sent to your email');
      } else {
        throw new Error(response.data.message || 'Failed to resend code');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  }, [formData.email, backendUrl, resendTimer]);

  // ============================================================
  // Render
  // ============================================================

  // Step 3: Email Verification
  if (currentStep === 3) {
    return (
      <div className={`min-h-[70vh] flex items-center justify-center py-12 ${className}`}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
              <p className="text-sm text-gray-500 mt-2">
                We've sent a 6-digit verification code to
                <br />
                <span className="font-medium text-gray-700">{formData.email}</span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black focus:outline-none transition-all"
                    autoFocus={index === 0}
                    disabled={isLoading}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={isLoading || verificationCode.join('').length < 6}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>

              <div className="text-center text-sm">
                <span className="text-gray-500">Didn't receive the code? </span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || resendTimer > 0}
                  className="text-black font-medium hover:underline transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isResending 
                    ? 'Sending...' 
                    : resendTimer > 0 
                      ? `Resend in ${resendTimer}s` 
                      : 'Resend Code'
                  }
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Steps 1 & 2: Account & Profile
  const steps = [
    { id: 'account', label: 'Account' },
    { id: 'profile', label: 'Profile' },
    { id: 'verify', label: 'Verify' },
  ];

  return (
    <div className={`min-h-[70vh] flex items-center justify-center py-12 ${className}`}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">
              Join our community and start shopping
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} steps={steps} />

          {/* Form */}
          <form ref={formRef} onSubmit={handleStepSubmit} className="space-y-4">
            {/* Step 1: Account Details */}
            {currentStep === 1 && (
              <>
                <FormInput
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  label="Full Name"
                  icon="👤"
                  error={errors.name}
                  disabled={isLoading}
                  autoComplete="name"
                />

                <FormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  label="Email Address"
                  icon="✉️"
                  error={errors.email}
                  disabled={isLoading}
                  autoComplete="email"
                />

                <div>
                  <FormInput
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create Password"
                    label="Password"
                    icon="🔒"
                    error={errors.password}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                <PasswordStrengthIndicator password={formData.password} />
                <PasswordRequirements password={formData.password} />

                <FormInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  label="Confirm Password"
                  icon="✓"
                  error={errors.confirmPassword}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>

                <div className="flex items-start gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-500">
                    I agree to the{' '}
                    <Link to="/terms" className="text-gray-700 hover:underline font-medium">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-gray-700 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-xs text-red-500">{errors.terms}</p>
                )}
              </>
            )}

            {/* Step 2: Profile Details */}
            {currentStep === 2 && (
              <>
                <FormInput
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  label="Phone Number"
                  icon="📱"
                  error={errors.phone}
                  disabled={isLoading}
                  autoComplete="tel"
                />

                <FormInput
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street Address"
                  label="Street Address"
                  icon="🏠"
                  error={errors.address}
                  disabled={isLoading}
                  autoComplete="street-address"
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    label="City"
                    error={errors.city}
                    disabled={isLoading}
                    autoComplete="address-level2"
                  />

                  <FormInput
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Postal Code"
                    label="Postal Code"
                    error={errors.postalCode}
                    disabled={isLoading}
                    autoComplete="postal-code"
                  />
                </div>

                <FormInput
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  label="Country"
                  disabled={true}
                  autoComplete="country"
                />
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`${currentStep === 2 ? 'flex-1' : 'w-full'} px-4 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {currentStep === 2 ? 'Creating Account...' : 'Loading...'}
                  </>
                ) : (
                  currentStep === 2 ? 'Create Account' : 'Continue'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          {showSocialLogin && (
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

          {/* Toggle to Login */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="text-black font-medium hover:underline transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Register;