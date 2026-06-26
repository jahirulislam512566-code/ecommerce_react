import React, { useContext, useMemo, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import { Title } from './Title';
import { Link } from 'react-router-dom';

// ============================================================
// Constants
// ============================================================
const FREE_SHIPPING_THRESHOLD = 500;
const DISPLAY_CURRENCY_SYMBOL = '৳';

// ============================================================
// CartTotal Component
// ============================================================
export const CartTotal = ({
  showTitle = true,
  titleText1 = 'CART',
  titleText2 = 'TOTALS',
  showCheckoutButton = true,
  buttonText = 'PROCEED TO CHECKOUT',
  className = '',
  freeShippingThreshold = FREE_SHIPPING_THRESHOLD,
  onCheckout,
}) => {
  // --- Hooks ---
  const { currency, deliveryFee, getCartSubtotal, isAuthenticated, cartItems } = useShop();

  // --- Memoized Values ---
  const subtotal = useMemo(() => {
    return getCartSubtotal() || 0;
  }, [getCartSubtotal]);

  const isFreeShipping = useMemo(() => {
    return subtotal >= freeShippingThreshold;
  }, [subtotal, freeShippingThreshold]);

  const shippingCost = useMemo(() => {
    return subtotal > 0 ? (isFreeShipping ? 0 : deliveryFee) : 0;
  }, [subtotal, isFreeShipping, deliveryFee]);

  const total = useMemo(() => {
    return subtotal + shippingCost;
  }, [subtotal, shippingCost]);

  const itemCount = useMemo(() => {
    let count = 0;
    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        count += cartItems[productId][size] || 0;
      }
    }
    return count;
  }, [cartItems]);

  const hasItems = useMemo(() => {
    return itemCount > 0;
  }, [itemCount]);

  // --- Handlers ---
  const handleCheckout = useCallback(() => {
    if (onCheckout) {
      onCheckout();
    }
  }, [onCheckout]);

  // --- Render Helpers ---
  const renderPriceRow = useCallback((label, amount, isBold = false, highlight = false) => {
    const formattedAmount = amount.toFixed(2);
    const Tag = isBold ? 'b' : 'p';
    
    return (
      <div className={`flex justify-between items-center ${isBold ? 'text-base' : 'text-sm'}`}>
        <Tag className={`${isBold ? 'font-semibold' : 'font-medium'} ${highlight ? 'text-gray-900' : 'text-gray-600'}`}>
          {label}
        </Tag>
        <Tag className={`${isBold ? 'font-bold text-lg' : 'font-medium'} ${highlight ? 'text-black' : 'text-gray-700'}`}>
          {currency}{formattedAmount}
        </Tag>
      </div>
    );
  }, [currency]);

  const renderSavingsBadge = useCallback(() => {
    if (!isFreeShipping || subtotal === 0) return null;
    
    const savings = deliveryFee;
    return (
      <div className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
        <span>🎉</span>
        You saved {currency}{savings.toFixed(2)} on shipping!
      </div>
    );
  }, [isFreeShipping, subtotal, deliveryFee, currency]);

  const renderFreeShippingProgress = useCallback(() => {
    if (subtotal === 0) return null;
    
    const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
    const remaining = Math.max(freeShippingThreshold - subtotal, 0);
    
    if (isFreeShipping) {
      return (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-medium text-green-700 text-center">
            🎉 Free shipping applied!
          </p>
        </div>
      );
    }
    
    return (
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progress to free shipping</span>
          <span className="font-medium">{currency}{remaining.toFixed(2)} remaining</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>
    );
  }, [subtotal, isFreeShipping, freeShippingThreshold, currency]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`w-full ${className}`}>
      {/* Title */}
      {showTitle && (
        <div className="mb-4">
          <Title text1={titleText1} text2={titleText2} />
        </div>
      )}

      {/* Empty State */}
      {!hasItems ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-400 text-sm">Your cart is empty</p>
          <Link 
            to="/collection" 
            className="inline-block mt-3 text-sm text-black underline hover:text-gray-600 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Price Breakdown */}
          <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 space-y-3 shadow-sm">
            {renderPriceRow('Subtotal', subtotal)}
            
            {/* Item count */}
            <p className="text-xs text-gray-400 -mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
            </p>

            <hr className="border-gray-100" />

            {/* Shipping */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <p className="font-medium text-gray-600">
                  Shipping Fee
                  {isFreeShipping && (
                    <span className="ml-2 text-xs font-normal text-green-600">(Free)</span>
                  )}
                </p>
                <p className="font-medium text-gray-700">
                  {isFreeShipping ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `${currency}${shippingCost.toFixed(2)}`
                  )}
                </p>
              </div>
              
              {/* Free shipping progress */}
              {renderFreeShippingProgress()}
            </div>

            <hr className="border-gray-100" />

            {/* Total */}
            <div className="pt-1">
              {renderPriceRow('Total', total, true, true)}
              {subtotal > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Including {currency}{shippingCost.toFixed(2)} for shipping
                </p>
              )}
            </div>

            {/* Savings badge */}
            {renderSavingsBadge()}
          </div>

          {/* Checkout Button */}
          {showCheckoutButton && hasItems && (
            <div className="mt-4 space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-black text-black text-sm font-medium uppercase tracking-wider rounded-lg hover:bg-gray-800 active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={!isAuthenticated}
                aria-label="Proceed to checkout"
              >
                {!isAuthenticated ? 'Sign in to Checkout' : buttonText}
              </button>
              
              {!isAuthenticated && (
                <p className="text-center text-xs text-gray-400">
                  <Link to="/login" className="text-black underline hover:text-gray-600 transition-colors">
                    Sign in
                  </Link>
                  {' '}to complete your purchase
                </p>
              )}

              {/* Trust Badges */}
              <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
                <span>🔒 Secure Payment</span>
                <span>•</span>
                <span>🔄 Easy Returns</span>
                <span>•</span>
                <span>🚚 Free Shipping over {currency}{freeShippingThreshold}</span>
              </div>
            </div>
          )}

          {/* Continue Shopping */}
          {hasItems && (
            <div className="mt-3 text-center">
              <Link 
                to="/collection" 
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default CartTotal;

// ============================================================
// Optional: CartTotal with Coupon Support
// ============================================================
export const CartTotalWithCoupon = ({
  couponCode,
  discountPercentage = 0,
  onApplyCoupon,
  ...props
}) => {
  const { getCartSubtotal } = useShop();
  
  const subtotal = useMemo(() => getCartSubtotal() || 0, [getCartSubtotal]);
  
  const discountAmount = useMemo(() => {
    return (subtotal * discountPercentage) / 100;
  }, [subtotal, discountPercentage]);

  const finalTotal = useMemo(() => {
    return subtotal - discountAmount;
  }, [subtotal, discountAmount]);

  return (
    <div className="space-y-4">
      <CartTotal {...props} />
      
      {/* Coupon Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter coupon code"
            defaultValue={couponCode}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
            aria-label="Coupon code"
          />
          <button
            onClick={onApplyCoupon}
            className="px-4 py-2 text-sm font-medium bg-black text-white rounded hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Apply Coupon
          </button>
        </div>
        
        {discountPercentage > 0 && (
          <div className="mt-2 flex justify-between text-sm text-green-600">
            <span>Discount ({discountPercentage}% off)</span>
            <span>-{props.currency}{discountAmount.toFixed(2)}</span>
          </div>
        )}
        
        {couponCode && (
          <p className="text-xs text-gray-400 mt-1">
            Coupon <span className="font-medium text-gray-600">{couponCode}</span> applied
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Optional: CartTotal in Sidebar Format
// ============================================================
export const CartTotalSidebar = ({
  onCheckout,
  className = '',
  ...props
}) => {
  const { getCartSubtotal } = useShop();
  const subtotal = useMemo(() => getCartSubtotal() || 0, [getCartSubtotal]);

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{props.currency || '৳'}{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">Calculated at checkout</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{props.currency || '৳'}{subtotal.toFixed(2)}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full mt-2 py-2.5 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};