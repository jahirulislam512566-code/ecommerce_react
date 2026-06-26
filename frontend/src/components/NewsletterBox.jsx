import React, { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

// ============================================================
// Constants
// ============================================================
const NEWSLETTER_STORAGE_KEY = 'newsletter_subscribed';
const DISCOUNT_CODE = 'WELCOME20';
const PLACEHOLDER_TEXTS = [
  'Enter your email address',
  'Stay updated with our latest offers',
  'Subscribe for exclusive deals',
  'Join our community of fashion lovers',
];

// ============================================================
// NewsletterBox Component
// ============================================================
export const NewsletterBox = ({
  className = '',
  title = 'Subscribe now & get 20% off',
  subtitle = 'Be the first to know about new arrivals, sales, and exclusive offers straight to your inbox.',
  buttonText = 'Subscribe',
  discountCode = DISCOUNT_CODE,
  showDiscountBadge = true,
  showSocialProof = true,
  placeholder = 'Enter your email',
  onSubscribe,
  backendUrl,
}) => {
  // --- State ---
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // --- Effects ---
  // Check if user already subscribed
  useEffect(() => {
    const subscribed = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
    if (subscribed === 'true') {
      setIsSubscribed(true);
    }
  }, []);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDER_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const handleEmailChange = useCallback((e) => {
    const value = e.target.value;
    setEmail(value);
    if (error) setError('');
  }, [error]);

  const handleSubscribe = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim()) {
      setError('Email address is required');
      toast.warning('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      toast.warning('Please enter a valid email address');
      return;
    }

    // Check if already subscribed
    if (isSubscribed) {
      toast.info('You are already subscribed to our newsletter!');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Send to backend if URL provided
      if (backendUrl) {
        const response = await axios.post(
          `${backendUrl}/api/newsletter/subscribe`,
          { email },
          { timeout: 10000 }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || 'Subscription failed');
        }
      }

      // Store subscription status
      localStorage.setItem(NEWSLETTER_STORAGE_KEY, 'true');
      setIsSubscribed(true);

      // Show success message with discount code
      toast.success(
        <div>
          <p className="font-semibold">🎉 Thank you for subscribing!</p>
          <p className="text-sm mt-1">Use code <span className="font-bold">{discountCode}</span> for 20% off your first order!</p>
        </div>,
        { autoClose: 8000 }
      );

      // Call external handler
      if (onSubscribe) {
        onSubscribe(email);
      }

      // Clear input
      setEmail('');
      
      // Analytics tracking
      if (window.gtag) {
        window.gtag('event', 'newsletter_subscription', {
          event_category: 'engagement',
          event_label: email,
        });
      }

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to subscribe. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, validateEmail, isSubscribed, backendUrl, onSubscribe, discountCode]);

  // --- Render Helpers ---
  const renderDiscountBadge = useCallback(() => {
    if (!showDiscountBadge) return null;

    return (
      <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-4">
        <span className="text-sm font-semibold text-green-600">🎉</span>
        <span className="text-xs font-medium text-green-700">
          Get {discountCode} for 20% off
        </span>
      </div>
    );
  }, [showDiscountBadge, discountCode]);

  const renderSocialProof = useCallback(() => {
    if (!showSocialProof) return null;

    const subscribers = Math.floor(Math.random() * 5000) + 10000;
    
    return (
      <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-4">
        <span className="flex items-center gap-1">
          <span className="text-green-500">✓</span>
          {subscribers.toLocaleString()}+ subscribers
        </span>
        <span className="w-px h-4 bg-gray-200" />
        <span className="flex items-center gap-1">
          <span className="text-green-500">✓</span>
          No spam, unsubscribe anytime
        </span>
      </div>
    );
  }, [showSocialProof]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`text-center py-8 md:py-12 px-4 ${className}`}>
      {/* Discount Badge */}
      {renderDiscountBadge()}

      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-medium text-gray-800">
        {isSubscribed ? '🎉 You\'re subscribed!' : title}
      </h2>

      {/* Subtitle */}
      <p className="text-gray-400 mt-3 max-w-md mx-auto text-sm md:text-base">
        {isSubscribed 
          ? 'Thank you for joining our community! Check your inbox for exclusive updates.'
          : subtitle
        }
      </p>

      {/* Subscription Form */}
      {!isSubscribed ? (
        <form 
          onSubmit={handleSubscribe} 
          className="w-full max-w-md mx-auto my-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
            <input
              ref={inputRef}
              className="w-full sm:flex-1 outline-none px-4 py-3 text-gray-700 text-sm bg-transparent"
              type="email"
              placeholder={PLACEHOLDER_TEXTS[placeholderIndex % PLACEHOLDER_TEXTS.length]}
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              required
              aria-label="Email address"
              aria-invalid={!!error}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-black text-white text-xs px-6 md:px-10 py-3 uppercase font-medium tracking-wider hover:bg-gray-800 active:scale-[0.98] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Subscribing...
                </>
              ) : (
                buttonText
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-red-500 mt-2 text-left">
              ⚠️ {error}
            </p>
          )}

          {/* Terms */}
          <p className="text-xs text-gray-400 mt-3">
            *By subscribing, you agree to our Privacy Policy and Terms of Service.
          </p>

          {/* Social Proof */}
          {renderSocialProof()}
        </form>
      ) : (
        // Subscribed state
        <div className="my-6 p-6 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto">
          <div className="flex items-center gap-3 justify-center">
            <span className="text-3xl">📬</span>
            <div className="text-left">
              <p className="text-sm font-medium text-green-800">Check your inbox!</p>
              <p className="text-xs text-green-600 mt-1">
                We've sent you a confirmation email with your discount code.
              </p>
            </div>
          </div>
          
          {/* Resubscribe button */}
          <button
            onClick={() => {
              localStorage.removeItem(NEWSLETTER_STORAGE_KEY);
              setIsSubscribed(false);
              toast.info('You can subscribe again with a different email');
            }}
            className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors underline"
          >
            Subscribe with different email
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default NewsletterBox;

// ============================================================
// Optional: NewsletterBox with Popup
// ============================================================
export const NewsletterPopup = ({
  isOpen,
  onClose,
  delay = 5000,
  ...props
}) => {
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!isOpen && !hasShown) {
      const timer = setTimeout(() => {
        onClose?.();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasShown, delay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close newsletter popup"
        >
          ✕
        </button>

        <NewsletterBox 
          {...props}
          className="py-4"
          showDiscountBadge={true}
        />
      </div>
    </div>
  );
};

// ============================================================
// Optional: NewsletterBox with Floating Button
// ============================================================
export const NewsletterFloatingButton = ({
  position = 'bottom-right',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed ${positionClasses[position]} z-40
          bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 
          transition-all duration-300 hover:scale-110
          flex items-center gap-2
        `}
        aria-label="Subscribe to newsletter"
      >
        <span className="text-xl">📧</span>
        <span className="hidden sm:inline text-sm font-medium">Subscribe</span>
      </button>

      {/* Popup */}
      <NewsletterPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        {...props}
      />
    </>
  );
};

// ============================================================
// CSS Animations (Add to your global CSS)
// ============================================================
/*
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out forwards;
}
*/