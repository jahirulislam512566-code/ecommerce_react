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
    userOrders, 
    updateStatus, 
    allOrders,
    getOrderById
} from '../controllers/orderController.js';

import { admin, protect } from '../middleware/authMiddleware.js';

const orderRouter = express.Router();


// ============================================================
// ROOT ROUTE (fixes /api/order 404)
// ============================================================
orderRouter.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Order API is working',
        endpoints: {
            admin: ['/list', '/status'],
            user: ['/userorders', '/:orderId'],
            orders: ['/place'],
            payments: ['/bkash',  '/stripe', '/razorpay', '/rocket']
        }
    });
});


// ============================================================
// ADMIN ROUTES
// ============================================================
orderRouter.get('/list', protect, admin, allOrders);
orderRouter.post('/status', protect, admin, updateStatus);


// ============================================================
// USER ROUTES
// ============================================================
orderRouter.post('/userorders', protect, userOrders);


// ============================================================
// PAYMENT ROUTES - COD
// ============================================================
orderRouter.post('/place', protect, placeOrder);


// ============================================================
// PAYMENT ROUTES - bKash
// ============================================================
orderRouter.post('/bkash', protect, placeOrderBkash);
orderRouter.post('/bkash/verify', verifyBkash);


// ============================================================
// PAYMENT ROUTES - Nagad
// ============================================================
// orderRouter.post('/nagad', protect, placeOrderNagad);
// orderRouter.post('/nagad/verify', verifyNagad);


// ============================================================
// PAYMENT ROUTES - Stripe
// ============================================================
orderRouter.post('/stripe', protect, placeOrderStripe);
orderRouter.post('/stripe/verify', protect, verifyStripe);


// ============================================================
// PAYMENT ROUTES - Razorpay
// ============================================================
orderRouter.post('/razorpay', protect, placeOrderRazorpay);
orderRouter.post('/razorpay/verify', protect, verifyRazorpay);


// ============================================================
// PAYMENT ROUTES - Rocket (Coming Soon)
// ============================================================
orderRouter.post('/rocket', protect, placeOrderRocket);


// ============================================================
// IMPORTANT: PUT THIS AT THE BOTTOM
// ============================================================
orderRouter.get('/:orderId', protect, getOrderById);


// ============================================================
// EXPORT
// ============================================================
export default orderRouter;