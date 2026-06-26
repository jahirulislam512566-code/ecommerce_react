import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';

/**
 * @component List
 * @description Catalog table management layout utilizing global backend configurations aligned with REST patterns.
 */
const List = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const basePath = "/api/product";

  // 1. Fetch products catalog data collection from back-end server
  const fetchProducts = async () => {
    // Prevent component from making broken requests before token is parsed by parent
    if (!token) {
      setLoading(true);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${backendUrl}${basePath}/list`, {
        headers: { token }
      });
      
      if (response.data.success) {
        setProducts(response.data.products || response.data.data || []); 
      } else {
        setError(response.data.message || 'Failed to sync live catalog data.');
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(
        err.response?.data?.message || 
        'Unable to reach backend services. Confirm port 4000 is active.'
      );
    } finally {
      setLoading(false);
    }
  };
   
  // Track token state so that the catalog automatically fetches the moment a login completes
  useEffect(() => {
    fetchProducts();
  }, [token]);

  // 2. Safely trigger product record removal pipeline
  const handleDelete = async (id) => {
    if (!id) {
      alert("Invalid product target tracking signature identifier.");
      return;
    }

    if (window.confirm("Are you sure you want to permanently erase this product from store catalog listings?")) {
      try {
        const response = await axios.post(`${backendUrl}${basePath}/remove`, { id }, {
          headers: { token }
        });

        if (response.data.success) {
          // Immediately update state array tree inline to reflect removal smoothly
          setProducts((prevProducts) => prevProducts.filter(item => item._id !== id));
          alert("Product record successfully expunged.");
        } else {
          alert(response.data.message || "Removal processing execution failed.");
        }
      } catch (err) {
        console.error("Delete Action Core Exception Error:", err);
        alert(
          err.response?.data?.message || 
          "Administrative validation execution failed. (403 Forbidden or session timeout)."
        );
      }
    }
  };

  return (
    <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
      <div className="mb-6">
        <h1 className='text-2xl font-black text-gray-900 tracking-tight'>Live Product Catalog</h1>
        <p className='text-gray-500 text-sm mt-0.5'>
          Audit, edit, and manage inventory entries visible to customers inside your marketplace client application.
        </p>
      </div>
      
      {error && (
        <div className='p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg mb-5 text-sm font-semibold transition-all'>
          {error}
        </div>
      )}

      {loading ? (
        <div className='text-center py-12 text-gray-400 text-sm font-bold tracking-wide animate-pulse uppercase'>
          Synchronizing collection clusters...
        </div>
      ) : products.length === 0 ? (
        <div className='text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50'>
          <p className="font-semibold text-sm">Your product catalog is empty.</p>
          <p className="text-xs text-gray-400 mt-1">Navigate to the entry panel to upload stock items.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className='min-w-full bg-white text-left text-sm border-collapse'>
            <thead>
              <tr className='bg-gray-50/70 text-gray-500 uppercase font-bold text-[11px] tracking-widest border-b border-gray-100'>  
                <th className='py-4 px-5 w-24'>Asset View</th>
                <th className='py-4 px-5'>Product Context Name</th>
                <th className='py-4 px-5 w-32'>Price Valuation</th>
                <th className='py-4 px-5 w-40 text-center'>Management Controls</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 text-gray-700'>  
              {products.map((item, index) => {
                const productImages = item.images || item.image || [];
                const displayImg = Array.isArray(productImages) ? productImages[0] : productImages;

                return (
                  <tr key={item._id || index} className='hover:bg-gray-50/60 transition-colors group'>
                    <td className='py-4 px-5 align-middle'>
                      {displayImg ? (
                        <img 
                          src={displayImg} 
                          alt={item.name || "Stock item photo"} 
                          className='w-11 h-11 object-cover rounded-lg border border-gray-100 shadow-sm'
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/100x100?text=No+Asset";
                          }}
                        />
                      ) : (
                        <span className='font-mono text-[10px] bg-gray-100 text-gray-400 py-1 px-2 rounded font-bold border border-gray-200 block text-center truncate shadow-sm'>
                          {item._id ? item._id.substring(item._id.length - 6).toUpperCase() : index + 1}
                        </span>
                      )}
                    </td>
                    
                    <td className='py-4 px-5 font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm'>
                      {item.name}
                    </td>
                    
                    <td className='py-4 px-5 text-gray-600 font-black text-sm tracking-tight'>
                      ${Number(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    
                    <td className='py-4 px-5 text-center align-middle'>
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          className='bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-all border border-transparent hover:border-blue-200'
                          onClick={() => alert(`Operational modal pathing hook triggered for asset details: ${item.name}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className='bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all border border-red-100 hover:border-transparent'
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>   
        </div>
      )}
    </div>
  );
};

export default List;