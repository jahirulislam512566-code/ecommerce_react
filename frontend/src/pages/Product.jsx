import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { assets } from '../assets/assets';
import { RelatedProducts, RelatedProductsWithFallback } from '../components/RelatedProducts';
import { toast } from 'react-toastify';

// ============================================================
// Constants
// ============================================================
const TABS = {
  DESCRIPTION: 'description',
  REVIEWS: 'reviews',
  SPECIFICATIONS: 'specifications',
};

const STAR_ICONS = {
  filled: assets.star_icon,
  empty: assets.star_dull_icon,
};

// ============================================================
// Product Component
// ============================================================
export const Product = () => {
  // --- Hooks ---
  const { productId } = useParams();
  const navigate = useNavigate();
  const { 
    products, 
    currency, 
    addToCart, 
    isLoadingProducts,
    isAuthenticated,
    token
  } = useShop();
  
  // --- State ---
  const [productData, setProductData] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeTab, setActiveTab] = useState(TABS.DESCRIPTION);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // --- Memoized Values ---
  const productImages = useMemo(() => {
    if (!productData) return [];
    return Array.isArray(productData.image) 
      ? productData.image 
      : productData.image 
        ? [productData.image] 
        : [assets.placeholder];
  }, [productData]);

  const averageRating = useMemo(() => {
    if (!productData?.reviews || productData.reviews.length === 0) return 0;
    const sum = productData.reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0);
    return (sum / productData.reviews.length).toFixed(1);
  }, [productData]);

  const reviewCount = useMemo(() => {
    return productData?.reviews?.length || 0;
  }, [productData]);

  const inStock = useMemo(() => {
    return productData?.stock > 0;
  }, [productData]);

  const displayPrice = useMemo(() => {
    if (!productData) return '0';
    return productData.price.toLocaleString();
  }, [productData]);

  // --- Handlers ---
  const fetchProductData = useCallback(() => {
    if (!products || products.length === 0) {
      setProductData(null);
      return;
    }

    const item = products.find((item) => item._id === productId || item.id === productId);
    
    if (item) {
      setProductData(item);
      setSelectedImage(Array.isArray(item.image) ? item.image[0] : (item.image || assets.placeholder));
      setSelectedSize('');
      setQuantity(1);
      setActiveTab(TABS.DESCRIPTION);
    } else {
      toast.error('Product not found');
      navigate('/collection');
    }
  }, [products, productId, navigate]);

  const handleAddToCart = useCallback(async () => {
    if (!isAuthenticated) {
      toast.warning('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size before adding to cart');
      return;
    }

    if (!inStock) {
      toast.error('This product is currently out of stock');
      return;
    }

    if (!productData) {
      toast.error('Product data not available');
      return;
    }

    setIsAddingToCart(true);

    try {
      await addToCart(productData._id, selectedSize, quantity);
      toast.success(`${quantity} item${quantity > 1 ? 's' : ''} added to cart! 🛒`);
      // Don't reset quantity or size so user can add more
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      if (error.message?.includes('login')) {
        toast.error('Please login to add items to cart');
        navigate('/login');
      } else if (error.message?.includes('stock')) {
        toast.error('Not enough stock available');
      } else {
        toast.error(error.message || 'Failed to add item to cart');
      }
    } finally {
      setIsAddingToCart(false);
    }
  }, [selectedSize, inStock, addToCart, productData, quantity, isAuthenticated, navigate]);

  const handleImageClick = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  const handleSizeSelect = useCallback((size) => {
    setSelectedSize(prev => prev === size ? '' : size);
  }, []);

  const handleQuantityChange = useCallback((newQuantity) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (productData?.stock && newQuantity > productData.stock) {
      setQuantity(productData.stock);
      toast.warning(`Only ${productData.stock} items available in stock`);
    } else {
      setQuantity(newQuantity);
    }
  }, [productData]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // --- Effects ---
  useEffect(() => {
    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProductData]);

  useEffect(() => {
    if (isLoadingProducts) {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoadingProducts]);

  // ============================================================
  // Render Helpers
  // ============================================================
  const renderRatingStars = useCallback((rating = 0, total = 5) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = total - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <img key={`full-${i}`} src={STAR_ICONS.filled} alt="Star" className="w-3.5 h-3.5" />
        ))}
        {hasHalfStar && (
          <img src={STAR_ICONS.filled} alt="Half star" className="w-3.5 h-3.5 opacity-50" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <img key={`empty-${i}`} src={STAR_ICONS.empty} alt="Empty star" className="w-3.5 h-3.5" />
        ))}
      </div>
    );
  }, []);

  const renderThumbnails = useCallback(() => {
    if (productImages.length <= 1) return null;

    return productImages.map((item, index) => (
      <img
        key={index}
        onClick={() => handleImageClick(item)}
        src={item}
        alt={`Product thumbnail ${index + 1}`}
        className={`
          w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border rounded 
          transition-all duration-300 object-cover aspect-square
          ${item === selectedImage 
            ? 'border-black scale-[0.98] shadow-md' 
            : 'border-gray-200 opacity-70 hover:opacity-100 hover:scale-105'
          }
        `}
        loading="lazy"
      />
    ));
  }, [productImages, selectedImage, handleImageClick]);

  const renderDescriptionTab = useCallback(() => {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          {productData?.description || 'No description available for this product.'}
        </p>
        {productData?.features && productData.features.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2">Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {productData.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        {productData?.materials && (
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2">Materials:</h4>
            <p className="text-sm text-gray-600">{productData.materials}</p>
          </div>
        )}
      </div>
    );
  }, [productData]);

  const renderReviewsTab = useCallback(() => {
    if (!productData?.reviews || productData.reviews.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No customer reviews yet</p>
          <p className="text-xs text-gray-300 mt-1">Be the first to review this product</p>
          {isAuthenticated && (
            <button className="mt-4 text-sm text-black underline hover:text-gray-600 transition-colors">
              Write a Review
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{averageRating}</div>
          <div>
            {renderRatingStars(parseFloat(averageRating))}
            <p className="text-xs text-gray-500 mt-1">{reviewCount} customer reviews</p>
          </div>
        </div>

        {productData.reviews.map((review, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                  {review.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {review.name || 'Anonymous Customer'}
                  </p>
                  <div className="flex items-center gap-1">
                    {renderRatingStars(review.rating || 0)}
                    <span className="text-xs text-gray-400 ml-1">
                      {review.date || 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
              {review.verified && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Verified Purchase
                </span>
              )}
            </div>
            {review.comment && (
              <p className="text-sm text-gray-600 mt-2 italic">
                "{review.comment}"
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }, [productData, averageRating, reviewCount, renderRatingStars, isAuthenticated]);

  const renderSpecificationsTab = useCallback(() => {
    if (!productData) return null;

    const specs = {
      'Category': productData.category,
      'Sub Category': productData.subCategory,
      'Brand': productData.brand || 'N/A',
      'Material': productData.materials || 'N/A',
      'SKU': productData.sku || 'N/A',
      'Stock': productData.stock > 0 ? `${productData.stock} units` : 'Out of stock',
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">{key}:</span>
            <span className="text-sm text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    );
  }, [productData]);

  // ============================================================
  // Loading State
  // ============================================================
  if (isLoading || !productData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
          <p className="text-sm text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Main Render
  // ============================================================
  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12 pb-40 lg:pb-12">
        {/* ===== Breadcrumb ===== */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <a href="/" className="hover:text-black transition-colors">Home</a>
            </li>
            <li>/</li>
            <li>
              <a href="/collection" className="hover:text-black transition-colors">Collection</a>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none">{productData.name}</li>
          </ol>
        </nav>

        {/* ===== Product Main Section ===== */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* --- Images Gallery --- */}
          <div className="flex-1 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px] custom-scrollbar">
              {renderThumbnails()}
            </div>

            {/* Main Image */}
            <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden">
              <img
                className="w-full h-auto max-h-[400px] sm:max-h-[600px] object-contain hover:scale-105 transition-transform duration-500"
                src={selectedImage}
                alt={productData.name}
              />
            </div>
          </div>

          {/* --- Product Information --- */}
          <div className="flex-1 lg:max-w-lg">
            {/* Name */}
            <h1 className="font-medium text-xl sm:text-2xl md:text-3xl text-gray-900">
              {productData.name}
            </h1>

            {/* Rating */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {renderRatingStars(parseFloat(averageRating))}
                <span className="text-sm text-gray-500">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {currency}{displayPrice}
              </p>
              {productData.originalPrice && productData.originalPrice > productData.price && (
                <p className="text-base sm:text-lg text-gray-400 line-through">
                  {currency}{productData.originalPrice.toLocaleString()}
                </p>
              )}
              {productData.discount > 0 && (
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                  -{productData.discount}%
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mt-2">
              {inStock ? (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                  In Stock ({productData.stock} available)
                </span>
              ) : (
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-4 text-gray-600 text-sm leading-relaxed">
              {productData.description?.slice(0, 150)}
              {productData.description?.length > 150 && '...'}
            </p>

            {/* Size Selection */}
            {productData.sizes && productData.sizes.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-900">Select Size</p>
                  <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {productData.sizes.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSizeSelect(item)}
                      className={`
                        py-2 px-4 text-xs font-medium rounded border transition-all min-w-[44px]
                        ${item === selectedSize
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-gray-50 text-gray-800 hover:border-gray-400 hover:bg-gray-100'
                        }
                      `}
                      aria-label={`Size ${item}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Selected size: {selectedSize}
                  </p>
                )}
              </div>
            )}

            {/* Features */}
            <hr className="mt-6 border-gray-200" />
            <div className="mt-4 space-y-2 text-xs text-gray-500">
              <p className="flex items-center gap-2">✓ Free shipping on orders over {currency}500</p>
              <p className="flex items-center gap-2">✓ 7-day easy returns</p>
              <p className="flex items-center gap-2">✓ Secure payment</p>
            </div>
          </div>
        </div>

        {/* ===== Tabs Section ===== */}
        <div className="mt-12">
          <div className="flex overflow-x-auto border-b border-gray-200">
            <button
              onClick={() => handleTabChange(TABS.DESCRIPTION)}
              className={`
                px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === TABS.DESCRIPTION
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
                }
              `}
            >
              Description
            </button>
            <button
              onClick={() => handleTabChange(TABS.REVIEWS)}
              className={`
                px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === TABS.REVIEWS
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
                }
              `}
            >
              Reviews ({reviewCount})
            </button>
            <button
              onClick={() => handleTabChange(TABS.SPECIFICATIONS)}
              className={`
                px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === TABS.SPECIFICATIONS
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
                }
              `}
            >
              Specifications
            </button>
          </div>

          <div className="py-6">
            {activeTab === TABS.DESCRIPTION && renderDescriptionTab()}
            {activeTab === TABS.REVIEWS && renderReviewsTab()}
            {activeTab === TABS.SPECIFICATIONS && renderSpecificationsTab()}
          </div>
        </div>

        {/* ===== Related Products ===== */}
        {productData.category && (
          <RelatedProductsWithFallback
            category={productData.category}
            subCategory={productData.subCategory}
            currentProductId={productData._id}
            displayCount={5}
            fallbackCategory={productData.category}
            className="mt-16"
          />
        )}
      </div>

      {/* ===== MOBILE STICKY BOTTOM BAR ===== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        {/* Selected Size Display - Always visible */}
        <div className="px-4 pt-2 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Selected:</span>
            {selectedSize ? (
              <span className="text-xs font-semibold bg-black text-white px-3 py-0.5 rounded-full">
                Size {selectedSize}
              </span>
            ) : (
              <span className="text-xs text-red-500 font-medium">Please select a size</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Qty:</span>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium"
                disabled={quantity >= (productData.stock || Infinity)}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Main Action Bar */}
        <div className="px-4 pb-3 pt-1 flex items-center gap-3">
          {/* Price */}
          <div className="flex-1 min-w-[70px]">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-base font-bold text-black">
              {currency}{(productData.price * quantity).toLocaleString()}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || isAddingToCart || !selectedSize}
            className={`
              flex-1 py-3 px-4 text-sm font-semibold uppercase tracking-wide rounded-xl
              transition-all duration-300 min-w-[120px]
              ${inStock && !isAddingToCart && selectedSize
                ? 'bg-black text-white hover:bg-gray-800 active:scale-95 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isAddingToCart ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Adding...
              </span>
            ) : !inStock ? (
              'Out of Stock'
            ) : !selectedSize ? (
              'Select Size'
            ) : (
              `Add to Cart`
            )}
          </button>
        </div>

        {/* Authentication Warning */}
        {!isAuthenticated && (
          <div className="px-4 pb-2">
            <p className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 p-1.5 rounded-lg text-center">
              🔒 Please <a href="/login" className="font-semibold underline hover:text-yellow-900">login</a> to add items to cart
            </p>
          </div>
        )}
      </div>

      {/* ===== DESKTOP ADD TO CART SECTION ===== */}
      <div className="hidden lg:block mt-8">
        <div className="flex items-center gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-gray-700">Qty:</p>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium min-w-[40px]"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium min-w-[40px]"
                disabled={quantity >= (productData.stock || Infinity)}
              >
                +
              </button>
            </div>
          </div>

          {/* Size Display */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Size:</span>
            {selectedSize ? (
              <span className="text-sm font-semibold bg-black text-white px-3 py-1 rounded">
                {selectedSize}
              </span>
            ) : (
              <span className="text-sm text-red-500">Please select</span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || isAddingToCart || !selectedSize}
            className={`
              px-8 py-3 text-sm font-medium uppercase tracking-wider rounded
              transition-all duration-300 min-w-[200px]
              ${inStock && !isAddingToCart && selectedSize
                ? 'bg-black text-white hover:bg-gray-800 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isAddingToCart ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Adding...
              </span>
            ) : !inStock ? (
              'Out of Stock'
            ) : !selectedSize ? (
              'Select Size'
            ) : (
              `Add to Cart • ${currency}${(productData.price * quantity).toLocaleString()}`
            )}
          </button>
        </div>

        {/* Authentication Warning */}
        {!isAuthenticated && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
            <p className="text-sm text-yellow-800">
              🔒 Please <a href="/login" className="font-semibold underline hover:text-yellow-900">login</a> to add items to cart
            </p>
          </div>
        )}
      </div>
    </>
  );
};

// ============================================================
// Default Export
// ============================================================
export default Product;