import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Title, SectionTitle, AnimatedTitle } from '../components/Title';
import { assets } from '../assets/assets';
import { NewsletterBox } from '../components/NewsletterBox';
import { Link } from 'react-router-dom';

// ============================================================
// Constants
// ============================================================
const WHY_CHOOSE_US = [
  {
    id: 1,
    icon: '✅',
    title: 'Quality Assurance',
    description: 'We meticulously select and vet each product to ensure it meets our stringent quality standards.',
    color: 'border-green-200 bg-green-50/50',
  },
  {
    id: 2,
    icon: '🛍️',
    title: 'Convenience',
    description: 'With our user-friendly interface and hassle-free ordering process, shopping has never been easier.',
    color: 'border-blue-200 bg-blue-50/50',
  },
  {
    id: 3,
    icon: '💎',
    title: 'Exceptional Customer Service',
    description: 'Our team of dedicated professionals is here to assist you every step of the way, ensuring your satisfaction is our top priority.',
    color: 'border-purple-200 bg-purple-50/50',
  },
  {
    id: 4,
    icon: '🌱',
    title: 'Sustainable Practices',
    description: 'We are committed to eco-friendly materials and sustainable production methods to protect our planet.',
    color: 'border-emerald-200 bg-emerald-50/50',
  },
  {
    id: 5,
    icon: '🚀',
    title: 'Fast Delivery',
    description: 'Enjoy quick and reliable shipping with real-time tracking for all your orders.',
    color: 'border-orange-200 bg-orange-50/50',
  },
  {
    id: 6,
    icon: '🔄',
    title: 'Easy Returns',
    description: 'Hassle-free returns within 30 days. Your satisfaction is guaranteed.',
    color: 'border-red-200 bg-red-50/50',
  },
];

const COMPANY_VALUES = [
  {
    id: 1,
    title: 'Integrity',
    description: 'We operate with transparency and honesty in everything we do.',
    icon: '🤝',
  },
  {
    id: 2,
    title: 'Innovation',
    description: 'We continuously evolve to bring you the latest in fashion and technology.',
    icon: '💡',
  },
  {
    id: 3,
    title: 'Community',
    description: 'We build connections and foster a community of fashion enthusiasts.',
    icon: '🌍',
  },
  {
    id: 4,
    title: 'Excellence',
    description: 'We strive for excellence in quality, service, and customer experience.',
    icon: '⭐',
  },
];

// ============================================================
// StatCard Component
// ============================================================
const StatCard = ({ number, label, icon, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = parseInt(number.replace(/,/g, ''));
    if (isNaN(target)) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay || 300);

    return () => clearTimeout(timer);
  }, [number, delay]);

  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-black">{count.toLocaleString()}+</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
};

// ============================================================
// ValueCard Component
// ============================================================
const ValueCard = ({ icon, title, description }) => {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-800 text-sm mb-1">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};

// ============================================================
// Main About Component
// ============================================================
export const About = ({
  titleText1 = 'ABOUT',
  titleText2 = 'US',
  missionText = 'Our mission at Forever is to empower customers with choice, convenience, and confidence. We strive to provide a seamless shopping experience that goes beyond just a transaction, building a community where style knows no bounds.',
  showStats = true,
  showValues = true,
  className = '',
}) => {
  // --- State ---
  const [isVisible, setIsVisible] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('about-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // --- Memoized Values ---
  const stats = useMemo(() => [
    { number: '10,000+', label: 'Happy Customers', icon: '😊' },
    { number: '500+', label: 'Products', icon: '👗' },
    { number: '98%', label: 'Satisfaction Rate', icon: '⭐' },
    { number: '24/7', label: 'Customer Support', icon: '💬' },
  ], []);

  // --- Handlers ---
  const handleLearnMore = useCallback(() => {
    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'about_learn_more', {
        event_category: 'engagement',
        event_label: 'about_page',
      });
    }
  }, []);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div id="about-section" className={`${className}`}>
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
              Discover the story behind our brand and our commitment to quality fashion
            </p>
          </div>
        </div>
      </div>

      {/* ===== About Content ===== */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
          {/* Image Section */}
          <div className="w-full md:w-1/2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-black/5 to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-xl relative z-10"
                src={assets.about_img}
                alt="About Forever - Modern Fashion"
                loading="lazy"
              />
              {/* Decorative badge */}
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg z-20">
                <p className="text-sm font-medium">Est. 2020</p>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center gap-6">
            <div className="space-y-4 text-gray-600">
              <p className="text-sm md:text-base leading-relaxed">
                Forever was born out of a passion for innovation and a desire to shape the future of modern fashion. 
                Our journey started with a simple idea: to provide high-quality, trendy apparel that empowers individuals 
                to express their unique style.
              </p>
              <p className="text-sm md:text-base leading-relaxed">
                Since our inception, we've worked tirelessly to curate a collection that blends comfort with elegance. 
                From everyday essentials to statement pieces, we ensure that every item in our store meets our rigorous 
                standards of quality and sustainability.
              </p>
              
              <div className="pt-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Our Mission</h3>
                <p className="text-sm md:text-base leading-relaxed text-gray-600">
                  {missionText}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/collection"
                className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                onClick={handleLearnMore}
              >
                Explore Collection
              </Link>
              <Link
                to="/contact"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Stats Section ===== */}
      {showStats && (
        <div className="bg-gray-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <SectionTitle
              title="Our Impact"
              subtitle="Numbers that speak for themselves"
              align="center"
              text1=""
              text2=""
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
              {stats.map((stat, index) => (
                <StatCard
                  key={stat.label}
                  {...stat}
                  delay={index * 200}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== Why Choose Us ===== */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <SectionTitle
          title="Why Choose Us"
          subtitle="What makes us different"
          align="center"
          text1=""
          text2=""
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {WHY_CHOOSE_US.map((item, index) => (
            <div
              key={item.id}
              className={`
                border-2 ${item.color} rounded-xl p-6 transition-all duration-300
                hover:shadow-lg hover:-translate-y-1
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Company Values ===== */}
      {showValues && (
        <div className="bg-gray-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <SectionTitle
              title="Our Values"
              subtitle="The principles that guide us"
              align="center"
              text1=""
              text2=""
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {COMPANY_VALUES.map((value) => (
                <ValueCard
                  key={value.id}
                  icon={value.icon}
                  title={value.title}
                  description={value.description}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== CTA Section ===== */}
      <div className="container mx-auto px-4 py-12">
        <div className="relative bg-gradient-to-r from-black to-gray-800 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_#fff_0%,_transparent_50%)]" />
          </div>
          <div className="relative z-10 text-center py-12 px-6 md:py-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Start Your Style Journey?
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto mb-6">
              Join thousands of satisfied customers who trust us for their fashion needs.
            </p>
            <Link
              to="/collection"
              className="inline-block px-8 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
              onClick={handleLearnMore}
            >
              Shop Now
            </Link>
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
export default About;

// ============================================================
// Optional: About with Team Section
// ============================================================
export const AboutWithTeam = ({ ...props }) => {
  const teamMembers = [
    {
      name: 'John Doe',
      role: 'CEO & Founder',
      image: assets.about_img,
      bio: 'Fashion enthusiast with 15 years of industry experience.',
    },
    {
      name: 'Jane Smith',
      role: 'Head of Design',
      image: assets.about_img,
      bio: 'Award-winning designer with a passion for sustainable fashion.',
    },
    {
      name: 'Mike Johnson',
      role: 'Operations Manager',
      image: assets.about_img,
      bio: 'Ensuring seamless delivery and customer satisfaction.',
    },
  ];

  return (
    <div>
      <About {...props} />
      
      {/* Team Section */}
      <div className="container mx-auto px-4 py-12 md:py-16 border-t border-gray-200">
        <SectionTitle
          title="Meet the Team"
          subtitle="The people behind the brand"
          align="center"
          text1=""
          text2=""
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {teamMembers.map((member) => (
            <div key={member.name} className="text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <h3 className="font-semibold text-gray-800">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.role}</p>
              <p className="text-sm text-gray-400 mt-2">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};