import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Hero } from '../components/Hero';
import { LatestCollection } from '../components/LatestCollection';
import { BestSeller } from '../components/BestSeller';
import { NewsletterBox } from '../components/NewsletterBox';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';

// ============================================================
// Constants
// ============================================================
const QUICK_ACTIONS = [
  { icon: '🛒', label: 'New Arrivals', path: '/collection?sort=newest', color: 'from-blue-500 to-blue-600' },
  { icon: '🔥', label: 'Best Sellers', path: '/collection?filter=bestseller', color: 'from-orange-500 to-orange-600' },
  { icon: '💎', label: 'Premium', path: '/collection?category=premium', color: 'from-purple-500 to-purple-600' },
  { icon: '🎯', label: 'Sale', path: '/collection?filter=sale', color: 'from-red-500 to-red-600' },
];

const FEATURED_CATEGORIES = [
  { id: 'men', name: 'Men', image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=600&h=400&fit=crop', count: '120+', color: 'from-blue-900 to-blue-700' },
  { id: 'women', name: 'Women', image: 'https://images.unsplash.com/photo-1515372035064-7a20f1c7192f?w=600&h=400&fit=crop', count: '150+', color: 'from-pink-900 to-pink-700' },
  { id: 'kids', name: 'Kids', image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop', count: '80+', color: 'from-green-900 to-green-700' },
  { id: 'accessories', name: 'Accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=400&fit=crop', count: '60+', color: 'from-yellow-900 to-yellow-700' },
];

// ============================================================
// Lazy Loading for Performance
// ============================================================
const Testimonials = lazy(() => 
  import('../components/Testimonials').then(module => ({
    default: module.Testimonials
  }))
);

const BrandShowcase = lazy(() => 
  import('../components/BrandShowcase').then(module => ({
    default: module.BrandShowcase
  }))
);

// ============================================================
// Loading Fallback Component
// ============================================================
const SectionLoader = () => (
  <div className="flex justify-center items-center py-12">
    <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
  </div>
);

// ============================================================
// FeaturedCategory Component
// ============================================================
const FeaturedCategory = ({ category }) => (
  <Link 
    to={`/collection?category=${category.id}`}
    className="group relative overflow-hidden rounded-2xl aspect-[4/3] hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
  >
    {/* Background Image */}
    <div className="absolute inset-0 bg-gradient-to-br ${category.color}">
      <img 
        src={category.image} 
        alt={category.name}
        className="w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
    
    {/* Content */}
    <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
      <h3 className="text-2xl md:text-3xl font-bold">{category.name}</h3>
      <p className="text-white/80 text-sm mt-1">{category.count} products</p>
      <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Shop Now 
        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </Link>
);

// ============================================================
// QuickAction Component
// ============================================================
const QuickAction = ({ action }) => (
  <Link
    to={action.path}
    className="group flex flex-col items-center gap-2 p-4 sm:p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-gray-200"
  >
    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl sm:text-3xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      {action.icon}
    </div>
    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
      {action.label}
    </span>
  </Link>
);

// ============================================================
// Home Component
// ============================================================
export const Home = ({
  showLatestCollection = true,
  showBestSellers = true,
  showNewsletter = true,
  showFeaturedCategories = true,
  showTestimonials = true,
  showBrandShowcase = true,
  showQuickActions = true,
  heroSlides = undefined,
  className = '',
}) => {
  // --- Hooks ---
  const { products, isLoadingProducts } = useShop();
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // --- Effects ---
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // --- Handlers ---
  const handleViewAllClick = useCallback((section) => {
    if (window.gtag) {
      window.gtag('event', 'view_all_click', {
        event_category: 'engagement',
        event_label: section,
      });
    }
  }, []);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      {/* ===== Hero Section ===== */}
      <Hero 
        slides={heroSlides}
        autoPlay={true}
        autoPlayInterval={5000}
        className="mb-6 sm:mb-8 md:mb-12"
        height="min-h-[350px] sm:min-h-[450px] md:min-h-[550px] lg:min-h-[650px]"
      />

      {/* ===== Quick Actions ===== */}
      {showQuickActions && (
        <div className="container mx-auto px-3 sm:px-4 -mt-8 sm:-mt-12 md:-mt-16 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {QUICK_ACTIONS.map((action) => (
              <QuickAction key={action.label} action={action} />
            ))}
          </div>
        </div>
      )}

      {/* ===== Featured Categories ===== */}
      {showFeaturedCategories && (
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Find what you're looking for</p>
            </div>
            <Link 
              to="/collection" 
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1 group"
            >
              View All
              <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {FEATURED_CATEGORIES.map((category) => (
              <FeaturedCategory key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}

      {/* ===== Brand Showcase ===== */}
      {showBrandShowcase && (
        <div className="container mx-auto px-3 sm:px-4 mb-8 sm:mb-12 md:mb-16">
          <Suspense fallback={<SectionLoader />}>
            <BrandShowcase />
          </Suspense>
        </div>
      )}

      {/* ===== Latest Collection ===== */}
      {showLatestCollection && (
        <div className={`container mx-auto px-3 sm:px-4 transition-opacity duration-700 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <LatestCollection 
            displayCount={8}
            onViewAll={() => handleViewAllClick('latest')}
          />
        </div>
      )}

      {/* ===== Best Sellers ===== */}
      {showBestSellers && (
        <div className={`container mx-auto px-3 sm:px-4 transition-opacity duration-700 delay-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <BestSeller 
            displayCount={8}
            onViewAll={() => handleViewAllClick('bestsellers')}
          />
        </div>
      )}

      {/* ===== Testimonials ===== */}
      {showTestimonials && (
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
          <Suspense fallback={<SectionLoader />}>
            <Testimonials />
          </Suspense>
        </div>
      )}

      {/* ===== Newsletter ===== */}
      {showNewsletter && (
        <div className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12 md:pb-16">
          <NewsletterBox 
            className="mb-8 sm:mb-12"
            title="Subscribe & Get 20% Off"
            subtitle="Be the first to know about new arrivals, sales, and exclusive offers"
            buttonText="Subscribe Now"
            placeholder="Enter your email address"
          />
        </div>
      )}

      {/* ===== Loading Overlay ===== */}
      {isLoadingProducts && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-xs sm:text-sm text-gray-500">Loading your shopping experience...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Home;

// ============================================================
// Optional: Home with Promotional Banner
// ============================================================
export const HomeWithPromo = ({
  promoBanner = {
    show: true,
    text: '🎉 Free Shipping on orders over ৳500',
    link: '/collection',
    bgColor: 'bg-black',
    textColor: 'text-white',
  },
  ...props
}) => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const handleDismissBanner = useCallback(() => {
    setIsBannerVisible(false);
    sessionStorage.setItem('promoBannerDismissed', 'true');
  }, []);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('promoBannerDismissed');
    if (dismissed === 'true') {
      setIsBannerVisible(false);
    }
  }, []);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {promoBanner.show && isBannerVisible && (
        <div className={`${promoBanner.bgColor} ${promoBanner.textColor} py-2 sm:py-3 px-3 sm:px-4 text-center relative overflow-hidden`}>
          <div className="container mx-auto">
            <p className="text-xs sm:text-sm md:text-base font-medium">
              {promoBanner.text}
              {promoBanner.link && (
                <Link 
                  to={promoBanner.link} 
                  className="ml-2 underline hover:opacity-80 transition-opacity"
                >
                  Shop Now →
                </Link>
              )}
            </p>
          </div>
          <button
            onClick={handleDismissBanner}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-current opacity-70 hover:opacity-100 transition-opacity text-sm sm:text-base"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}
      
      <Home {...props} />
    </div>
  );
};

// ============================================================
// Optional: Home with Seasonal Collection
// ============================================================
export const HomeWithSeasonal = ({ ...props }) => {
  const [seasonalCollection, setSeasonalCollection] = useState(null);

  const getSeason = useCallback(() => {
    const month = new Date().getMonth();
    const seasons = {
      'Spring': { emoji: '🌸', months: [2, 3, 4], color: 'from-pink-500 to-rose-500' },
      'Summer': { emoji: '☀️', months: [5, 6, 7], color: 'from-orange-500 to-yellow-500' },
      'Fall': { emoji: '🍂', months: [8, 9, 10], color: 'from-amber-500 to-orange-500' },
      'Winter': { emoji: '❄️', months: [11, 0, 1], color: 'from-blue-500 to-cyan-500' },
    };
    
    for (const [season, data] of Object.entries(seasons)) {
      if (data.months.includes(month)) {
        return { ...data, name: season };
      }
    }
    return { name: 'Winter', emoji: '❄️', color: 'from-blue-500 to-cyan-500' };
  }, []);

  useEffect(() => {
    const season = getSeason();
    setSeasonalCollection({
      ...season,
      title: `${season.name} Collection`,
      description: `Explore our curated ${season.name.toLowerCase()} collection with the latest trends and styles.`,
    });
  }, [getSeason]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {seasonalCollection && (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className={`relative bg-gradient-to-r ${seasonalCollection.color} rounded-2xl overflow-hidden p-6 sm:p-8 md:p-12 text-white shadow-xl`}>
            <div className="relative z-10 max-w-lg">
              <div className="text-3xl sm:text-4xl mb-2">{seasonalCollection.emoji}</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                {seasonalCollection.title}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm md:text-base mb-4">
                {seasonalCollection.description}
              </p>
              <Link
                to={`/collection?season=${seasonalCollection.name.toLowerCase()}`}
                className="inline-block px-4 sm:px-6 py-2 bg-white text-black font-medium text-sm sm:text-base rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
              >
                Explore Now →
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 text-6xl sm:text-8xl md:text-9xl transform translate-x-4 translate-y-4">
              {seasonalCollection.emoji}
            </div>
          </div>
        </div>
      )}

      <Home {...props} />
    </div>
  );
};

// ============================================================
// Optional: Home with Deals of the Day
// ============================================================
export const HomeWithDeals = ({ ...props }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Deals Banner */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl overflow-hidden p-6 sm:p-8 md:p-10 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-red-200">Limited Time Offer</p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">Deals of the Day</h3>
              <p className="text-red-100 text-xs sm:text-sm mt-1">Up to 50% off on selected items</p>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] sm:min-w-[60px]">
                  <span className="text-xl sm:text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-red-200 mt-1">Hours</p>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] sm:min-w-[60px]">
                  <span className="text-xl sm:text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-red-200 mt-1">Mins</p>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] sm:min-w-[60px]">
                  <span className="text-xl sm:text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-red-200 mt-1">Secs</p>
              </div>
            </div>
          </div>
          
          <Link
            to="/collection?filter=sale"
            className="inline-block mt-4 px-6 py-2 bg-white text-red-600 font-medium text-sm rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Shop Deals →
          </Link>
        </div>
      </div>

      <Home {...props} />
    </div>
  );
};