import express from 'express';
import { 
  createProduct, 
  getProducts, 
  singleProduct, 
  deleteProduct,
  addProductReview,
  // ✅ Remove these if they don't exist yet
  // getProductsByCategory,
  // getFeaturedProducts,
  // getNewArrivals
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// ============================================================
// ✅ PUBLIC ROUTES (No authentication required)
// ============================================================

// ✅ GET all products - Supports both /list and / (root)
router.route('/').get(getProducts);
router.route('/list').get(getProducts);

// ✅ GET single product by ID
router.route('/:id').get(singleProduct);

// ✅ OPTIONAL: Add these when you create the controller functions
// router.route('/category/:category').get(getProductsByCategory);
// router.route('/featured').get(getFeaturedProducts);
// router.route('/new-arrivals').get(getNewArrivals);

// ============================================================
// ✅ PROTECTED ROUTES (Admin only)
// ============================================================

// ✅ POST create product - Admin only
router.route('/add').post(protect, admin, upload.array('images', 10), createProduct);

// ✅ POST delete product - Admin only
router.route('/remove').post(protect, admin, deleteProduct);

// ✅ POST add product review - Authenticated users only
router.route('/review').post(protect, addProductReview);

// ✅ OPTIONAL: Update product - Admin only
// router.route('/:id').put(protect, admin, updateProduct);

export default router;