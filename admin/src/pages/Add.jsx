import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App'; // Imported back here to map endpoints directly

/**
 * @component Add
 * @description Admin component to safely create and upload new product inventory items.
 */
const Add = ({ token }) => { // Destructured token prop to authorize the backend request securely
  // 1. Form and UI State Management
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Men'); 
  const [subCategory, setSubCategory] = useState('Topwear'); 
  const [stock, setStock] = useState('10'); 
  const [image, setImage] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Client-Side Validation check
    if (!name || !price || !description || !category || !subCategory || !stock) {
      setMessage({ type: 'error', text: 'All product tracking fields are required.' });
      setLoading(false);
      return;
    }

    // Prepare Payload using standard Multipart FormData architecture
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", Number(price));
    formData.append("description", description.trim());
    formData.append("category", category);
    formData.append("subCategory", subCategory);
    formData.append("stock", Number(stock));
    formData.append("bestseller", "false"); 
    
    /* CRITICAL BACKEND ALIGNMENT: Your controller executes JSON.parse(sizes). */
    formData.append("sizes", JSON.stringify(["S", "M", "L", "XL"]));

    // Changed key name from "image" to "images" to match backend upload.array('images', 10)
    if (image) {
      formData.append("images", image);
    }

    try {
      // 💡 FIXED: Uses pure axios.post combined with your raw ${backendUrl} string variable
      const response = await axios.post(`${backendUrl}/api/product/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token // Passing token inside headers if your backend middleware requires authentication validation
        }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Product successfully added to store catalog!' });
        
        // Complete form field inputs reset sequence
        setName('');
        setPrice('');
        setDescription('');
        setCategory('Men');
        setSubCategory('Topwear');
        setStock('10');
        setImage(null);
        
        // Reset file input DOM element value manually
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
      } else {
        setMessage({ 
          type: 'error', 
          text: response.data.message || 'Server rejected product configuration creation request.' 
        });
      }

    } catch (err) {
      console.error("Add Product Request Core Exception:", err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Connection timeout. Verify your API terminal is operational.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h1 className='text-2xl font-black text-gray-900 tracking-tight'>Add New Product</h1>
        <p className='text-gray-500 text-sm mt-1'>
          Publish new items securely directly to your cluster database collection records.
        </p>
      </div>
      
      {/* Dynamic Status Notification Alert Display Panel */}
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
        {/* Product Media Asset Input Row */}
        <div>
          <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2'>
            Product Display Image <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input 
            id="image-upload"
            type="file" 
            accept="image/*"
            disabled={loading}
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer transition-colors"
          />
        </div>

        {/* Product Identity Name Row Input */}
        <div>
          <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='name'>
            Product Name String
          </label>
          <input
            className='w-full border rounded-lg py-2.5 px-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
            id='name'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g., Slim Fit Premium Denim Jeans'
            disabled={loading}
          />
        </div>

        {/* Category & Subcategory Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='category'>
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="w-full border rounded-lg py-2.5 px-3.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="Men">Men </option>
              <option value="Women">Women</option>
              <option value="Children">Kids</option>
            </select>
          </div>

          <div>
            <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='subCategory'>
              Subcategory
            </label>
            <select
              id="subCategory"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              disabled={loading}
              className="w-full border rounded-lg py-2.5 px-3.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winterwear">Winterwear</option>
            </select>
          </div>
        </div>

        {/* Price & Stock Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='price'>
              Price Valuations ($ USD)
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm">$</span>
              </div>
              <input
                className='w-full border rounded-lg py-2.5 pl-8 pr-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                id='price'
                type='number'
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder='0.00'
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='stock'>
              Available Units Stock
            </label>
            <input
              className='w-full border rounded-lg py-2.5 px-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              id='stock'
              type='number'
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder='10'
              disabled={loading}
            />
          </div>
        </div>

        {/* Detailed Marketing Description Block Textarea Entry Field */}
        <div>
          <label className='block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2' htmlFor='description'>
            Detailed Item Description
          </label>
          <textarea
            className='w-full border rounded-lg py-2.5 px-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-32 resize-none transition-all'
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Provide comprehensive specs, color pathways, and fabric details...'
            disabled={loading}
          />
        </div>

        {/* Structural Form Submit Button Element */}
        <button
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all focus:outline-none text-sm uppercase tracking-wider shadow-sm ${
            loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.99]'
          }`}
          type='submit'
          disabled={loading}
        >
          {loading ? 'Writing to cluster collection...' : 'Deploy Product Listing'}
        </button>
      </form>
    </div>
  );
};

export default Add;