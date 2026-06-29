import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Title } from '../components/Title';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ============================================================
// Constants & Configuration
// ============================================================
const PAYMENT_METHODS = {
  COD: 'cod',
  BKASH: 'bkash',
  NAGAD: 'nagad',
  ROCKET: 'rocket',
  STRIPE: 'stripe',
  RAZORPAY: 'razorpay',
};

const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: 'Cash on Delivery',
  [PAYMENT_METHODS.BKASH]: 'bKash',
  [PAYMENT_METHODS.NAGAD]: 'Nagad',
  [PAYMENT_METHODS.ROCKET]: 'Rocket',
  [PAYMENT_METHODS.STRIPE]: 'Credit/Debit Card',
  [PAYMENT_METHODS.RAZORPAY]: 'UPI / Wallet',
};

const DIVISIONS = [
  'Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 
  'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'
];

const DISTRICTS = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Kishoreganj', 'Manikganj', 'Munshiganj', 'Narsingdi', 'Faridpur', 'Gopalganj', 'Madaripur', 'Rajbari', 'Shariatpur'],
  Chattogram: ['Chattogram', "Cox's Bazar", 'Rangamati', 'Bandarban', 'Khagrachari', 'Feni', 'Lakshmipur', 'Noakhali', 'Brahmanbaria', 'Comilla', 'Chandpur'],
  Khulna: ['Khulna', 'Bagerhat', 'Satkhira', 'Jessore', 'Jhenaidah', 'Magura', 'Narail', 'Kushtia', 'Chuadanga', 'Meherpur'],
  Rajshahi: ['Rajshahi', 'Pabna', 'Sirajganj', 'Bogra', 'Joypurhat', 'Chapainawabganj', 'Natore', 'Naogaon'],
  Barishal: ['Barishal', 'Patuakhali', 'Bhola', 'Pirojpur', 'Jhalokathi', 'Barguna'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Kurigram', 'Gaibandha', 'Nilphamari', 'Lalmonirhat', 'Panchagarh', 'Thakurgaon'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur']
};

const DELIVERY_CHARGES = {
  'Dhaka': 60,
  'Dhaka City': 40,
  'Outside Dhaka': 120,
  'Chattogram City': 50,
  'Other Cities': 100,
};

const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  district: '',
  city: '',
  division: '',
  zipcode: '',
  area: '',
  deliveryNote: '',
};

const VALIDATION_RULES = {
  phone: {
    regex: /^01[3-9]\d{8}$/,
    message: 'Please enter a valid Bangladesh phone number (e.g., 01XXXXXXXXX)'
  },
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email'
  }
};

const MAX_ORDER_AMOUNT_COD = 50000;
const FREE_SHIPPING_THRESHOLD = 500;

// ============================================================
// Custom Hooks
// ============================================================
const useFormValidation = (formData) => {
  return useMemo(() => {
    const errors = {};
    const required = ['firstName', 'lastName', 'email', 'phone', 'street', 'division', 'district', 'city', 'zipcode'];
    
    required.forEach(field => {
      if (!formData[field]?.trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (formData.email && !VALIDATION_RULES.email.regex.test(formData.email)) {
      errors.email = VALIDATION_RULES.email.message;
    }
    
    if (formData.phone && !VALIDATION_RULES.phone.regex.test(formData.phone)) {
      errors.phone = VALIDATION_RULES.phone.message;
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
      hasErrors: Object.keys(errors).length > 0
    };
  }, [formData]);
};

const useDeliveryCharge = (division) => {
  return useMemo(() => {
    if (!division) return DELIVERY_CHARGES['Dhaka'];
    if (division === 'Dhaka') return DELIVERY_CHARGES['Dhaka'];
    if (division === 'Chattogram') return DELIVERY_CHARGES['Chattogram City'];
    return DELIVERY_CHARGES['Outside Dhaka'];
  }, [division]);
};

// ============================================================
// Reusable Components
// ============================================================
const FormInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  required = true,
  placeholder,
  className = '',
  icon,
  error,
  autoComplete,
  ...props 
}) => {
  const inputId = `input-${name}`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-gray-600 mb-1">
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder || label}
          autoComplete={autoComplete}
          className={`w-full py-2.5 px-3.5 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all ${icon ? 'pl-10' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  required = true,
  placeholder = 'Select an option',
  className = '',
  error,
  disabled = false,
}) => {
  const selectId = `select-${name}`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-gray-600 mb-1">
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full py-2.5 px-3.5 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

const PaymentMethod = ({ 
  method, 
  selected, 
  onClick, 
  icon, 
  label, 
  description,
  recommended,
  disabled = false,
}) => {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        flex items-center gap-3 border-2 p-3 cursor-pointer rounded-lg 
        transition-all duration-200 hover:bg-gray-50 relative
        ${selected ? 'border-black bg-gray-50' : 'border-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Select ${label} payment method`}
      aria-pressed={selected}
      onKeyDown={(e) => !disabled && e.key === 'Enter' && onClick()}
    >
      {recommended && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
          POPULAR
        </span>
      )}
      <div className="flex-shrink-0" aria-hidden="true">
        <div className={`
          w-4 h-4 border-2 rounded-full flex items-center justify-center
          ${selected ? 'border-black' : 'border-gray-300'}
        `}>
          {selected && <div className="w-2 h-2 bg-black rounded-full" />}
        </div>
      </div>
      {icon && (
        <div className="flex-shrink-0" aria-hidden="true">
          <img className="h-6 object-contain" src={icon} alt={label} onError={(e) => e.target.style.display = 'none'} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${selected ? 'text-black' : 'text-gray-600'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-400 truncate">{description}</p>
        )}
      </div>
      {selected && (
        <div className="flex-shrink-0" aria-hidden="true">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

const OrderSummary = ({ subtotal, deliveryCharge, discount, totalAmount, currency, itemsCount, division }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-800 text-sm mb-3">Order Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Items ({itemsCount})</span>
          <span className="font-medium">{currency}{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Charge</span>
          <span className="font-medium">
            {subtotal > 0 ? `${currency}${deliveryCharge.toFixed(2)}` : 'Free'}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({discount}%)</span>
            <span>-{currency}{(subtotal * discount / 100).toFixed(2)}</span>
          </div>
        )}
        <hr className="my-2 border-gray-200" />
        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <span>{currency}{totalAmount.toFixed(2)}</span>
        </div>
        {division && (
          <p className="text-xs text-gray-400 mt-1">
            Delivery to: {division}
          </p>
        )}
        {subtotal > FREE_SHIPPING_THRESHOLD && (
          <p className="text-xs text-green-600 mt-1">
            ✨ Free delivery on orders over {currency}{FREE_SHIPPING_THRESHOLD}
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Main PlaceOrder Component
// ============================================================
export const PlaceOrder = ({
  showCartTotal = true,
  showPaymentMethods = true,
  className = '',
}) => {
  // --- Hooks ---
  const navigate = useNavigate();
  const shopContext = useShop();
  
  // ✅ Safely get context values with fallbacks
  const backendUrl = shopContext.backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const token = shopContext.token || localStorage.getItem('ecom_token') || '';
  const cartItems = shopContext.cartItems || {};
  const products = shopContext.products || [];
  const setCartItems = shopContext.setCartItems || (() => {});
  const isAuthenticated = shopContext.isAuthenticated || !!token;
  const currency = shopContext.currency || '$';
  const getCartAmount = shopContext.getCartAmount || (() => 0);

  // --- State ---
  const [method, setMethod] = useState(PAYMENT_METHODS.COD);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [discount, setDiscount] = useState(0);
  const [isCodAvailable, setIsCodAvailable] = useState(true);
  const [formTouched, setFormTouched] = useState(false);

  // --- Derived State ---
  const subtotal = useMemo(() => {
    if (typeof getCartAmount === 'function') {
      return getCartAmount() || 0;
    }
    let total = 0;
    if (cartItems && products) {
      for (const productId in cartItems) {
        const product = products.find(p => p._id === productId);
        if (!product) continue;
        for (const size in cartItems[productId]) {
          total += (product.price || 0) * (cartItems[productId][size] || 0);
        }
      }
    }
    return total;
  }, [getCartAmount, cartItems, products]);

  const deliveryCharge = useDeliveryCharge(formData.division);
  
  const totalAmount = useMemo(() => {
    const amount = subtotal + (subtotal > 0 ? deliveryCharge : 0);
    return amount - (amount * (discount / 100));
  }, [subtotal, deliveryCharge, discount]);

  const orderItems = useMemo(() => {
    if (!cartItems || !products || products.length === 0) return [];
    
    const items = [];
    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        const quantity = cartItems[productId][size];
        if (quantity > 0) {
          const itemInfo = products.find((product) => product._id === productId);
          if (itemInfo) {
            items.push({
              ...itemInfo,
              size,
              quantity
            });
          }
        }
      }
    }
    return items;
  }, [cartItems, products]);

  const { errors: formErrors, isValid: isFormValid, hasErrors } = useFormValidation(formData);
  const showErrors = formTouched && hasErrors;

  // --- Handlers ---
  const onChangeHandler = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormTouched(true);
    
    if (name === 'division') {
      setFormData(prev => ({ ...prev, district: '' }));
    }
  }, []);

  const handleFieldBlur = useCallback(() => {
    setFormTouched(true);
  }, []);

  // --- Payment Handlers ---
  // const handlePayment = useCallback(async (orderData, paymentMethod) => {
  //   const paymentConfigs = {
  //     [PAYMENT_METHODS.COD]: {
  //       endpoint: '/api/order/place',
  //       successMessage: 'Order placed successfully! You will pay on delivery.'
  //     },
  //     [PAYMENT_METHODS.BKASH]: {
  //       endpoint: '/api/order/bkash',
  //       successMessage: 'Redirecting to bKash...'
  //     },
  //     [PAYMENT_METHODS.NAGAD]: {
  //       endpoint: '/api/order/nagad',
  //       successMessage: 'Redirecting to Nagad...'
  //     }
  //   };

  //   const config = paymentConfigs[paymentMethod];
  //   if (!config) {
  //     throw new Error('Payment method not supported');
  //   }

  //   // ✅ Check if backend is available (with timeout)
  //   try {
  //     await axios.get(`${backendUrl}/api/health`, { 
  //       timeout: 5000,
  //       validateStatus: (status) => status < 500
  //     });
  //   } catch (healthError) {
  //     // In production, don't fallback to development mode
  //     if (process.env.NODE_ENV === 'development') {
  //       console.warn('⚠️ Backend not available. Running in development mode.');
  //       toast.warning('Backend not available. Using development fallback.');
  //       if (typeof setCartItems === 'function') {
  //         setCartItems({});
  //       }
  //       toast.success('Order placed successfully! (Development Mode)');
  //       navigate('/orders');
  //       return true;
  //     }
  //     throw new Error('Payment service temporarily unavailable. Please try again later.');
  //   }

  //   // ✅ Proceed with payment
  //   const response = await axios.post(
  //     `${backendUrl}${config.endpoint}`,
  //     orderData,
  //     { 
  //       headers: { 
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       },
  //       timeout: 30000 
  //     }
  //   );

  //   if (!response.data.success) {
  //     throw new Error(response.data.message || 'Payment failed');
  //   }

  //   if (response.data.paymentUrl) {
  //     window.location.href = response.data.paymentUrl;
  //     return true;
  //   }

  //   if (typeof setCartItems === 'function') {
  //     setCartItems({});
  //   }
  //   toast.success(config.successMessage);
  //   navigate('/orders');
  //   return true;

  // }, [backendUrl, token, setCartItems, navigate]);
  

const handlePayment = useCallback(async (orderData, paymentMethod) => {
    const paymentConfigs = {
        [PAYMENT_METHODS.COD]: {
            endpoint: '/api/order/place',
            successMessage: 'Order placed successfully! You will pay on delivery.'
        },
        [PAYMENT_METHODS.BKASH]: {
            endpoint: '/api/order/bkash',
            successMessage: 'Redirecting to bKash...'
        },
        [PAYMENT_METHODS.NAGAD]: {
            endpoint: '/api/order/nagad',
            successMessage: 'Redirecting to Nagad...'
        }
    };

    const config = paymentConfigs[paymentMethod];
    if (!config) {
        throw new Error('Payment method not supported');
    }

    // ✅ Check if backend is available
    try {
        await axios.get(`${backendUrl}/api/health`, { 
            timeout: 5000,
            validateStatus: (status) => status < 500
        });
    } catch (healthError) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Backend not available. Running in development mode.');
            toast.warning('Backend not available. Using development fallback.');
            
            // ✅ Clear cart in development mode
            if (typeof setCartItems === 'function') {
                setCartItems({});
                // Also clear localStorage
                localStorage.removeItem('ecom_cart_items');
            }
            
            toast.success('Order placed successfully! (Development Mode)');
            navigate('/orders');
            return true;
        }
        throw new Error('Payment service temporarily unavailable. Please try again later.');
    }

    // ✅ Proceed with payment
    const response = await axios.post(
        `${backendUrl}${config.endpoint}`,
        orderData,
        { 
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 
        }
    );

    if (!response.data.success) {
        throw new Error(response.data.message || 'Payment failed');
    }

    if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
        return true;
    }

    // ✅ Clear cart after successful order
    if (typeof setCartItems === 'function') {
        setCartItems({});
        // ✅ Clear localStorage
        localStorage.removeItem('ecom_cart_items');
        // ✅ Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('cartCleared'));
    }
    
    toast.success(config.successMessage);
    navigate('/orders');
    return true;

}, [backendUrl, token, setCartItems, navigate]);

  // --- Main Submit Handler ---
  const onSubmitHandler = useCallback(async (e) => {
    e.preventDefault();

    setFormTouched(true);

    // ✅ Validation checks
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!isFormValid) {
      toast.error('Please fill in all required fields correctly');
      // Scroll to first error
      const firstError = document.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    if (!method) {
      toast.error('Please select a payment method');
      return;
    }

    if (method === PAYMENT_METHODS.COD && totalAmount > MAX_ORDER_AMOUNT_COD) {
      toast.error(`COD is not available for orders over ${currency}${MAX_ORDER_AMOUNT_COD.toLocaleString()}`);
      return;
    }

    setIsLoading(true);

    try {
      const formattedAddress = `${formData.street}, ${formData.city}, ${formData.district}, ${formData.division} - ${formData.zipcode}`;

      const orderData = {
        address: {
          ...formData,
          fullAddress: formattedAddress,
        },
        items: orderItems.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
          total: item.price * item.quantity,
          image: item.image || '/placeholder-image.png'
        })),
        subtotal: Number(subtotal.toFixed(2)),
        deliveryCharge: Number(deliveryCharge.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        amount: Number(totalAmount.toFixed(2)),
        paymentMethod: method,
        deliveryMethod: 'standard',
        timestamp: new Date().toISOString(),
      };

      await handlePayment(orderData, method);

    } catch (error) {
      console.error('Order placement error:', error);
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          navigate('/login');
        } else if (error.response.status === 404) {
          errorMessage = 'Payment service is temporarily unavailable. Please try again later.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthenticated,
    orderItems,
    isFormValid,
    method,
    formData,
    subtotal,
    deliveryCharge,
    discount,
    totalAmount,
    handlePayment,
    navigate,
    currency,
  ]);

  // --- Effects ---
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please login to place an order');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setIsCodAvailable(totalAmount <= MAX_ORDER_AMOUNT_COD);
  }, [totalAmount]);

  // ✅ Auto-scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ============================================================
  // Render
  // ============================================================
  return (
    <form 
      onSubmit={onSubmitHandler} 
      className={`flex flex-col lg:flex-row justify-between gap-6 pt-5 sm:pt-14 min-h-[80vh] border-t ${className}`}
      noValidate
    >
      {/* ===== Left Side: Delivery Information ===== */}
      <div className="flex flex-col gap-4 w-full lg:max-w-[500px]">
        <div className="mb-2">
          <Title text1="DELIVERY" text2="INFORMATION" />
          <p className="text-xs text-gray-400 mt-1">Fill in your delivery details for Bangladesh</p>
        </div>

        <div className="flex gap-3">
          <FormInput
            name="firstName"
            value={formData.firstName}
            onChange={onChangeHandler}
            onBlur={handleFieldBlur}
            label="First Name"
            placeholder="John"
            error={showErrors && formErrors.firstName}
            autoComplete="given-name"
          />
          <FormInput
            name="lastName"
            value={formData.lastName}
            onChange={onChangeHandler}
            onBlur={handleFieldBlur}
            label="Last Name"
            placeholder="Doe"
            error={showErrors && formErrors.lastName}
            autoComplete="family-name"
          />
        </div>

        <div className="flex gap-3">
          <FormInput
            name="email"
            value={formData.email}
            onChange={onChangeHandler}
            onBlur={handleFieldBlur}
            type="email"
            label="Email Address"
            placeholder="john@example.com"
            error={showErrors && formErrors.email}
            icon="✉️"
            autoComplete="email"
          />
          <FormInput
            name="phone"
            value={formData.phone}
            onChange={onChangeHandler}
            onBlur={handleFieldBlur}
            type="tel"
            label="Phone Number (BD)"
            placeholder="01XXXXXXXXX"
            error={showErrors && formErrors.phone}
            icon="📱"
            autoComplete="tel"
          />
        </div>

        <FormInput
          name="street"
          value={formData.street}
          onChange={onChangeHandler}
          onBlur={handleFieldBlur}
          label="Street Address / House No."
          placeholder="123, Road No., House No."
          error={showErrors && formErrors.street}
          autoComplete="street-address"
        />

        <div className="flex gap-3">
          <FormSelect
            name="division"
            value={formData.division}
            onChange={onChangeHandler}
            onBlur={handleFieldBlur}
            label="Division"
            options={DIVISIONS}
            error={showErrors && formErrors.division}
          />
          <FormSelect
            name="district"
            value={formData.district}
            onChange={onChangeHandler}
            onBlur={handleFieldBlur}
            label="District"
            options={formData.division ? DISTRICTS[formData.division] || [] : []}
            error={showErrors && formErrors.district}
            placeholder="Select district"
            disabled={!formData.division}
          />
        </div>

        <div className="flex gap-3">
          <FormInput
            name="city"
            value={formData.city}
            onChange={onChangeHandler}
            onBlur={handleFieldBlur}
            label="City / Upazila"
            placeholder="City name"
            error={showErrors && formErrors.city}
            autoComplete="address-level2"
          />
          <FormInput
            name="zipcode"
            value={formData.zipcode}
            onChange={onChangeHandler}
            onBlur={handleFieldBlur}
            type="text"
            label="Zip Code"
            placeholder="1216"
            error={showErrors && formErrors.zipcode}
            autoComplete="postal-code"
          />
        </div>

        <FormInput
          name="area"
          value={formData.area}
          onChange={onChangeHandler}
          label="Area / Local Location (Optional)"
          placeholder="Dhanmondi, Gulshan, etc."
          required={false}
        />

        <div className="mt-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Delivery Note (Optional)
          </label>
          <textarea
            name="deliveryNote"
            value={formData.deliveryNote}
            onChange={onChangeHandler}
            rows={2}
            className="w-full py-2.5 px-3.5 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
            placeholder="Any special delivery instructions..."
          />
        </div>
      </div>

      {/* ===== Right Side: Order Summary & Payment ===== */}
      <div className="w-full lg:w-[450px]">
        {/* Cart Total */}
        {showCartTotal && (
          <div className="mb-6">
            <OrderSummary
              subtotal={subtotal}
              deliveryCharge={deliveryCharge}
              discount={discount}
              totalAmount={totalAmount}
              currency={currency}
              itemsCount={orderItems.length}
              division={formData.division}
            />
          </div>
        )}

        {/* Payment Methods */}
        {showPaymentMethods && (
          <div className="mt-8">
            <Title text1="PAYMENT" text2="METHOD" />
            
            <div className="mt-4 space-y-3">
              <PaymentMethod
                method={PAYMENT_METHODS.BKASH}
                selected={method === PAYMENT_METHODS.BKASH}
                onClick={() => setMethod(PAYMENT_METHODS.BKASH)}
                icon={assets.bkash_logo}
                label="bKash"
                description="Mobile banking (bKash)"
                recommended={true}
              />

              <PaymentMethod
                method={PAYMENT_METHODS.NAGAD}
                selected={method === PAYMENT_METHODS.NAGAD}
                onClick={() => setMethod(PAYMENT_METHODS.NAGAD)}
                icon={assets.nagad_logo}
                label="Nagad"
                description="Mobile banking (Nagad)"
              />

              <PaymentMethod
                method={PAYMENT_METHODS.ROCKET}
                selected={method === PAYMENT_METHODS.ROCKET}
                onClick={() => {
                  toast.info('Rocket payment is coming soon!');
                }}
                icon={assets.rocket_logo}
                label="Rocket"
                description="DBBL Mobile Banking"
              />

              <PaymentMethod
                method={PAYMENT_METHODS.COD}
                selected={method === PAYMENT_METHODS.COD}
                onClick={() => {
                  if (isCodAvailable) {
                    setMethod(PAYMENT_METHODS.COD);
                  } else {
                    toast.warning(`COD is not available for orders over ${currency}${MAX_ORDER_AMOUNT_COD.toLocaleString()}`);
                  }
                }}
                label="Cash on Delivery"
                description="Pay when you receive"
                icon={assets.cod_icon}
                disabled={!isCodAvailable}
              />

              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-400 mb-2">International Payments</p>
                <PaymentMethod
                  method={PAYMENT_METHODS.STRIPE}
                  selected={method === PAYMENT_METHODS.STRIPE}
                  onClick={() => {
                    toast.info('Stripe payment integration coming soon!');
                  }}
                  label="Credit / Debit Card"
                  description="Pay with Stripe"
                />
              </div>
            </div>

            {/* Place Order Button */}
            <div className="w-full text-end mt-6">
              <button
                disabled={isLoading || !isFormValid || orderItems.length === 0 || (method === PAYMENT_METHODS.COD && !isCodAvailable)}
                type="submit"
                className="w-full bg-black text-white py-3.5 text-sm font-medium uppercase tracking-wider rounded-lg 
                         hover:bg-gray-800 active:scale-[0.98] transition-all duration-300
                         disabled:bg-gray-300 disabled:cursor-not-allowed disabled:active:scale-100
                         flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order • ${currency}${totalAmount.toFixed(2)}`
                )}
              </button>
              
              {showErrors && !isFormValid && (
                <p className="text-xs text-red-500 mt-2 text-left">
                  Please fill in all required fields
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default PlaceOrder;