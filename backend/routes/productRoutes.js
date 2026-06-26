import express from 'express';
import { 
  createProduct, 
  getProducts, 
  singleProduct, 
  deleteProduct,
  addProductReview
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// 💡 FIXED: Maps cleanly to -> GET http://localhost:4000/api/product/list
router.route('/list').get(getProducts);

// 💡 FIXED: Maps cleanly to -> POST http://localhost:4000/api/product/add
// Supports the frontend FormData file collection array key named 'images'
router.route('/add').post(protect, admin, upload.array('images', 10), createProduct);

// 💡 FIXED: Maps cleanly to -> POST http://localhost:4000/api/product/remove
// Intercepts the axios.post line from List.jsx and processes { id } from the body
router.route('/remove').post(protect, admin, deleteProduct);

// Protected user review posting hook pipeline
router.route('/review').post(protect, addProductReview);

// 💡 Dynamic ID routes are safely kept at the bottom so they don't block static naming paths
router.route('/:id').get(singleProduct);

export default router;