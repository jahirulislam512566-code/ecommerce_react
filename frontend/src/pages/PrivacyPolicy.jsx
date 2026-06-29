import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Eye, 
  Users, 
  Cookie, 
  Database, 
  Mail, 
  Phone, 
  MapPin,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Clock,
  Globe,
  FileText,
  Download,
  Trash2,
  Edit3
} from 'lucide-react';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [showToast, setShowToast] = useState(false);

  const sections = [
    { id: 'introduction', label: 'Introduction', icon: Shield },
    { id: 'collection', label: 'Information Collection', icon: Database },
    { id: 'usage', label: 'How We Use Data', icon: Eye },
    { id: 'sharing', label: 'Information Sharing', icon: Users },
    { id: 'cookies', label: 'Cookies', icon: Cookie },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'rights', label: 'Your Rights', icon: CheckCircle },
    { id: 'thirdparty', label: 'Third-Party Links', icon: ExternalLink },
    { id: 'children', label: "Children's Privacy", icon: AlertCircle },
    { id: 'changes', label: 'Policy Updates', icon: Clock },
    { id: 'contact', label: 'Contact Us', icon: Mail }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>Link copied to clipboard!</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-gray-500 flex items-center justify-center gap-2 flex-wrap">
            <Clock className="w-4 h-4" />
            Last Updated: <span className="font-medium text-gray-700">June 26, 2026</span>
            <span className="hidden sm:inline">•</span>
            <button 
              onClick={handleCopyLink}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Share Policy <ExternalLink className="w-3 h-3" />
            </button>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation - Sticky */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
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
                            ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${
                          activeSection === section.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                        <span className="text-sm flex-1">{section.label}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          activeSection === section.id ? 'text-blue-600 rotate-90' : 'text-gray-300'
                        }`} />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hidden lg:block">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">100%</div>
                    <div className="text-xs text-gray-500">Transparent</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">SSL</div>
                    <div className="text-xs text-gray-500">Encrypted</div>
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
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">1. Introduction</h2>
                        <p className="text-sm text-gray-500 mt-1">Our commitment to your privacy</p>
                      </div>
                    </div>
                    <div className="prose prose-blue max-w-none">
                      <p className="leading-relaxed text-gray-600">
                        Welcome to <span className="font-semibold text-gray-900">[Your Store Name]</span> ("we," "our," "us"). 
                        We respect your privacy and are committed to protecting the personal information you share with us. 
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                        visit our website and use our services.
                      </p>
                      <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-sm text-blue-800">
                          <strong>🔒 Our Promise:</strong> We will never sell your personal information to third parties. 
                          Your trust is our top priority.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Information Collection */}
                  <section id="collection" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <Database className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">2. Information We Collect</h2>
                        <p className="text-sm text-gray-500 mt-1">What data we gather from you</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-blue-600" />
                          Personal Information You Provide
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            'Name, email address, phone number',
                            'Shipping and billing addresses',
                            'Payment information (processed securely)',
                            'Account credentials',
                            'Order history and preferences',
                            'Communications and feedback'
                          ].map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                          <Globe className="w-4 h-4 text-blue-600" />
                          Automatically Collected Information
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            'IP address and browser type',
                            'Device information',
                            'Pages visited and navigation patterns',
                            'Cookies and tracking technologies',
                            'Referral sources',
                            'Search queries'
                          ].map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Usage */}
                  <section id="usage" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <Eye className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">3. How We Use Your Information</h2>
                        <p className="text-sm text-gray-500 mt-1">Purpose of data processing</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        'Process and fulfill your orders',
                        'Communicate about orders and promotions',
                        'Improve website and customer experience',
                        'Personalize shopping experience',
                        'Prevent fraud and ensure security',
                        'Comply with legal obligations'
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-1.5 bg-blue-100 rounded-full flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Information Sharing */}
                  <section id="sharing" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                        <Users className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">4. Information Sharing</h2>
                        <p className="text-sm text-gray-500 mt-1">How we share your data</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      We do not sell, trade, or rent your personal information to third parties. However, we may share your information with:
                    </p>
                    <div className="space-y-3">
                      {[
                        {
                          title: 'Service Providers',
                          desc: 'Payment processors, shipping partners, and IT service providers who assist in operating our business'
                        },
                        {
                          title: 'Legal Requirements',
                          desc: 'When required by law, court order, or government regulation'
                        },
                        {
                          title: 'Business Transfers',
                          desc: 'In connection with a merger, acquisition, or sale of assets'
                        },
                        {
                          title: 'Consent',
                          desc: 'With your explicit consent for specific purposes'
                        }
                      ].map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Cookies */}
                  <section id="cookies" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                        <Cookie className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">5. Cookies and Tracking</h2>
                        <p className="text-sm text-gray-500 mt-1">Understanding our use of cookies</p>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, 
                      and personalize content. You can control cookie preferences through your browser settings. 
                      For more information, please see our{' '}
                      <Link to="/cookie-policy" className="text-blue-600 hover:text-blue-700 font-medium hover:underline inline-flex items-center gap-1">
                        Cookie Policy <ExternalLink className="w-3 h-3" />
                      </Link>.
                    </p>
                  </section>

                  {/* Security */}
                  <section id="security" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                        <Lock className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">6. Data Security</h2>
                        <p className="text-sm text-gray-500 mt-1">How we protect your information</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
                      <p className="text-gray-700 leading-relaxed">
                        We implement industry-standard security measures to protect your personal information from 
                        unauthorized access, alteration, disclosure, or destruction. These include SSL encryption, 
                        firewalls, and secure payment gateways.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {['SSL Encryption', 'Firewalls', 'Secure Payment Gateways', 'Regular Audits'].map((item) => (
                          <span key={item} className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {item}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-gray-500">
                        ⚠️ No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                      </p>
                    </div>
                  </section>

                  {/* Your Rights */}
                  <section id="rights" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">7. Your Rights</h2>
                        <p className="text-sm text-gray-500 mt-1">Control over your personal data</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">Depending on your location, you may have the following rights:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { icon: Eye, text: 'Access your personal information' },
                        { icon: Edit3, text: 'Update or correct your data' },
                        { icon: Trash2, text: 'Delete your personal information' },
                        { icon: CheckCircle, text: 'Withdraw consent at any time' },
                        { icon: AlertCircle, text: 'Object to data processing' },
                        { icon: Download, text: 'Request data portability' }
                      ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{item.text}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        To exercise these rights, please contact us at{' '}
                        <a href="mailto:privacy@yourstore.com" className="font-medium hover:underline">
                          privacy@yourstore.com
                        </a>
                      </p>
                    </div>
                  </section>

                  {/* Third-Party Links */}
                  <section id="thirdparty" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                        <ExternalLink className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">8. Third-Party Links</h2>
                        <p className="text-sm text-gray-500 mt-1">External websites and services</p>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Our website may contain links to third-party websites. We are not responsible for the privacy 
                      practices or content of these external sites. We encourage you to review their privacy policies 
                      before providing any personal information.
                    </p>
                  </section>

                  {/* Children's Privacy */}
                  <section id="children" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-pink-100 rounded-lg flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">9. Children's Privacy</h2>
                        <p className="text-sm text-gray-500 mt-1">Protecting minors</p>
                      </div>
                    </div>
                    <div className="bg-pink-50 border border-pink-200 rounded-xl p-5">
                      <p className="text-gray-700 leading-relaxed">
                        Our services are not directed to individuals under the age of 16. We do not knowingly collect 
                        personal information from children. If you believe we have inadvertently collected such 
                        information, please contact us immediately.
                      </p>
                    </div>
                  </section>

                  {/* Policy Updates */}
                  <section id="changes" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <Clock className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">10. Changes to This Policy</h2>
                        <p className="text-sm text-gray-500 mt-1">When and how we update</p>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      We reserve the right to update this Privacy Policy periodically. We will notify you of significant 
                      changes by posting the updated policy on our website and updating the "Last Updated" date. 
                      We encourage you to review this policy regularly.
                    </p>
                  </section>

                  {/* Contact Us */}
                  <section id="contact" className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">11. Contact Us</h2>
                        <p className="text-sm text-gray-500 mt-1">Get in touch with our privacy team</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      If you have questions, concerns, or requests regarding this Privacy Policy, please contact us:
                    </p>
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <a href="mailto:privacy@yourstore.com" className="text-blue-600 hover:underline font-medium">
                              privacy@yourstore.com
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Phone className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">+1 (555) 123-4567</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 sm:col-span-2">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <MapPin className="w-5 h-5 text-blue-600" />
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
                      By using our website, you consent to this Privacy Policy.
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">Secure</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-xs text-gray-400">Encrypted</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-xs text-gray-400">Trusted</span>
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

export default PrivacyPolicy;