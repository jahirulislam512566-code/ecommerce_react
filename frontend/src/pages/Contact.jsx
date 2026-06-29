import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Title, SectionTitle, AnimatedTitle } from '../components/Title';
import { assets } from '../assets/assets';
import { NewsletterBox } from '../components/NewsletterBox';
import { toast } from 'react-toastify';
import axios from 'axios';

// ============================================================
// Constants
// ============================================================
const CONTACT_INFO = {
  address: {
    line1: '54709 Willms Station',
    line2: 'Suite 350, Washington, USA',
    mapUrl: 'https://maps.google.com',
  },
  phone: '(415) 555-0132',
  email: 'admin@forever.com',
  workingHours: {
    weekdays: 'Mon - Fri: 9:00 AM - 8:00 PM',
    weekend: 'Sat - Sun: 10:00 AM - 6:00 PM',
  },
};

const SOCIAL_LINKS = [
  { name: 'Facebook', icon: '📘', url: 'https://facebook.com' },
  { name: 'Instagram', icon: '📸', url: 'https://instagram.com' },
  { name: 'Twitter', icon: '🐦', url: 'https://twitter.com' },
  { name: 'YouTube', icon: '▶️', url: 'https://youtube.com' },
  { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com' },
];

// ============================================================
// ContactForm Component
// ============================================================
const ContactForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

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
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  }, [formData, onSubmit, validateForm]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all
              ${errors.name 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-black focus:border-black'
              }
            `}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all
              ${errors.email 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-black focus:border-black'
              }
            `}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all
            ${errors.subject 
              ? 'border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:ring-black focus:border-black'
            }
          `}
          placeholder="How can we help?"
        />
        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-y
            ${errors.message 
              ? 'border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:ring-black focus:border-black'
            }
          `}
          placeholder="Tell us how we can assist you..."
        />
        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
        <p className="text-xs text-gray-400 mt-1">
          Minimum 10 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
};

// ============================================================
// ContactInfoCard Component
// ============================================================
const ContactInfoCard = ({ icon, title, content, link }) => {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300">
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold text-sm text-gray-700">{title}</h4>
        {link ? (
          <a href={link} className="text-sm text-gray-500 hover:text-black transition-colors">
            {content}
          </a>
        ) : (
          <p className="text-sm text-gray-500">{content}</p>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Main Contact Component
// ============================================================
export const Contact = ({
  titleText1 = 'CONTACT',
  titleText2 = 'US',
  storeAddress = CONTACT_INFO.address,
  phone = CONTACT_INFO.phone,
  email = CONTACT_INFO.email,
  workingHours = CONTACT_INFO.workingHours,
  showMap = true,
  showSocialLinks = true,
  backendUrl,
  className = '',
}) => {
  // --- State ---
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef(null);

  // --- Handlers ---
  const handleFormSubmit = useCallback(async (formData) => {
    try {
      setIsLoading(true);

      // Send to backend if URL provided
      if (backendUrl) {
        const response = await axios.post(
          `${backendUrl}/api/contact`,
          formData,
          { timeout: 10000 }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to send message');
        }
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Contact form submitted:', formData);
      }

      // Success
      setIsSubmitted(true);
      toast.success('Thank you for your message! We\'ll get back to you soon.');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        if (formRef.current) {
          formRef.current.reset();
        }
      }, 3000);

      // Analytics tracking
      if (window.gtag) {
        window.gtag('event', 'contact_form_submit', {
          event_category: 'engagement',
          event_label: formData.subject,
        });
      }

    } catch (error) {
      console.error('Contact form error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  // --- Scroll to top on mount ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`${className}`}>
      {/* ===== Hero Section ===== */}
      <div className="relative bg-gradient-to-r from-gray-50 to-white py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <AnimatedTitle
              text1={titleText1}
              text2={titleText2}
              align="center"
              size="xl"
              animation="fade"
              className="mb-4"
            />
            <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
              We'd love to hear from you. Reach out to us for any inquiries, feedback, or support.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Contact Content ===== */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Side: Contact Info & Map */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h3>
              
              <div className="space-y-3">
                <ContactInfoCard
                  icon="📍"
                  title="Visit Us"
                  content={`${storeAddress.line1}, ${storeAddress.line2}`}
                  link={storeAddress.mapUrl}
                />
                <ContactInfoCard
                  icon="📞"
                  title="Call Us"
                  content={phone}
                  link={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                />
                <ContactInfoCard
                  icon="✉️"
                  title="Email Us"
                  content={email}
                  link={`mailto:${email}`}
                />
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Working Hours</h4>
              <div className="space-y-1 text-sm text-gray-500">
                <p>{workingHours.weekdays}</p>
                <p>{workingHours.weekend}</p>
              </div>
            </div>

            {/* Social Links */}
            {showSocialLinks && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Follow Us</h4>
                <div className="flex gap-3">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-black transition-all duration-300 transform hover:scale-110"
                      aria-label={social.name}
                    >
                      <span className="text-xl">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {showMap && (
              <div className="mt-4 rounded-lg overflow-hidden shadow-md border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.906455357933!2d-77.03642368464844!3d38.89795727957068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7b7b7b7b7b7b7%3A0x0!2zMzjCsDUzJzUyLjYiTiA3N8KwMDInMDYuNiJX!5e0!3m2!1sen!2sus!4v1234567890"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Store Location"
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Send us a Message</h3>
              <p className="text-sm text-gray-500 mt-1">
                We'll respond within 24 hours
              </p>
            </div>

            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h4 className="text-lg font-semibold text-gray-800">Message Sent!</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Thank you for reaching out. We'll get back to you shortly.
                </p>
              </div>
            ) : (
              <ContactForm
                ref={formRef}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* ===== FAQ Section ===== */}
      <div className="bg-gray-50 py-12 md:py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Frequently Asked Questions"
            subtitle="Quick answers to common inquiries"
            align="center"
            text1=""
            text2=""
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto">
            {[
              {
                q: 'What are your shipping options?',
                a: 'We offer standard and express shipping options. Free shipping on orders over $100.',
              },
              {
                q: 'How do I track my order?',
                a: 'You will receive a tracking number via email once your order ships.',
              },
              {
                q: 'What is your return policy?',
                a: 'We accept returns within 30 days of purchase. Items must be in original condition.',
              },
              {
                q: 'Do you offer international shipping?',
                a: 'Yes, we ship to select countries worldwide. Check our shipping page for details.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-semibold text-sm text-gray-800 mb-1">{faq.q}</h4>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Newsletter ===== */}
      <NewsletterBox className="mt-8" />
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Contact;

// ============================================================
// Optional: Contact with Support Hours
// ============================================================
export const ContactWithSupport = ({ ...props }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simulate online/offline status
    const hours = new Date().getHours();
    setIsOnline(hours >= 9 && hours <= 20);
  }, []);

  return (
    <div>
      <Contact {...props} />
      
      {/* Live Support Banner */}
      <div className="fixed bottom-20 right-6 z-40">
        <div className={`
          flex items-center gap-3 bg-white rounded-lg shadow-lg p-3 border
          ${isOnline ? 'border-green-200' : 'border-gray-200'}
        `}>
          <div className={`
            w-2 h-2 rounded-full animate-pulse
            ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
          `} />
          <div>
            <p className="text-xs font-medium">
              {isOnline ? 'Live Support Online' : 'Offline'}
            </p>
            <p className="text-xs text-gray-400">
              {isOnline ? 'We\'re here to help!' : 'Back at 9:00 AM'}
            </p>
          </div>
          {isOnline && (
            <button className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors">
              Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};