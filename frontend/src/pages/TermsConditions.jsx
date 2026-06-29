import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [showToast, setShowToast] = useState(false);

  // SVG Icon Components
  const FileTextIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  const CheckCircleIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ShoppingCartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  const CreditCardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );

  const TruckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );

  const RefreshIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  const AlertCircleIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ScaleIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );

  const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const MailIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );

  const MapPinIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const ExternalLinkIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  const ClockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  const sections = [
    { id: 'introduction', label: 'Introduction', icon: FileTextIcon },
    { id: 'acceptance', label: 'Acceptance of Terms', icon: CheckCircleIcon },
    { id: 'products', label: 'Products & Pricing', icon: ShoppingCartIcon },
    { id: 'orders', label: 'Orders & Payments', icon: CreditCardIcon },
    { id: 'shipping', label: 'Shipping & Delivery', icon: TruckIcon },
    { id: 'returns', label: 'Returns & Refunds', icon: RefreshIcon },
    { id: 'account', label: 'User Accounts', icon: UsersIcon },
    { id: 'intellectual', label: 'Intellectual Property', icon: ScaleIcon },
    { id: 'limitations', label: 'Limitations of Liability', icon: AlertCircleIcon },
    { id: 'governing', label: 'Governing Law', icon: ShieldIcon },
    { id: 'changes', label: 'Changes to Terms', icon: ClockIcon },
    { id: 'contact', label: 'Contact Us', icon: MailIcon }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircleIcon />
            <span>Link copied to clipboard!</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
            <FileTextIcon />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Terms & Conditions
          </h1>
          <p className="text-sm sm:text-base text-gray-500 flex items-center justify-center gap-2 flex-wrap">
            <ClockIcon />
            Last Updated: <span className="font-medium text-gray-700">June 26, 2026</span>
            <span className="hidden sm:inline">•</span>
            <button 
              onClick={handleCopyLink}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              Share Terms <ExternalLinkIcon />
            </button>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <FileTextIcon />
                    Quick Navigation
                  </h2>
                </div>
                <nav className="p-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                          activeSection === section.id
                            ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon />
                        <span className="text-sm flex-1">{section.label}</span>
                        <ChevronRightIcon />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hidden lg:block">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">✓</div>
                    <div className="text-xs text-gray-500">Secure</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">✓</div>
                    <div className="text-xs text-gray-500">Trusted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="space-y-8 text-gray-700">
                  {/* Introduction */}
                  <section id="introduction" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                        <FileTextIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">1. Introduction</h2>
                        <p className="text-sm text-gray-500 mt-1">Welcome to our terms</p>
                      </div>
                    </div>
                    <div className="prose prose-indigo max-w-none">
                      <p className="leading-relaxed text-gray-600">
                        Welcome to <span className="font-semibold text-gray-900">[Your Store Name]</span>. These Terms and Conditions 
                        ("Terms") govern your use of our website and services. By accessing or using our platform, you agree 
                        to be bound by these Terms. Please read them carefully before making any purchases or using our services.
                      </p>
                      <div className="mt-4 bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                        <p className="text-sm text-indigo-800">
                          <strong>📋 Important:</strong> These Terms constitute a legally binding agreement between you and 
                          [Your Store Name]. If you do not agree with any part of these Terms, please do not use our services.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Acceptance of Terms */}
                  <section id="acceptance" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <CheckCircleIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">2. Acceptance of Terms</h2>
                        <p className="text-sm text-gray-500 mt-1">Agreeing to our conditions</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-600 leading-relaxed">
                        By using our website, you acknowledge that you have read, understood, and agree to be bound by these 
                        Terms and our Privacy Policy. You also agree to comply with all applicable laws and regulations.
                      </p>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Eligibility Requirements:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>You must be at least 18 years old or have parental/guardian consent</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>You must provide accurate and complete information when creating an account or placing an order</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>You must not use our services for any unlawful or prohibited purpose</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Products & Pricing */}
                  <section id="products" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <ShoppingCartIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">3. Products & Pricing</h2>
                        <p className="text-sm text-gray-500 mt-1">Understanding our offerings</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Product Information:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>We strive to display accurate product descriptions, images, and specifications</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>Colors may vary slightly due to different screen settings and lighting conditions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>Product availability is subject to stock and may change without notice</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Pricing Policy:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>All prices are listed in your local currency and include applicable taxes</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>We reserve the right to change prices at any time without prior notice</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>In case of pricing errors, we reserve the right to cancel or refuse orders</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Orders & Payments */}
                  <section id="orders" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <CreditCardIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">4. Orders & Payments</h2>
                        <p className="text-sm text-gray-500 mt-1">How to place orders and pay</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3">Order Process:</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                              <CheckCircleIcon />
                              <span>Add items to your cart and proceed to checkout</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircleIcon />
                              <span>Provide accurate shipping and billing information</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircleIcon />
                              <span>Review your order before submitting payment</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircleIcon />
                              <span>You will receive an order confirmation via email</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3">Payment Methods:</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                              <CheckCircleIcon />
                              <span>Credit/Debit Cards (Visa, Mastercard, Amex)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircleIcon />
                              <span>Digital wallets (PayPal, Apple Pay, Google Pay)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircleIcon />
                              <span>Bank transfers and other local payment methods</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <p className="text-sm text-red-700">
                          <strong>⚠️ Security:</strong> All payments are processed through secure, encrypted payment gateways. 
                          We do not store your complete credit card information on our servers.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Shipping & Delivery */}
                  <section id="shipping" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
                        <TruckIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">5. Shipping & Delivery</h2>
                        <p className="text-sm text-gray-500 mt-1">Getting your products to you</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { title: 'Processing Time', desc: 'Orders are processed within 1-3 business days' },
                          { title: 'Shipping Methods', desc: 'Standard, Express, and International shipping available' },
                          { title: 'Tracking', desc: 'You will receive a tracking number via email' },
                          { title: 'Delivery Time', desc: 'Estimated delivery times vary by location and method' }
                        ].map((item, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                        <p className="text-sm text-gray-700">
                          <strong>📦 International Shipping:</strong> Please note that customs fees, import duties, and taxes 
                          may apply and are the responsibility of the customer.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Returns & Refunds */}
                  <section id="returns" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                        <RefreshIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">6. Returns & Refunds</h2>
                        <p className="text-sm text-gray-500 mt-1">Our return policy</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Return Policy:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>Returns accepted within 30 days of delivery</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>Items must be unused, unworn, and in original packaging</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>Return shipping costs are the customer's responsibility unless the item is defective</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>Refunds will be processed within 5-10 business days of receiving the return</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                        <p className="text-sm text-green-700">
                          <strong>💚 Satisfaction Guarantee:</strong> We want you to be completely satisfied with your purchase. 
                          If you're not happy, we'll work with you to make it right.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* User Accounts */}
                  <section id="account" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-cyan-100 rounded-lg flex-shrink-0">
                        <UsersIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">7. User Accounts</h2>
                        <p className="text-sm text-gray-500 mt-1">Managing your account</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-gray-600 leading-relaxed">
                        To access certain features of our services, you may need to create an account. You are responsible for 
                        maintaining the confidentiality of your account credentials.
                      </p>
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Account Responsibilities:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>Keep your password secure and confidential</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>Notify us immediately of any unauthorized access</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>Provide accurate and up-to-date information</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircleIcon />
                            <span>You are responsible for all activities under your account</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Intellectual Property */}
                  <section id="intellectual" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-rose-100 rounded-lg flex-shrink-0">
                        <ScaleIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">8. Intellectual Property</h2>
                        <p className="text-sm text-gray-500 mt-1">Our rights and yours</p>
                      </div>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-5 border border-rose-200">
                      <p className="text-gray-700 leading-relaxed mb-3">
                        All content on our website, including text, images, logos, graphics, and software, is the property 
                        of [Your Store Name] and is protected by copyright, trademark, and other intellectual property laws.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon />
                          <span>You may not reproduce, distribute, or modify any content without our explicit permission</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon />
                          <span>Our trademarks and trade dress may not be used without prior written consent</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon />
                          <span>Unauthorized use may result in legal action</span>
                        </li>
                      </ul>
                    </div>
                  </section>

                  {/* Limitations of Liability */}
                  <section id="limitations" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                        <AlertCircleIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">9. Limitations of Liability</h2>
                        <p className="text-sm text-gray-500 mt-1">Understanding our legal responsibility</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                        <p className="text-gray-700 leading-relaxed">
                          To the maximum extent permitted by law, [Your Store Name] shall not be liable for any indirect, 
                          incidental, special, consequential, or punitive damages arising from your use of our services.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 text-sm">Limitations Include:</h4>
                          <ul className="mt-2 space-y-1 text-xs text-gray-600">
                            <li>• Loss of profits or revenue</li>
                            <li>• Loss of data or business interruption</li>
                            <li>• Any damages resulting from third-party conduct</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 text-sm">Our Liability is Limited To:</h4>
                          <ul className="mt-2 space-y-1 text-xs text-gray-600">
                            <li>• The total amount paid by you for products</li>
                            <li>• Direct damages as permitted by law</li>
                            <li>• Refunds or replacements for defective products</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Governing Law */}
                  <section id="governing" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                        <ShieldIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">10. Governing Law</h2>
                        <p className="text-sm text-gray-500 mt-1">Legal jurisdiction</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                        without regard to its conflict of law provisions. Any disputes arising from these Terms shall be 
                        resolved in the courts of [Your Jurisdiction].
                      </p>
                    </div>
                  </section>

                  {/* Changes to Terms */}
                  <section id="changes" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <ClockIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">11. Changes to Terms</h2>
                        <p className="text-sm text-gray-500 mt-1">Updates to our terms</p>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      We reserve the right to update or modify these Terms at any time. We will notify you of significant 
                      changes by posting the updated Terms on our website and updating the "Last Updated" date. 
                      Your continued use of our services constitutes acceptance of the modified Terms.
                    </p>
                  </section>

                  {/* Contact Us */}
                  <section id="contact" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <MailIcon />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">12. Contact Us</h2>
                        <p className="text-sm text-gray-500 mt-1">Get in touch with us</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      If you have questions, concerns, or feedback about these Terms, please contact us:
                    </p>
                    <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl p-6 border border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <MailIcon />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <a href="mailto:legal@yourstore.com" className="text-indigo-600 hover:underline font-medium">
                              legal@yourstore.com
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <PhoneIcon />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">+1 (555) 123-4567</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 sm:col-span-2">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <MapPinIcon />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="font-medium text-gray-900">[Your Business Address]</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 text-center sm:text-left">
                      By using our website, you agree to these Terms & Conditions.
                    </p>
                    <div className="flex items-center gap-3">
                      <Link to="/privacy-policy" className="text-xs text-indigo-600 hover:underline">
                        Privacy Policy
                      </Link>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <Link to="/returns" className="text-xs text-indigo-600 hover:underline">
                        Returns Policy
                      </Link>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-xs text-gray-400">© 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 9999px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .prose {
          color: #4b5563;
        }
        .prose strong {
          color: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default TermsConditions;