import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

// ============================================================
// Constants
// ============================================================
const COMPANY_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Delivery Information', path: '/delivery' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms & Conditions', path: '/terms' },
  { label: 'Contact Us', path: '/contact' },
];

const SOCIAL_LINKS = [
  { name: 'Facebook', icon: '📘', url: 'https://facebook.com' },
  { name: 'Instagram', icon: '📸', url: 'https://instagram.com' },
  { name: 'Twitter', icon: '🐦', url: 'https://twitter.com' },
  { name: 'YouTube', icon: '▶️', url: 'https://youtube.com' },
  { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com' },
];

const PAYMENT_METHODS = [
  { name: 'Visa', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'PayPal', icon: '💰' },
  { name: 'bKash', icon: '📱' },
  { name: 'Nagad', icon: '📱' },
];

// ============================================================
// SocialLink Component
// ============================================================
const SocialLink = ({ name, icon, url }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-black transition-all duration-300 transform hover:scale-110 inline-block"
      aria-label={name}
    >
      <span className="text-xl sm:text-2xl">{icon}</span>
    </a>
  );
};

// ============================================================
// FooterLink Component
// ============================================================
const FooterLink = ({ to, children }) => {
  return (
    <li>
      <Link
        to={to}
        className="text-gray-500 hover:text-black transition-colors duration-300 text-sm"
      >
        {children}
      </Link>
    </li>
  );
};

// ============================================================
// NewsletterForm Component
// ============================================================
const NewsletterForm = ({ onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubscribe?.(email);
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [email, onSubscribe]);

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
          required
          aria-label="Email for newsletter"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Get 10% off your first order
      </p>
    </form>
  );
};

// ============================================================
// Main Footer Component
// ============================================================
export const Footer = ({
  companyName = 'nexusbd.com',
  companyDescription = 'Your premier destination for modern fashion in Bangladesh. Quality you can trust.',
  contactPhone = '+880-1700-000000',
  contactEmail = 'contact@nexusbd.com',
  showNewsletter = true,
  showPaymentMethods = true,
  showSocialLinks = true,
  currentYear = new Date().getFullYear(),
  className = '',
}) => {
  // --- State ---
  const [showToast, setShowToast] = useState(false);

  // --- Handlers ---
  const handleNewsletterSubscribe = useCallback((email) => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    console.log('Newsletter subscribed:', email);
  }, []);

  // ============================================================
  // Render
  // ============================================================
  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img
                src={assets.logo}
                className="w-32 md:w-36 h-auto hover:opacity-80 transition-opacity"
                alt={`${companyName} logo`}
                loading="lazy"
              />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              {companyDescription}
            </p>
            
            {/* Social Links */}
            {showSocialLinks && (
              <div className="flex items-center gap-3 pt-2">
                {SOCIAL_LINKS.map((social) => (
                  <SocialLink key={social.name} {...social} />
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Company Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <FooterLink key={link.label} to={link.path}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Get In Touch
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-500">
                <span className="text-lg">📞</span>
                <a
                  href={`tel:${contactPhone.replace(/\s/g, '')}`}
                  className="hover:text-black transition-colors"
                >
                  {contactPhone}
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <span className="text-lg">✉️</span>
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-black transition-colors"
                >
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <span className="text-lg">📍</span>
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Payments */}
          <div className="space-y-4">
            {showNewsletter && (
              <>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Stay Updated
                </h3>
                <p className="text-sm text-gray-500">
                  Subscribe to our newsletter for exclusive offers and updates.
                </p>
                <NewsletterForm onSubscribe={handleNewsletterSubscribe} />
              </>
            )}

            {showPaymentMethods && (
              <div className="pt-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Secure Payments
                </p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <span
                      key={method.name}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded flex items-center gap-1"
                      title={method.name}
                    >
                      {method.icon} {method.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 text-center sm:text-left">
              Copyright © {currentYear} <span className="text-gray-600">{companyName}</span> - All Rights Reserved.
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <Link to="/privacy" className="hover:text-gray-600 transition-colors">
                Privacy Policy
              </Link>
              <span className="w-px h-4 bg-gray-200" />
              <Link to="/terms" className="hover:text-gray-600 transition-colors">
                Terms of Service
              </Link>
              <span className="w-px h-4 bg-gray-200" />
              <Link to="/sitemap" className="hover:text-gray-600 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-end gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">🔒 SSL Secure</span>
            <span className="w-px h-4 bg-gray-200 hidden sm:block" />
            <span className="flex items-center gap-1">✓ Verified Merchant</span>
            <span className="w-px h-4 bg-gray-200 hidden sm:block" />
            <span className="flex items-center gap-1">⭐ 4.8/5 Rating</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slideUp z-50">
          <p className="text-sm font-medium">✅ Subscribed successfully!</p>
        </div>
      )}
    </footer>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Footer;

// ============================================================
// Optional: Minimal Footer
// ============================================================
export const MinimalFooter = ({
  companyName = 'nexusbd.com',
  currentYear = new Date().getFullYear(),
  className = '',
}) => {
  return (
    <footer className={`bg-white border-t border-gray-200 py-6 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={assets.logo}
              className="w-24 h-auto"
              alt={`${companyName} logo`}
              loading="lazy"
            />
          </Link>
          <p className="text-sm text-gray-400 text-center">
            © {currentYear} {companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.slice(0, 3).map((social) => (
              <SocialLink key={social.name} {...social} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================================
// Optional: Footer with Back to Top Button
// ============================================================
export const FooterWithBackToTop = ({ ...props }) => {
  const [showButton, setShowButton] = useState(false);

  // Show button when scrolled down
  React.useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="relative">
      <Footer {...props} />
      
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 hover:scale-110"
          aria-label="Back to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ============================================================
// CSS Animations (Add to your global CSS)
// ============================================================
/*

*/