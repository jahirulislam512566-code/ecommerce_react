import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Title } from '../components/Title';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ============================================================
// Constants - Bangladesh Specific
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

// ============================================================
// FormInput Component
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
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
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
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder || label}
          className={`w-full py-2.5 px-3.5 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================================
// FormSelect Component
// ============================================================
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
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full py-2.5 px-3.5 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================================
// PaymentMethod Component
// ============================================================
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
      onKeyDown={(e) => !disabled && e.key === 'Enter' && onClick()}
    >
      {recommended && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
          POPULAR
        </span>
      )}
      <div className="flex-shrink-0">
        <div className={`
          w-4 h-4 border-2 rounded-full flex items-center justify-center
          ${selected ? 'border-black' : 'border-gray-300'}
        `}>
          {selected && <div className="w-2 h-2 bg-black rounded-full" />}
        </div>
      </div>
      {icon && (
        <div className="flex-shrink-0">
          <img className="h-6 object-contain" src={icon} alt={label} />
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
        <div className="flex-shrink-0">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
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
  const { 
    backendUrl, 
    token, 
    cartItems, 
    getCartSubtotal,
    products, 
    setCartItems,
    isAuthenticated,
    currency
  } = useShop();

  // --- State ---
  const [method, setMethod] = useState(PAYMENT_METHODS.COD);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(DELIVERY_CHARGES['Dhaka']);
  const [isCodAvailable, setIsCodAvailable] = useState(true);

  // --- Memoized Values ---
  const subtotal = useMemo(() => getCartSubtotal() || 0, [getCartSubtotal]);
  const totalAmount = useMemo(() => {
    const amount = subtotal + (subtotal > 0 ? deliveryCharge : 0);
    return amount - (amount * (discount / 100));
  }, [subtotal, deliveryCharge, discount]);

  const orderItems = useMemo(() => {
    const items = [];
    if (!cartItems || !products) return items;
    
    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        if (cartItems[productId][size] > 0) {
          const itemInfo = products.find((product) => product._id === productId);
          if (itemInfo) {
            items.push({
              ...itemInfo,
              size: size,
              quantity: cartItems[productId][size]
            });
          }
        }
      }
    }
    return items;
  }, [cartItems, products]);

  const isFormValid = useMemo(() => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'street', 'division', 'district', 'city', 'zipcode'];
    return required.every(field => formData[field]?.trim());
  }, [formData]);

  // --- Handlers ---
  const onChangeHandler = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'division') {
      let charge = DELIVERY_CHARGES['Outside Dhaka'];
      if (value === 'Dhaka') {
        charge = DELIVERY_CHARGES['Dhaka'];
      } else if (value === 'Chattogram') {
        charge = DELIVERY_CHARGES['Chattogram City'];
      }
      setDeliveryCharge(charge);
      setFormData(prev => ({ ...prev, district: '' }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    const phoneRegex = /^01[3-9]\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Please enter a valid Bangladesh phone number (e.g., 01XXXXXXXXX)';
    }
    if (!formData.street?.trim()) errors.street = 'Street address is required';
    if (!formData.division) errors.division = 'Division is required';
    if (!formData.district) errors.district = 'District is required';
    if (!formData.city) errors.city = 'City/Upazila is required';
    if (!formData.zipcode?.trim()) errors.zipcode = 'Zip code is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // --- Payment Handlers with Fallbacks ---
  const handleCOD = useCallback(async (orderData) => {
    try {
      // Try the actual endpoint
      const response = await axios.post(
        `${backendUrl}/api/order/place`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setCartItems({});
        toast.success('Order placed successfully! You will pay on delivery.');
        navigate('/orders');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('COD Error:', error);
      
      // Fallback for development - simulate success
      if (process.env.NODE_ENV === 'development') {
        toast.info('Development Mode: Order simulated successfully');
        setCartItems({});
        navigate('/orders');
        return true;
      }
      throw error;
    }
  }, [backendUrl, token, setCartItems, navigate]);

  const handleBkash = useCallback(async (orderData) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/bkash`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const { paymentUrl } = response.data;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return true;
        } else {
          throw new Error('Payment URL not received');
        }
      } else {
        throw new Error(response.data.message || 'Failed to initialize bKash payment');
      }
    } catch (error) {
      console.error('bKash Error:', error);
      
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        toast.info('Development Mode: bKash payment simulated');
        // Simulate successful payment
        const codResponse = await axios.post(
          `${backendUrl}/api/order/place`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (codResponse.data.success) {
          setCartItems({});
          toast.success('Order placed successfully! (bKash simulated)');
          navigate('/orders');
          return true;
        }
      }
      throw error;
    }
  }, [backendUrl, token, setCartItems, navigate]);

  const handleNagad = useCallback(async (orderData) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/nagad`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const { paymentUrl } = response.data;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return true;
        } else {
          throw new Error('Payment URL not received');
        }
      } else {
        throw new Error(response.data.message || 'Failed to initialize Nagad payment');
      }
    } catch (error) {
      console.error('Nagad Error:', error);
      
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        toast.info('Development Mode: Nagad payment simulated');
        const codResponse = await axios.post(
          `${backendUrl}/api/order/place`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (codResponse.data.success) {
          setCartItems({});
          toast.success('Order placed successfully! (Nagad simulated)');
          navigate('/orders');
          return true;
        }
      }
      throw error;
    }
  }, [backendUrl, token, setCartItems, navigate]);

  // --- Main Submit Handler ---
  const onSubmitHandler = useCallback(async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    if (!method) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      setIsLoading(true);

      const formattedAddress = `${formData.street}, ${formData.city}, ${formData.district}, ${formData.division} - ${formData.zipcode}`;

      const orderData = {
        address: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          district: formData.district,
          division: formData.division,
          zipcode: formData.zipcode,
          area: formData.area || '',
          fullAddress: formattedAddress,
          deliveryNote: formData.deliveryNote || '',
        },
        items: orderItems.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
          total: item.price * item.quantity
        })),
        subtotal: subtotal,
        deliveryCharge: deliveryCharge,
        discount: discount,
        amount: totalAmount,
        paymentMethod: method,
        deliveryMethod: 'standard',
      };

      // Check if backend is available
      try {
        await axios.get(`${backendUrl}/api/health`);
      } catch (healthError) {
        if (process.env.NODE_ENV === 'development') {
          toast.warning('Backend not available. Running in development mode.');
          // Simulate order placement
          setCartItems({});
          toast.success('Order placed successfully! (Development Mode)');
          navigate('/orders');
          setIsLoading(false);
          return;
        }
        throw new Error('Backend service unavailable. Please try again later.');
      }

      switch (method) {
        case PAYMENT_METHODS.COD:
          await handleCOD(orderData);
          break;
        case PAYMENT_METHODS.BKASH:
          await handleBkash(orderData);
          break;
        case PAYMENT_METHODS.NAGAD:
          await handleNagad(orderData);
          break;
        case PAYMENT_METHODS.ROCKET:
          toast.info('Rocket payment is coming soon!');
          break;
        case PAYMENT_METHODS.STRIPE:
          toast.info('Stripe payment is coming soon!');
          break;
        default:
          toast.error('Invalid payment method selected');
      }

    } catch (error) {
      console.error('Order placement error:', error);
      
      let errorMessage = 'Failed to place order. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'Payment service is temporarily unavailable. Please try Cash on Delivery or try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
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
    validateForm,
    method,
    formData,
    subtotal,
    deliveryCharge,
    discount,
    totalAmount,
    handleCOD,
    handleBkash,
    handleNagad,
    navigate,
    setCartItems,
    backendUrl,
  ]);

  // --- Effects ---
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please login to place an order');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (totalAmount > 50000) {
      setIsCodAvailable(false);
    } else {
      setIsCodAvailable(true);
    }
  }, [totalAmount]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <form 
      onSubmit={onSubmitHandler} 
      className={`flex flex-col lg:flex-row justify-between gap-6 pt-5 sm:pt-14 min-h-[80vh] border-t ${className}`}
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
            label="First Name"
            placeholder="John"
            error={formErrors.firstName}
          />
          <FormInput
            name="lastName"
            value={formData.lastName}
            onChange={onChangeHandler}
            label="Last Name"
            placeholder="Doe"
            error={formErrors.lastName}
          />
        </div>

        <div className="flex gap-3">
          <FormInput
            name="email"
            value={formData.email}
            onChange={onChangeHandler}
            type="email"
            label="Email Address"
            placeholder="john@example.com"
            error={formErrors.email}
            icon="✉️"
          />
          <FormInput
            name="phone"
            value={formData.phone}
            onChange={onChangeHandler}
            type="tel"
            label="Phone Number (BD)"
            placeholder="01XXXXXXXXX"
            error={formErrors.phone}
            icon="📱"
          />
        </div>

        <FormInput
          name="street"
          value={formData.street}
          onChange={onChangeHandler}
          label="Street Address / House No."
          placeholder="123, Road No., House No."
          error={formErrors.street}
        />

        <div className="flex gap-3">
          <FormSelect
            name="division"
            value={formData.division}
            onChange={onChangeHandler}
            label="Division"
            options={DIVISIONS}
            error={formErrors.division}
          />
          <FormSelect
            name="district"
            value={formData.district}
            onChange={onChangeHandler}
            label="District"
            options={formData.division ? DISTRICTS[formData.division] || [] : []}
            error={formErrors.district}
            placeholder="Select district"
            disabled={!formData.division}
          />
        </div>

        <div className="flex gap-3">
          <FormInput
            name="city"
            value={formData.city}
            onChange={onChangeHandler}
            label="City / Upazila"
            placeholder="City name"
            error={formErrors.city}
          />
          <FormInput
            name="zipcode"
            value={formData.zipcode}
            onChange={onChangeHandler}
            type="text"
            label="Zip Code"
            placeholder="1216"
            error={formErrors.zipcode}
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
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
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
                <p className="text-xs text-gray-400 mt-1">
                  {formData.division && `Delivery to: ${formData.division}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        {showPaymentMethods && (
          <div className="mt-8">
            <Title text1="PAYMENT" text2="METHOD" />
            
            <div className="mt-4 space-y-3">
              {/* bKash */}
              <PaymentMethod
                method={PAYMENT_METHODS.BKASH}
                selected={method === PAYMENT_METHODS.BKASH}
                onClick={() => setMethod(PAYMENT_METHODS.BKASH)}
                icon={assets.bkash_logo}
                label="bKash"
                description="Mobile banking (bKash)"
                recommended={true}
              />

              {/* Nagad */}
              <PaymentMethod
                method={PAYMENT_METHODS.NAGAD}
                selected={method === PAYMENT_METHODS.NAGAD}
                onClick={() => setMethod(PAYMENT_METHODS.NAGAD)}
                icon={assets.nagad_logo}
                label="Nagad"
                description="Mobile banking (Nagad)"
              />

              {/* Rocket */}
              <PaymentMethod
                method={PAYMENT_METHODS.ROCKET}
                selected={method === PAYMENT_METHODS.ROCKET}
                onClick={() => setMethod(PAYMENT_METHODS.ROCKET)}
                icon={assets.rocket_logo}
                label="Rocket"
                description="DBBL Mobile Banking"
              />

              {/* Cash on Delivery */}
              <PaymentMethod
                method={PAYMENT_METHODS.COD}
                selected={method === PAYMENT_METHODS.COD}
                onClick={() => {
                  if (isCodAvailable) {
                    setMethod(PAYMENT_METHODS.COD);
                  } else {
                    toast.warning('COD is not available for orders over ৳50,000');
                  }
                }}
                label="Cash on Delivery"
                description="Pay when you receive"
                icon={assets.cod_icon}
              />

              {/* International Payments */}
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

            {/* Order Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Items ({orderItems.length})</span>
                <span className="font-medium">{currency}{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm mb-2 text-green-600">
                  <span>Discount ({discount}%)</span>
                  <span>-{currency}{(subtotal * discount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium">
                  {subtotal > 0 ? currency + deliveryCharge.toFixed(2) : 'Free'}
                </span>
              </div>
              <hr className="my-2 border-gray-200" />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{currency}{totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                * Free delivery on orders over ৳500
              </p>
            </div>

            {/* Place Order Button */}
            <div className="w-full text-end mt-6">
              <button
                disabled={isLoading || !isFormValid || orderItems.length === 0}
                type="submit"
                className="w-full bg-black text-black  py-3.5 text-sm font-medium uppercase tracking-wider rounded-lg 
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
              
              {!isFormValid && (
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

// ============================================================
// Default Export
// ============================================================
export default PlaceOrder;