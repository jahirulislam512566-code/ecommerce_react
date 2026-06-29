import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { assets } from '../assets/assets';
import { useLocation, useNavigate } from 'react-router-dom';

// ============================================================
// Constants
// ============================================================
const SEARCH_DELAY = 300; // Debounce delay in milliseconds
const PLACEHOLDER_TEXTS = [
  'Search products...',
  'Find your favorite items...',
  'Explore our collection...',
  'What are you looking for?',
];

// ============================================================
// SearchBar Component
// ============================================================
export const SearchBar = ({
  className = '',
  placeholder = 'Search products...',
  autoFocus = true,
  showOnCollectionOnly = true,
  onSearchChange,
  onSearchSubmit,
}) => {
  // --- Hooks ---
  const { searchQuery, setSearchQuery, showSearchBar, setShowSearchBar } = useShop();
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [isVisible, setIsVisible] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // --- Memoized Values ---
  const isCollectionPage = useCallback(() => {
    return location.pathname.includes('collection');
  }, [location.pathname]);

  // --- Handlers ---
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setLocalSearch(value);
    setSearchQuery(value);
    
    // Generate suggestions
    if (value.trim().length > 1) {
      // This would ideally come from your backend or product list
      const mockSuggestions = [
        `${value} - in stock`,
        `${value} - popular`,
        `${value} - new arrivals`,
      ].slice(0, 3);
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    if (onSearchChange) {
      onSearchChange(value);
    }
  }, [setSearchQuery, onSearchChange]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    const searchTerm = localSearch.trim();
    
    if (!searchTerm) {
      return;
    }

    // Save to recent searches
    setRecentSearches(prev => {
      const updated = [searchTerm, ...prev.filter(s => s !== searchTerm)];
      return updated.slice(0, 5); // Keep only last 5
    });

    // Navigate to collection with search query
    if (!location.pathname.includes('collection')) {
      navigate('/collection');
    }

    // Close suggestions
    setShowSuggestions(false);

    if (onSearchSubmit) {
      onSearchSubmit(searchTerm);
    }
  }, [localSearch, location.pathname, navigate, onSearchSubmit]);

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    setSearchQuery('');
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [setSearchQuery]);

  const handleCloseSearch = useCallback(() => {
    setShowSearchBar(false);
    setShowSuggestions(false);
    setLocalSearch('');
    setSearchQuery('');
  }, [setShowSearchBar, setSearchQuery]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleCloseSearch();
    }
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  }, [handleCloseSearch, handleSearchSubmit]);

  const handleRecentSearchClick = useCallback((term) => {
    setLocalSearch(term);
    setSearchQuery(term);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Trigger search
    if (!location.pathname.includes('collection')) {
      navigate('/collection');
    }
  }, [setSearchQuery, location.pathname, navigate]);

  // --- Effects ---
  // Visibility logic
  useEffect(() => {
    if (showOnCollectionOnly) {
      setIsVisible(isCollectionPage());
    } else {
      setIsVisible(true);
    }
  }, [location.pathname, showOnCollectionOnly, isCollectionPage]);

  // Focus input when search bar becomes visible
  useEffect(() => {
    if (showSearchBar && isVisible && autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [showSearchBar, isVisible, autoFocus]);

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, SEARCH_DELAY);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }, [recentSearches]);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDER_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // Render
  // ============================================================
  if (!showSearchBar || !isVisible) {
    return null;
  }

  return (
    <div className={`border-t border-b bg-gray-50/80 backdrop-blur-sm ${className}`}>
      <div className="container mx-auto px-4 py-3 relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="inline-flex items-center justify-between w-full max-w-3xl mx-auto">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
              <img 
                className="w-4 h-4 opacity-50" 
                src={assets.search_icon} 
                alt="Search" 
              />
              <input
                ref={inputRef}
                value={localSearch}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (localSearch.trim().length > 1) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay closing suggestions to allow clicks
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="flex-1 outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400 min-w-0"
                type="text"
                placeholder={PLACEHOLDER_TEXTS[placeholderIndex % PLACEHOLDER_TEXTS.length]}
                aria-label="Search products"
                autoComplete="off"
              />
              
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseSearch}
              className="ml-3 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <img className="w-4 h-4" src={assets.cross_icon} alt="Close" />
            </button>
          </div>
        </form>

        {/* Search Suggestions */}
        {showSuggestions && (localSearch.trim().length > 1 || recentSearches.length > 0) && (
          <div className="absolute left-0 right-0 top-full mt-1 mx-auto max-w-3xl bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {/* Recent Searches */}
            {recentSearches.length > 0 && !localSearch.trim() && (
              <div className="p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Recent Searches</p>
                <div className="space-y-1">
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(term)}
                      className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
                    >
                      <span className="text-gray-400 text-xs">🕐</span>
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Suggestions */}
            {localSearch.trim().length > 1 && suggestions.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Suggestions</p>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setLocalSearch(suggestion);
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View All Results */}
            {localSearch.trim().length > 1 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleSearchSubmit}
                  className="w-full text-center text-sm text-black font-medium hover:text-gray-600 transition-colors"
                >
                  View all results for "{localSearch}"
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default SearchBar;

// ============================================================
// Optional: SearchBar with Autocomplete
// ============================================================
export const SearchBarWithAutocomplete = ({
  products = [],
  ...props
}) => {
  const { searchQuery, setSearchQuery } = useShop();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (searchQuery && searchQuery.trim().length > 1 && products.length > 0) {
      const filtered = products
        .filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.subCategory?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

  const handleProductSelect = useCallback((product) => {
    setSearchQuery(product.name);
    // Navigate to product detail
    // navigate(`/product/${product._id}`);
  }, [setSearchQuery]);

  return (
    <div className="relative">
      <SearchBar {...props} />
      
      {/* Product Suggestions */}
      {searchQuery && searchQuery.trim().length > 1 && filteredProducts.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 mx-auto max-w-3xl bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {filteredProducts.map((product) => (
            <button
              key={product._id}
              onClick={() => handleProductSelect(product)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
            >
              <img
                src={Array.isArray(product.image) ? product.image[0] : product.image}
                alt={product.name}
                className="w-10 h-10 object-cover rounded"
              />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">{product.category}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                ${product.price}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Optional: SearchBar with Voice Input
// ============================================================
export const SearchBarWithVoice = ({ ...props }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);
      
      if (result.isFinal) {
        props.setSearchQuery?.(text);
        setIsListening(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [props]);

  return (
    <div className="relative">
      <SearchBar {...props} />
      
      <button
        onClick={handleVoiceSearch}
        className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
          isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:text-gray-600'
        }`}
        aria-label="Voice search"
        type="button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
      
      {isListening && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
          <p className="text-sm text-gray-600">
            Listening... <span className="text-gray-400">{transcript || 'Speak now'}</span>
          </p>
        </div>
      )}
    </div>
  );
};