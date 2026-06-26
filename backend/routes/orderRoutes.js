import express from 'express';
import { 
    placeOrder, 
    placeOrderStripe, 
    placeOrderRazorpay,
    placeOrderBkash,
    placeOrderNagad,
    placeOrderRocket,
    verifyStripe, 
    verifyRazorpay,
    verifyBkash,
    verifyNagad,
    userOrders, 
    updateStatus, 
    allOrders,
    getOrderById
} from '../controllers/orderController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

// ============================================================
// Admin Routes
// ============================================================
orderRouter.get('/list', protect, admin, allOrders);
orderRouter.post('/status', protect, admin, updateStatus);

// ============================================================
// User Routes
// ============================================================
orderRouter.post('/userorders', protect, userOrders);
orderRouter.get('/:orderId', protect, getOrderById);

// ============================================================
// Payment Routes - COD
// ============================================================
orderRouter.post('/place', protect, placeOrder);

// ============================================================
// Payment Routes - bKash
// ============================================================
orderRouter.post('/bkash', protect, placeOrderBkash);
orderRouter.get('/bkash/verify', verifyBkash);
orderRouter.post('/bkash/verify', verifyBkash);

// ============================================================
// Payment Routes - Nagad
// ============================================================
orderRouter.post('/nagad', protect, placeOrderNagad);
orderRouter.get('/nagad/verify', verifyNagad);
orderRouter.post('/nagad/verify', verifyNagad);

// ============================================================
// Payment Routes - Stripe
// ============================================================
orderRouter.post('/stripe', protect, placeOrderStripe);
orderRouter.post('/verifyStripe', protect, verifyStripe);

// ============================================================
// Payment Routes - Razorpay
// ============================================================
orderRouter.post('/razorpay', protect, placeOrderRazorpay);
orderRouter.post('/verifyRazorpay', protect, verifyRazorpay);

// ============================================================
// Payment Routes - Rocket (Coming Soon)
// ============================================================
orderRouter.post('/rocket', protect, placeOrderRocket);

// ============================================================
// Health Check Route
// ============================================================
orderRouter.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Order service is running',
        paymentMethods: ['COD', 'bKash', 'Nagad', 'Stripe', 'Razorpay', 'Rocket'],
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// Export
// ============================================================
export default orderRouter;