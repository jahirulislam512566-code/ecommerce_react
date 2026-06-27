// backend/controllers/productController.js
import Product from '../models/productModel.js';
import { v2 as cloudinary } from 'cloudinary';

// ============================================================
// ✅ Get All Products - Public
// ============================================================
export const getProducts = async (req, res) => {
  try {
    // ✅ Support query parameters for filtering
    const { 
      category, 
      brand, 
      minPrice, 
      maxPrice, 
      sort, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (brand) {
      filter.brand = brand;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortOption = {};
    if (sort === 'price-asc') sortOption.price = 1;
    else if (sort === 'price-desc') sortOption.price = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else sortOption.createdAt = -1; // Default: newest first

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('reviews.user', 'name email'),
      Product.countDocuments(filter)
    ]);

    // ✅ Check if request expects JSON or HTML
    const acceptHeader = req.headers.accept || '';
    
    if (acceptHeader.includes('text/html')) {
      // For browser navigation - maybe render a page
      return res.status(200).json({
        success: true,
        products,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalItems: totalCount,
          itemsPerPage: limitNum
        }
      });
    }

    // ✅ Default: Return JSON
    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum
      }
    });

  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================================
// ✅ Get Single Product - Public
// ============================================================
export const singleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('reviews.user', 'name email');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.views = (product.views || 0) + 1;
    await product.save();

    res.status(200).json({
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
// ✅ Create Product - Admin only
// ============================================================
export const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      brand, 
      sizes, 
      colors,
      stock,
      discount,
      isFeatured,
      isNewArrival
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, and category'
      });
    }

    // Handle image uploads from multer
    let images = [];
    if (req.files && req.files.length > 0) {
      // Upload to Cloudinary
      const uploadPromises = req.files.map(async (file) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'products',
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          });
          return {
            url: result.secure_url,
            publicId: result.public_id
          };
        } catch (uploadError) {
          console.error('Cloudinary Upload Error:', uploadError);
          return null;
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);
      images = uploadedImages.filter(img => img !== null);
    }

    // Create product
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      brand: brand || '',
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      stock: stock || 0,
      discount: discount || 0,
      images: images.length > 0 ? images : [],
      isFeatured: isFeatured || false,
      isNewArrival: isNewArrival || false,
      createdBy: req.user._id
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================================
// ✅ Delete Product - Admin only
// ============================================================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;

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

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(async (image) => {
        if (image.publicId) {
          try {
            await cloudinary.uploader.destroy(image.publicId);
          } catch (error) {
            console.error('Cloudinary Delete Error:', error);
          }
        }
      });
      await Promise.all(deletePromises);
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
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

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === userId.toString()
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment || existingReview.comment;
      existingReview.updatedAt = Date.now();
    } else {
      // Add new review
      product.reviews.push({
        user: userId,
        name: userName,
        rating: Number(rating),
        comment: comment || '',
        createdAt: Date.now()
      });
    }

    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.reviews.length;
    product.reviewCount = product.reviews.length;

    await product.save();

    res.status(200).json({
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