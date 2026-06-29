import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

// ============================================================
// Unsplash Image URLs - 5 Different Categories (Full Width Optimized)
// ============================================================
const UNSPLASH_IMAGES = [
  {
    id: 'fashion-1',
    url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop',
    title: 'Latest Fashion Collection',
    subtitle: 'NEW ARRIVALS 2024',
    description: 'Discover our premium collection of designer wear, crafted for the modern individual.',
    category: 'Fashion',
    ctaText: 'Shop Now',
    ctaLink: '/collection',
    credit: 'Photo by Marcus Loke',
  },
  {
    id: 'fashion-2',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=1080&fit=crop',
    title: 'Summer Essentials',
    subtitle: 'SEASONAL SALE',
    description: 'Stay stylish this summer with our curated selection of must-have pieces.',
    category: 'Summer',
    ctaText: 'Explore Summer',
    ctaLink: '/collection?season=summer',
    credit: 'Photo by Christin Hume',
  },
  {
    id: 'fashion-3',
    url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=1080&fit=crop',
    title: 'Winter Collection',
    subtitle: 'UP TO 50% OFF',
    description: 'Warm up your wardrobe with our premium winter collection at unbeatable prices.',
    category: 'Winter',
    ctaText: 'Shop Winter',
    ctaLink: '/collection?season=winter',
    credit: 'Photo by Annie Spratt',
  },
  {
    id: 'fashion-4',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop',
    title: 'Accessories & More',
    subtitle: 'PERFECT COMPLEMENTS',
    description: 'Complete your look with our handpicked accessories and lifestyle products.',
    category: 'Accessories',
    ctaText: 'Shop Accessories',
    ctaLink: '/collection?category=accessories',
    credit: 'Photo by Brooke Lark',
  },
  {
    id: 'fashion-5',
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=1080&fit=crop',
    title: 'Premium Selection',
    subtitle: 'BEST SELLERS',
    description: 'Shop our most popular items loved by thousands of customers worldwide.',
    category: 'Bestsellers',
    ctaText: 'View Bestsellers',
    ctaLink: '/collection?sort=bestselling',
    credit: 'Photo by Nikita Kachanovsky',
  },
];

// ============================================================
// HeroSlide Component
// ============================================================
const HeroSlide = ({ slide, isActive, onCtaClick, slideIndex }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isActive]);

  // Preload image
  useEffect(() => {
    const img = new Image();
    img.src = slide.url;
    img.onload = () => setImageLoaded(true);
  }, [slide.url]);

  return (
    <div 
      className={`
        absolute inset-0 w-full h-full transition-all duration-700 ease-in-out
        ${isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}
      `}
    >
      {/* Background Image - Full Width */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        {/* Shimmer Loading Effect */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer" />
        )}
        
        <img
          src={slide.url}
          alt={slide.title}
          className={`
            w-full h-full object-cover object-center
            transform transition-all duration-1000
            ${isActive ? 'scale-100' : 'scale-110'}
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          loading={isActive ? 'eager' : 'lazy'}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Multiple Gradient Overlays for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
      </div>

      {/* Content Overlay - Left Aligned */}
      <div className="relative h-full flex items-center px-4 sm:px-8 lg:px-16 xl:px-24">
        <div className={`
          w-full max-w-2xl transform transition-all duration-700 delay-200
          ${showContent ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
        `}>
          {/* Category Badge */}
          {slide.category && (
            <div className="inline-block mb-4 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold tracking-wider rounded-full">
              {slide.category}
            </div>
          )}

          {/* Subtitle with Decorative Line */}
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-0.5 bg-gradient-to-r from-white to-transparent" />
            <span className="text-white/80 font-medium text-xs md:text-sm tracking-[0.2em] uppercase">
              {slide.subtitle}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-white font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            {slide.title}
          </h1>

          {/* Description */}
          {slide.description && (
            <p className="text-white/80 text-sm md:text-base lg:text-lg mt-4 max-w-lg leading-relaxed">
              {slide.description}
            </p>
          )}

          {/* CTA Section */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to={slide.ctaLink || '/collection'}
              onClick={() => onCtaClick?.(slideIndex)}
              className="group inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-semibold text-sm uppercase tracking-wider rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {slide.ctaText || 'Shop Now'}
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link
              to="/collection"
              className="group inline-flex items-center gap-2 px-8 py-3 border border-white/30 text-white font-medium text-sm uppercase tracking-wider rounded-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Explore More
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/70">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs">Easy Returns</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Credit */}
      {slide.credit && (
        <div className="absolute bottom-4 right-4 text-white/30 text-[10px] tracking-wider z-20">
          {slide.credit}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Main Hero Component - Full Width Dynamic Slider
// ============================================================
export const Hero = ({
  slides = UNSPLASH_IMAGES,
  autoPlay = true,
  autoPlayInterval = 5000,
  showIndicators = true,
  showArrows = true,
  showProgress = true,
  className = '',
  height = 'h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]',
  slideDirection = 'left-to-right', // 'left-to-right' or 'right-to-left'
  transitionType = 'fade', // 'fade', 'slide', 'zoom'
}) => {
  // --- State ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  // --- Memoized Values ---
  const totalSlides = useMemo(() => slides.length, [slides.length]);

  // --- Handlers ---
  const goToSlide = useCallback((index) => {
    if (index === currentSlide || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setProgress(0);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [currentSlide, isTransitioning]);

  const goToNextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % totalSlides);
  }, [currentSlide, totalSlides, goToSlide]);

  const goToPrevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
  }, [currentSlide, totalSlides, goToSlide]);

  const handleCtaClick = useCallback((slideIndex) => {
    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'hero_cta_click', {
        event_category: 'engagement',
        event_label: `slide_${slideIndex}`,
      });
    }
  }, []);

  // --- Touch Handlers ---
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEndX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX || !touchEndX) return;
    
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }
    setTouchStartX(0);
    setTouchEndX(0);
  }, [touchStartX, touchEndX, goToNextSlide, goToPrevSlide]);

  // --- Effects ---
  // Auto-play with progress
  useEffect(() => {
    if (!autoPlay || isPaused || totalSlides <= 1) return;

    const interval = 50;
    let currentProgress = 0;
    
    const timer = setInterval(() => {
      currentProgress += (interval / autoPlayInterval) * 100;
      if (currentProgress >= 100) {
        currentProgress = 0;
        goToNextSlide();
      }
      setProgress(currentProgress);
    }, interval);

    return () => {
      clearInterval(timer);
      setProgress(0);
    };
  }, [autoPlay, isPaused, autoPlayInterval, goToNextSlide, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextSlide();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevSlide, goToNextSlide]);

  // ============================================================
  // Render
  // ============================================================
  if (totalSlides === 0) return null;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: 'auto' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Hero carousel"
    >
      {/* Slides Container */}
      <div className={`relative w-full ${height}`}>
        {slides.map((slide, index) => (
          <HeroSlide
            key={slide.id || index}
            slide={slide}
            isActive={index === currentSlide}
            onCtaClick={handleCtaClick}
            slideIndex={index}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {showProgress && totalSlides > 1 && (
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-white/80 text-xs font-medium">
              {String(currentSlide + 1).padStart(2, '0')}
            </span>
            <div className="w-20 sm:w-32 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white/80 text-xs font-medium">
              {String(totalSlides).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {showArrows && totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 
                     bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white 
                     rounded-full p-2 sm:p-3 transition-all duration-300
                     hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white
                     disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
            disabled={isTransitioning}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 
                     bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white 
                     rounded-full p-2 sm:p-3 transition-all duration-300
                     hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white
                     disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
            disabled={isTransitioning}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showIndicators && totalSlides > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                transition-all duration-300 rounded-full
                ${index === currentSlide 
                  ? 'w-8 h-1.5 bg-white' 
                  : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/70'
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .slide-left-to-right {
          animation: slideInLeft 0.7s ease-out forwards;
        }

        .slide-right-to-left {
          animation: slideInRight 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Hero;