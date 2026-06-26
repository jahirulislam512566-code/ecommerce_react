// backend/routes/cartRoutes.js
import express from 'express';
import { 
  addToCart, 
  updateCart, 
  getCart, 
  removeFromCart, 
  clearCart,
  syncCart
} from '../controllers/cartController.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // ✅ Use protect, not authMiddleware

const router = express.Router();

// All cart routes require authentication
router.use(protect); // ✅ This is the correct middleware

// Cart routes
router.post('/add', addToCart);
router.put('/update', updateCart);
router.get('/', getCart);
router.delete('/remove/:productId/:size', removeFromCart);
router.delete('/clear', clearCart);
router.post('/sync', syncCart);

// Admin routes (optional)
// router.delete('/admin/clear-all', protect, admin, clearAllCarts);

export default router;