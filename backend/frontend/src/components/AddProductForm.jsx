import React, { useState, useCallback, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// ============================================================
// Constants
// ============================================================
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DEFAULT_CATEGORIES = ['Men', 'Women', 'Kids'];
const DEFAULT_SUB_CATEGORIES = ['Topwear', 'Bottomwear', 'Winterwear', 'Accessories'];

// ============================================================
// ImageUpload Component
// ============================================================
const ImageUpload = ({ images, onImageChange, onImageRemove, maxFiles = MAX_IMAGES }) => {
  const [previews, setPreviews] = useState([]);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (images.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate each file
    const validFiles = files.filter(file => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image format`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onImageChange(validFiles);
      
      // Create previews
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  }, [images, maxFiles, onImageChange]);

  const handleRemoveImage = useCallback((index) => {
    onImageRemove(index);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }, [onImageRemove]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Images
          <span className="text-xs text-gray-400 ml-2">
            ({images.length}/{maxFiles} files)
          </span>
        </label>
        <span className="text-xs text-gray-400">
          Max {MAX_FILE_SIZE / 1024 / 1024}MB each
        </span>
      </div>

      {/* Upload Area */}
      {images.length < maxFiles && (
        <div className="relative">
          <input
            type="file"
            multiple
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Upload product images"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-black transition-colors">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-sm text-gray-600">Click or drag to upload images</p>
            <p className="text-xs text-gray-400 mt-1">
              {ALLOWED_IMAGE_TYPES.join(', ')} up to {MAX_FILE_SIZE / 1024 / 1024}MB
            </p>
          </div>
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Product preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                aria-label={`Remove image ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// FormInput Component
// ============================================================
const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  required = false,
  placeholder,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
          transition-all duration-200
          ${error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:ring-black focus:border-black'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ============================================================
// FormSelect Component
// ============================================================
const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Select an option',
  error,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
          transition-all duration-200 appearance-none bg-white
          ${error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:ring-black focus:border-black'
          }
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ============================================================
// Main AddProductForm Component
// ============================================================
export const AddProductForm = ({
  onSuccess,
  onCancel,
  className = '',
  initialData = null,
  isEditing = false,
}) => {
  // --- Hooks ---
  const { backendUrl, token } = useShop();
  
  // --- State ---
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    category: initialData?.category || '',
    subCategory: initialData?.subCategory || '',
    sizes: initialData?.sizes || [],
    stock: initialData?.stock || '',
    discount: initialData?.discount || '',
    bestseller: initialData?.bestseller || false,
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [formStep, setFormStep] = useState(1);
  const totalSteps = 2;

  // --- Handlers ---
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleImageChange = useCallback((newImages) => {
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleImageRemove = useCallback((index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSizeToggle = useCallback((size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  }, []);

  const validateStep = useCallback((step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Product name is required';
      if (!formData.price) newErrors.price = 'Price is required';
      if (formData.price && isNaN(formData.price)) newErrors.price = 'Price must be a number';
      if (formData.discount && (isNaN(formData.discount) || formData.discount < 0 || formData.discount > 100)) {
        newErrors.discount = 'Discount must be between 0 and 100';
      }
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.subCategory) newErrors.subCategory = 'Sub-category is required';
      if (!formData.stock) newErrors.stock = 'Stock quantity is required';
    }

    if (step === totalSteps) {
      if (images.length === 0 && !isEditing) {
        newErrors.images = 'At least one product image is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, images.length, isEditing]);

  const handleNextStep = useCallback(() => {
    if (validateStep(formStep)) {
      setFormStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [formStep, validateStep]);

  const handlePrevStep = useCallback(() => {
    setFormStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate all steps
    if (!validateStep(1) || !validateStep(totalSteps)) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    // Check authentication
    if (!token) {
      toast.error('Please login to add products');
      return;
    }

    try {
      setIsLoading(true);

      // Prepare FormData
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subCategory', formData.subCategory);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('bestseller', formData.bestseller);
      
      if (formData.discount) {
        formDataToSend.append('discount', formData.discount);
      }
      
      if (formData.sizes.length > 0) {
        formDataToSend.append('sizes', JSON.stringify(formData.sizes));
      }

      // Append images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // Determine endpoint
      const endpoint = isEditing && initialData?._id
        ? `${backendUrl}/api/product/${initialData._id}`
        : `${backendUrl}/api/product/create`;

      const method = isEditing && initialData?._id ? 'put' : 'post';

      const response = await axios({
        method,
        url: endpoint,
        data: formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      if (response.data.success) {
        toast.success(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          subCategory: '',
          sizes: [],
          stock: '',
          discount: '',
          bestseller: false,
        });
        setImages([]);
        setFormStep(1);
        
        if (onSuccess) {
          onSuccess(response.data.product);
        }
      } else {
        throw new Error(response.data.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Product save error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, images, token, backendUrl, isEditing, initialData, onSuccess, validateStep]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isEditing ? 'Update your product details' : 'Fill in the details to add a new product'}
        </p>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[...Array(totalSteps)].map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${formStep > index + 1 
                  ? 'bg-green-500 text-white' 
                  : formStep === index + 1 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-500'
                }
              `}>
                {formStep > index + 1 ? '✓' : index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div className={`w-12 h-0.5 ${formStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Step 1: Basic Information */}
        {formStep === 1 && (
          <div className="space-y-4">
            <FormInput
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
              error={errors.name}
            />

            <FormInput
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              className="h-24 resize-y"
              as="textarea"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="0.00"
                error={errors.price}
                step="0.01"
                min="0"
              />
              <FormInput
                label="Discount (%)"
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
                error={errors.discount}
                min="0"
                max="100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={DEFAULT_CATEGORIES}
                required
                error={errors.category}
              />
              <FormSelect
                label="Sub-Category"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                options={DEFAULT_SUB_CATEGORIES}
                required
                error={errors.subCategory}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Stock Quantity"
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                placeholder="0"
                error={errors.stock}
                min="0"
              />
              
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="bestseller"
                  checked={formData.bestseller}
                  onChange={handleChange}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Mark as Bestseller
                </label>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-lg border transition-all
                      ${formData.sizes.includes(size)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                      }
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {formData.sizes.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Selected: {formData.sizes.join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Images */}
        {formStep === 2 && (
          <div className="space-y-4">
            <ImageUpload
              images={images}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
              maxFiles={MAX_IMAGES}
            />
            {errors.images && (
              <p className="text-xs text-red-500">{errors.images}</p>
            )}
            
            {isEditing && images.length === 0 && (
              <p className="text-sm text-gray-400">
                Current images will be preserved. Add new images to replace them.
              </p>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
          <div>
            {formStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
              >
                Cancel
              </button>
            )}

            {formStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Product' : 'Create Product'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

// ============================================================
// Default Export
// ============================================================
export default AddProductForm;

// ============================================================
// Optional: AddProductModal Component
// ============================================================
export const AddProductModal = ({ isOpen, onClose, ...props }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <AddProductForm 
            {...props}
            onCancel={onClose}
            onSuccess={(product) => {
              props.onSuccess?.(product);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};