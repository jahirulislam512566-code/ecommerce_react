// backend/controllers/productController.js
import Product from '../models/productModel.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// ============================================================
// ✅ Get All Products - Public
// ============================================================
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
};

// ============================================================
// ✅ Get Single Product - Public
// ============================================================
export const singleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Get Single Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product'
        });
    }
};

// ============================================================
// ✅ Add Product - Admin only
// ============================================================
export const addProduct = async (req, res) => {
    console.log('========================================');
    console.log('📦 ADD PRODUCT CONTROLLER');
    console.log('========================================');
    
    try {
        console.log('📝 Body:', req.body);
        console.log('📎 Files:', req.files);
        console.log('📎 Files length:', req.files?.length || 0);

        const { 
            name, 
            description, 
            price, 
            category, 
            subCategory,
            sizes, 
            stock,
            bestseller,
        } = req.body;

        // ✅ Validate required fields
        if (!name || !description || !price || !category || !subCategory) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'All fields are required: name, description, price, category, subCategory'
            });
        }

        console.log('✅ All required fields present');

        // ✅ Parse sizes
        let sizesArray = ['S', 'M', 'L', 'XL'];
        if (sizes) {
            try {
                if (typeof sizes === 'string') {
                    sizesArray = JSON.parse(sizes);
                } else if (Array.isArray(sizes)) {
                    sizesArray = sizes;
                }
                console.log('📏 Sizes:', sizesArray);
            } catch (e) {
                console.log('⚠️ Size parsing error:', e.message);
            }
        }

        // ✅ Handle images - Upload to Cloudinary
        let imageUrls = ['/placeholder-image.png'];
        
        if (req.files && req.files.length > 0) {
            console.log(`📎 Processing ${req.files.length} images for Cloudinary upload...`);
            
            try {
                const uploadPromises = req.files.map(async (file) => {
                    try {
                        // Upload to Cloudinary
                        const result = await cloudinary.uploader.upload(file.path, {
                            folder: 'ecommerce_products',
                            transformation: [
                                { width: 1000, height: 1000, crop: 'limit', quality: 'auto' },
                                { fetch_format: 'auto' }
                            ],
                            use_filename: true,
                            unique_filename: true,
                        });
                        
                        // Delete local file after upload
                        try {
                            fs.unlinkSync(file.path);
                        } catch (unlinkError) {
                            console.log('⚠️ Could not delete local file:', file.path);
                        }
                        
                        return result.secure_url; // ✅ Cloudinary URL
                    } catch (uploadError) {
                        console.error('❌ Individual upload error:', uploadError.message);
                        return null;
                    }
                });

                const uploadedUrls = await Promise.all(uploadPromises);
                const validUrls = uploadedUrls.filter(url => url !== null);
                
                if (validUrls.length > 0) {
                    imageUrls = validUrls;
                    console.log('✅ Images uploaded to Cloudinary:', imageUrls);
                } else {
                    console.log('⚠️ All image uploads failed, using placeholder');
                }
            } catch (uploadError) {
                console.error('❌ Cloudinary upload error:', uploadError.message);
                // Fallback to local paths
                imageUrls = req.files.map(file => `/uploads/${file.filename}`);
                console.log('📸 Using local image URLs:', imageUrls);
            }
        } else {
            console.log('📸 No images uploaded, using placeholder');
        }

        // ✅ Create product
        const productData = {
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category: category,
            subCategory: subCategory || '',
            sizes: sizesArray,
            stock: Number(stock) || 0,
            bestseller: bestseller === 'true' || bestseller === true,
            image: imageUrls,
        };

        console.log('📦 Creating product:', JSON.stringify(productData, null, 2));

        const product = new Product(productData);
        await product.save();
        console.log('✅ Product saved! ID:', product._id);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });

    } catch (error) {
        console.error('========================================');
        console.error('❌ ADD PRODUCT ERROR');
        console.error('========================================');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).reduce((acc, key) => {
                acc[key] = error.errors[key].message;
                return acc;
            }, {});
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Product already exists',
                field: Object.keys(error.keyPattern)[0]
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
                name: error.name
            })
        });
    }
};

// ============================================================
// ✅ Update Product - Admin only
// ============================================================
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Parse sizes if it's a string
        if (updates.sizes && typeof updates.sizes === 'string') {
            try {
                updates.sizes = JSON.parse(updates.sizes);
            } catch (e) {
                updates.sizes = updates.sizes.split(',');
            }
        }

        // Handle new images if uploaded
        if (req.files && req.files.length > 0) {
            try {
                const uploadPromises = req.files.map(async (file) => {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'ecommerce_products',
                        transformation: [
                            { width: 1000, height: 1000, crop: 'limit', quality: 'auto' },
                            { fetch_format: 'auto' }
                        ],
                        use_filename: true,
                        unique_filename: true,
                    });
                    
                    try {
                        fs.unlinkSync(file.path);
                    } catch (unlinkError) {
                        // Ignore
                    }
                    
                    return result.secure_url;
                });

                const uploadedUrls = await Promise.all(uploadPromises);
                updates.image = uploadedUrls.filter(url => url !== null);
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
            }
        }

        const product = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product'
        });
    }
};

// ============================================================
// ✅ Delete Product - Admin only
// ============================================================
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // ✅ Delete images from Cloudinary
        if (product.image && product.image.length > 0) {
            const deletePromises = product.image.map(async (imageUrl) => {
                try {
                    // Extract public_id from Cloudinary URL
                    const publicId = imageUrl.split('/').pop().split('.')[0];
                    if (publicId) {
                        const result = await cloudinary.uploader.destroy(`ecommerce_products/${publicId}`);
                        console.log('🗑️ Deleted from Cloudinary:', publicId, result.result);
                    }
                } catch (cloudinaryError) {
                    console.error('Cloudinary delete error:', cloudinaryError.message);
                }
            });
            await Promise.all(deletePromises);
        }

        await Product.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete Product Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
};

// ============================================================
// ✅ Add Product Review - Authenticated users only
// ============================================================
export const addProductReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user._id;
        const userName = req.user.name;

        if (!productId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and rating are required'
            });
        }

        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user already reviewed
        const existingReview = product.reviews?.find(
            review => review.user?.toString() === userId.toString()
        );

        if (existingReview) {
            existingReview.rating = rating;
            existingReview.comment = comment || existingReview.comment;
            existingReview.updatedAt = Date.now();
        } else {
            product.reviews = product.reviews || [];
            product.reviews.push({
                user: userId,
                name: userName,
                rating: Number(rating),
                comment: comment || '',
                createdAt: Date.now()
            });
        }

        // Update average rating
        if (product.reviews && product.reviews.length > 0) {
            const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
            product.rating = totalRating / product.reviews.length;
            product.reviewCount = product.reviews.length;
        }

        await product.save();

        res.json({
            success: true,
            message: 'Review added successfully',
            rating: product.rating,
            reviewCount: product.reviewCount
        });
    } catch (error) {
        console.error('Add Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding review'
        });
    }
};

// ============================================================
// ✅ Get Products by Category - Public
// ============================================================
export const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category });
        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Get Products by Category Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products by category'
        });
    }
};

// ============================================================
// ✅ Get Featured Products - Public
// ============================================================
export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ bestseller: true })
            .limit(10)
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Get Featured Products Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured products'
        });
    }
};