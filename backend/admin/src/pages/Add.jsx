// admin/src/pages/Add.jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * @component Add
 * @description Admin component to safely create and upload new product inventory items.
 */
const Add = ({ token }) => {
  // 1. Form and UI State Management
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Men',
    subCategory: 'Topwear',
    stock: '10',
    sizes: ['S', 'M', 'L', 'XL'],
    bestseller: false,
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // ✅ Get token from props or localStorage
  const getToken = () => {
    return token || localStorage.getItem('token') || '';
  };

  // ✅ Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ✅ Handle size selection
  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  // ✅ Handle image upload - FIXED
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log('📎 Files selected:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image format.`);
        console.log(`❌ Invalid type: ${file.type}`);
      }
      if (!isValidSize) {
        toast.error(`${file.name} exceeds 5MB limit.`);
        console.log(`❌ File too large: ${file.size} bytes`);
      }
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      console.log('❌ No valid files to upload');
      return;
    }

    console.log(`✅ ${validFiles.length} valid files selected`);
    setImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  // ✅ Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      // Revoke object URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ✅ Clear form
  const clearForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'Men',
      subCategory: 'Topwear',
      stock: '10',
      sizes: ['S', 'M', 'L', 'XL'],
      bestseller: false,
    });
    setImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ Validate form
  const validateForm = () => {
    const { name, price, description, category, subCategory, stock } = formData;
    
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Product name is required.' });
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid price.' });
      return false;
    }
    if (!description.trim() || description.length < 10) {
      setMessage({ type: 'error', text: 'Description must be at least 10 characters.' });
      return false;
    }
    if (!category) {
      setMessage({ type: 'error', text: 'Please select a category.' });
      return false;
    }
    if (!subCategory) {
      setMessage({ type: 'error', text: 'Please select a sub-category.' });
      return false;
    }
    if (!stock || parseInt(stock) < 0) {
      setMessage({ type: 'error', text: 'Please enter a valid stock quantity.' });
      return false;
    }
    if (formData.sizes.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one size.' });
      return false;
    }
    if (images.length === 0) {
      setMessage({ type: 'error', text: 'Please upload at least one product image.' });
      return false;
    }

    return true;
  };

  // ✅ Handle form submission - FIXED
 
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    console.log('📤 Starting form submission...');
    console.log('📤 Images state:', images);

    // Client-Side Validation
    if (!validateForm()) {
        setLoading(false);
        return;
    }

    // ✅ Create FormData
    const formDataToSend = new FormData();
    
    // ✅ Append text fields
    formDataToSend.append("name", formData.name.trim());
    formDataToSend.append("price", Number(formData.price));
    formDataToSend.append("description", formData.description.trim());
    formDataToSend.append("category", formData.category);
    formDataToSend.append("subCategory", formData.subCategory);
    formDataToSend.append("stock", Number(formData.stock));
    formDataToSend.append("bestseller", String(formData.bestseller));
    formDataToSend.append("sizes", JSON.stringify(formData.sizes));

    // ✅ Append images
    if (images.length > 0) {
        console.log(`📎 Appending ${images.length} images to FormData`);
        images.forEach((image, index) => {
            formDataToSend.append("images", image);
            console.log(`  Image ${index + 1}: ${image.name} (${image.size} bytes, ${image.type})`);
        });
    } else {
        console.log('⚠️ No images to upload');
        // ✅ For testing, add a simple image blob
        try {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
                <rect width="100" height="100" fill="#ddd"/>
                <text x="50" y="50" font-size="14" text-anchor="middle" dy=".3em" fill="#999">No Image</text>
            </svg>`;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const file = new File([blob], 'placeholder.svg', { type: 'image/svg+xml' });
            formDataToSend.append("images", file);
            console.log('📎 Added placeholder image');
        } catch (error) {
            console.log('⚠️ Could not create placeholder image');
        }
    }

    // ✅ Log FormData contents
    console.log('📦 FormData contents:');
    for (let pair of formDataToSend.entries()) {
        if (pair[1] instanceof File) {
            console.log(`  ${pair[0]}: File - ${pair[1].name} (${pair[1].size} bytes, ${pair[1].type})`);
        } else {
            console.log(`  ${pair[0]}: ${pair[1]}`);
        }
    }

    try {
        const authToken = getToken();
        console.log('🔑 Token:', authToken ? 'Present' : 'Missing');

        if (!authToken) {
            throw new Error('No authentication token found. Please login again.');
        }

        // ✅ Use fetch with FormData
        const response = await fetch(`${backendUrl}/api/product/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                // ✅ DO NOT set Content-Type - browser will set it with boundary
            },
            body: formDataToSend,
        });

        const data = await response.json();
        console.log('📥 Response status:', response.status);
        console.log('📥 Response data:', data);

        if (response.ok && data.success) {
            setMessage({ type: 'success', text: '✅ Product successfully added!' });
            toast.success('Product added successfully!');
            clearForm();
        } else {
            const errorMsg = data.message || 'Failed to add product';
            console.log('❌ Error response:', errorMsg);
            setMessage({ type: 'error', text: errorMsg });
            toast.error(errorMsg);
        }

    } catch (err) {
        console.error("❌ Add Product Error:", err);
        setMessage({ type: 'error', text: err.message || 'Failed to add product' });
        toast.error(err.message || 'Failed to add product');
    } finally {
        setLoading(false);
    }
};

  // Available sizes
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h1 className='text-2xl font-black text-gray-900 tracking-tight'>➕ Add New Product</h1>
        <p className='text-gray-500 text-sm mt-1'>
          Publish new items securely directly to your product catalog.
        </p>
      </div>
      
      {/* Dynamic Status Notification Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg mb-6 font-semibold text-sm border transition-all duration-300 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Images Upload */}
        <div>
          <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2'>
            Product Images <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(Max 5 images, 5MB each)</span>
          </label>
          
          <div className="flex items-center gap-4">
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={loading || images.length >= 5}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer transition-colors"
            />
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {images.length}/5
            </span>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Name */}
        <div>
          <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='name'>
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            className='w-full border rounded-lg py-2.5 px-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
            id='name'
            name='name'
            type='text'
            value={formData.name}
            onChange={handleInputChange}
            placeholder='e.g., Slim Fit Premium Denim Jeans'
            disabled={loading}
          />
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='category'>
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full border rounded-lg py-2.5 px-3.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          <div>
            <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='subCategory'>
              Subcategory <span className="text-red-500">*</span>
            </label>
            <select
              id="subCategory"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full border rounded-lg py-2.5 px-3.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winterwear">Winterwear</option>
            </select>
          </div>
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='price'>
              Price ($ USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm">$</span>
              </div>
              <input
                className='w-full border rounded-lg py-2.5 pl-8 pr-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                id='price'
                name='price'
                type='number'
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                placeholder='0.00'
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='stock'>
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              className='w-full border rounded-lg py-2.5 px-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              id='stock'
              name='stock'
              type='number'
              min="0"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder='10'
              disabled={loading}
            />
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2'>
            Available Sizes <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeToggle(size)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                  formData.sizes.includes(size)
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Selected: {formData.sizes.length > 0 ? formData.sizes.join(', ') : 'None selected'}
          </p>
        </div>

        {/* Bestseller */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="bestseller"
            name="bestseller"
            checked={formData.bestseller}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="bestseller" className="text-sm text-gray-700 font-medium">
            Mark as Bestseller
          </label>
        </div>

        {/* Description */}
        <div>
          <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='description'>
            Product Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className='w-full border rounded-lg py-2.5 px-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-32 resize-none transition-all'
            id='description'
            name='description'
            value={formData.description}
            onChange={handleInputChange}
            placeholder='Provide comprehensive specs, color pathways, and fabric details...'
            disabled={loading}
          />
          <p className="text-xs text-gray-400 mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all focus:outline-none text-sm uppercase tracking-wider shadow-sm ${
            loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.99]'
          }`}
          type='submit'
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Product...
            </span>
          ) : (
            'Deploy Product Listing'
          )}
        </button>
      </form>
    </div>
  );
};

export default Add;