import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import { Title } from '../components/Title';
import { assets } from '../assets/assets';
import { CartTotal } from '../components/CartTotal';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// ============================================================
// Constants
// ============================================================
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

// ============================================================
// CartItem Component
// ============================================================
const CartItem = ({ 
  item, 
  productData, 
  currency, 
  updateQuantity,
  onRemove
}) => {
  // --- Handlers ---
  const handleQuantityChange = useCallback((e) => {
    const val = e.target.value;
    if (val === '' || val === '0') return;
    const quantity = Number(val);
    if (quantity < MIN_QUANTITY) {
      toast.warning(`Minimum quantity is ${MIN_QUANTITY}`);
      return;
    }
    if (quantity > MAX_QUANTITY) {
      toast.warning(`Maximum quantity is ${MAX_QUANTITY}`);
      return;
    }
    updateQuantity(item._id, item.size, quantity);
  }, [item._id, item.size, updateQuantity]);

  const handleRemove = useCallback(() => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      onRemove(item._id, item.size);
    }
  }, [item._id, item.size, onRemove]);

  return (
    <div className="py-4 border-t first:border-t-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
      <div className="grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4">
        {/* Product Info */}
        <div className="flex items-start gap-4 sm:gap-6">
          <Link 
            to={`/product/${productData._id}`}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <img
              className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-lg border border-gray-100"
              src={Array.isArray(productData.image) ? productData.image[0] : (productData.image || '/placeholder-image.png')}
              alt={productData.name || 'Product'}
              loading="lazy"
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
          </Link>

          <div className="flex-1 min-w-0">
            <Link 
              to={`/product/${productData._id}`}
              className="text-xs sm:text-base font-medium text-gray-900 hover:text-black transition-colors"
            >
              {productData.name || 'Unnamed Product'}
            </Link>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-5 mt-1.5 text-sm">
              <p className="font-semibold text-gray-900">
                {currency}{productData.price?.toLocaleString() || '0'}
              </p>
              <p className="px-2.5 py-0.5 border bg-gray-50 text-xs rounded uppercase font-medium text-gray-600">
                {item.size || 'N/A'}
              </p>
              {productData.discount > 0 && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  -{productData.discount}%
                </span>
              )}
            </div>

            {/* Stock status */}
            {productData.stock && productData.stock > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {productData.stock > 10 ? 'In Stock' : `Only ${productData.stock} left in stock`}
              </p>
            )}
          </div>
        </div>

        {/* Quantity Control */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const newQty = Math.max(MIN_QUANTITY, item.quantity - 1);
              updateQuantity(item._id, item.size, newQty);
            }}
            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm"
            aria-label="Decrease quantity"
            disabled={item.quantity <= MIN_QUANTITY}
          >
            −
          </button>
          
          <input
            onChange={handleQuantityChange}
            className="w-10 sm:w-14 px-1 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
            type="number"
            min={MIN_QUANTITY}
            max={MAX_QUANTITY}
            value={item.quantity}
            aria-label={`Quantity of ${productData.name}`}
          />
          
          <button
            onClick={() => {
              const newQty = Math.min(MAX_QUANTITY, item.quantity + 1);
              updateQuantity(item._id, item.size, newQty);
            }}
            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm"
            aria-label="Increase quantity"
            disabled={item.quantity >= MAX_QUANTITY}
          >
            +
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="flex items-center justify-center p-1 hover:bg-red-50 rounded transition-colors group"
          aria-label={`Remove ${productData.name} from cart`}
        >
          <img
            className="w-4 sm:w-5 opacity-60 group-hover:opacity-100 transition-opacity"
            src={assets.bin_icon}
            alt="Remove item"
          />
        </button>
      </div>
    </div>
  );
};

// ============================================================
// CartSkeleton Component
// ============================================================
const CartSkeleton = () => {
  return (
    <div className="py-4 border-t border-b border-gray-200 animate-pulse">
      <div className="grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="w-4 h-4 bg-gray-200 rounded ml-auto"></div>
      </div>
    </div>
  );
};

// ============================================================
// CartEmpty Component
// ============================================================
const CartEmpty = ({ navigate }) => {
  return (
    <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 my-8">
      <div className="max-w-sm mx-auto">
        <div className="text-5xl mb-4">🛒</div>
        <p className="font-medium text-gray-700 text-sm">Your shopping cart is empty</p>
        <p className="text-xs text-gray-400 mt-1">
          Looks like you haven't added any items yet
        </p>
        <button
          onClick={() => navigate('/collection')}
          className="mt-6 bg-black text-white text-xs px-8 py-3 rounded-lg uppercase font-medium tracking-wider hover:bg-gray-800 active:scale-[0.98] transition-all duration-300"
        >
          Start Shopping
        </button>
      </div>
    </div>
  );
};

// ============================================================
// Main Cart Component
// ============================================================
export const Cart = ({
  showContinueShopping = true,
  showCartSummary = true,
  className = '',
}) => {
  // --- Hooks ---
  const { 
    products, 
    currency, 
    cartItems, 
    updateQuantity, 
    navigate,
    isLoadingProducts,
    getCartTotalItems,
  } = useShop();

  // --- State ---
  const [cartData, setCartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Memoized Values ---
  const totalItems = useMemo(() => getCartTotalItems(), [getCartTotalItems]);

  const subtotal = useMemo(() => {
    let total = 0;
    for (const productId in cartItems) {
      const product = products.find(p => p._id === productId);
      if (!product) continue;
      for (const size in cartItems[productId]) {
        total += (product.price || 0) * cartItems[productId][size];
      }
    }
    return total;
  }, [cartItems, products]);

  // --- Handlers ---
  const handleUpdateQuantity = useCallback((productId, size, quantity) => {
    updateQuantity(productId, size, quantity);
    if (quantity === 0) {
      toast.info('Item removed from cart');
    }
  }, [updateQuantity]);

  const handleRemoveItem = useCallback((productId, size) => {
    updateQuantity(productId, size, 0);
  }, [updateQuantity]);

  const handleCheckout = useCallback(() => {
    if (totalItems === 0) {
      toast.warning('Your cart is empty');
      return;
    }
    navigate('/place-order');
  }, [totalItems, navigate]);

  // --- Effects ---
  useEffect(() => {
    if (!cartItems || Object.keys(cartItems).length === 0) {
      setCartData([]);
      return;
    }

    const tempData = [];
    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        const quantity = cartItems[productId][size];
        if (quantity > 0) {
          tempData.push({
            _id: productId,
            size: size,
            quantity: quantity,
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItems]);

  useEffect(() => {
    if (isLoadingProducts) {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoadingProducts]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`border-t pt-8 md:pt-14 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title text1="YOUR" text2="CART" />
          {totalItems > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </div>
        
        {totalItems > 0 && (
          <div className="text-sm text-gray-500">
            Subtotal: <span className="font-semibold text-gray-900">{currency}{subtotal.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Cart Content */}
      {isLoading ? (
        // Loading state
        Array.from({ length: 3 }).map((_, index) => (
          <CartSkeleton key={`skeleton-${index}`} />
        ))
      ) : cartData.length === 0 ? (
        // Empty state
        <CartEmpty navigate={navigate} />
      ) : (
        // Cart items
        <div className="mt-6">
          {/* Cart items list */}
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            {cartData.map((item, index) => {
              const productData = products.find(
                (product) => product._id === item._id
              );

              if (!productData) {
                return (
                  <div key={index} className="py-4 border-t first:border-t-0 border-b border-gray-200">
                    <p className="text-sm text-gray-400 px-4">Loading product details...</p>
                  </div>
                );
              }

              return (
                <CartItem
                  key={`${item._id}-${item.size}`}
                  item={item}
                  productData={productData}
                  currency={currency}
                  updateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              );
            })}
          </div>

          {/* Continue Shopping */}
          {showContinueShopping && (
            <div className="mt-4">
              <Link
                to="/collection"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-2"
              >
                ← Continue Shopping
              </Link>
            </div>
          )}

          {/* Cart Summary */}
          {showCartSummary && (
            <div className="flex justify-end mt-8">
              <div className="w-full sm:w-[450px]">
                <CartTotal
                  showTitle={false}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Cart;

// ============================================================
// Optional: Cart with Coupon Support
// ============================================================
export const CartWithCoupon = ({ ...props }) => {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      toast.warning('Please enter a coupon code');
      return;
    }

    try {
      // Simulate API call
      toast.info(`Checking coupon: ${couponCode}`);
      // Apply discount logic here
      setDiscount(10); // Example: 10% discount
      toast.success('Coupon applied successfully!');
    } catch (error) {
      toast.error('Invalid coupon code');
    }
  }, [couponCode]);

  return (
    <div className="space-y-6">
      <Cart {...props} />
      
      {/* Coupon Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
            aria-label="Coupon code"
          />
          <button
            onClick={handleApplyCoupon}
            className="px-4 py-2 text-sm font-medium bg-black text-white rounded hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Apply Coupon
          </button>
        </div>
        
        {discount > 0 && (
          <div className="mt-2 text-sm text-green-600">
            Coupon applied: {discount}% off
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Optional: Cart Summary Sidebar
// ============================================================
export const CartSidebar = ({ 
  isOpen, 
  onClose, 
  onCheckout,
  className = '',
}) => {
  const { cartItems, getCartTotalItems } = useShop();
  const totalItems = useMemo(() => getCartTotalItems(), [getCartTotalItems]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">
              Cart ({totalItems} items)
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close cart"
            >
              ✕
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <Cart showContinueShopping={false} showCartSummary={false} />
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t">
            <CartTotal showTitle={false} onCheckout={onCheckout} />
          </div>
        </div>
      </div>
    </div>
  );
};