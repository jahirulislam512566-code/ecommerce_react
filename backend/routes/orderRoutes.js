// backend/routes/orderRoutes.js
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
    getOrderById,
    cancelOrder
} from '../controllers/orderController.js';

import { admin, protect } from '../middleware/authMiddleware.js';
import Order from '../models/orderModel.js';

// ✅ Initialize router FIRST
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
            payments: ['/bkash', '/stripe', '/razorpay', '/rocket']
        }
    });
});

// ============================================================
// DEBUG ROUTE (Remove in production)
// ============================================================
orderRouter.get('/debug/check', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        
        console.log('🔍 Debug: Checking orders for user:', userId);
        
        // Get all orders (no filter)
        const allOrders = await Order.find({});
        
        // Get orders for this user
        const userOrdersList = await Order.find({ userId });
        
        console.log(`📊 Total orders in DB: ${allOrders.length}`);
        console.log(`📊 User orders: ${userOrdersList.length}`);
        
        res.json({
            success: true,
            debug: {
                totalOrdersInDB: allOrders.length,
                userOrdersCount: userOrdersList.length,
                userId: userId,
                userEmail: req.user.email,
                allOrders: allOrders.map(o => ({
                    id: o._id,
                    userId: o.userId,
                    status: o.status,
                    totalAmount: o.totalAmount || o.amount,
                    createdAt: o.createdAt
                })),
                userOrders: userOrdersList.map(o => ({
                    id: o._id,
                    status: o.status,
                    totalAmount: o.totalAmount || o.amount,
                    createdAt: o.createdAt,
                    itemsCount: o.items?.length || 0
                }))
            }
        });
    } catch (error) {
        console.error('❌ Debug error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// ADMIN ROUTES (Protected)
// ============================================================
orderRouter.get('/list', protect, admin, allOrders);
orderRouter.post('/status', protect, admin, updateStatus);

// ============================================================
// USER ORDERS (Protected)
// ✅ GET request for user orders
// ============================================================
orderRouter.get('/userorders', protect, userOrders);

// ============================================================
// PAYMENT ROUTES - COD (Protected)
// ============================================================
orderRouter.post('/place', protect, placeOrder);

// ============================================================
// PAYMENT ROUTES - bKash (Protected)
// ============================================================
orderRouter.post('/bkash', protect, placeOrderBkash);
orderRouter.post('/bkash/verify', verifyBkash);

// ============================================================
// PAYMENT ROUTES - Nagad (Protected)
// ============================================================
orderRouter.post('/nagad', protect, placeOrderNagad);
// orderRouter.post('/nagad/verify', verifyNagad);

// ============================================================
// PAYMENT ROUTES - Stripe (Protected)
// ============================================================
orderRouter.post('/stripe', protect, placeOrderStripe);
orderRouter.post('/stripe/verify', protect, verifyStripe);

// ============================================================
// PAYMENT ROUTES - Razorpay (Protected)
// ============================================================
orderRouter.post('/razorpay', protect, placeOrderRazorpay);
orderRouter.post('/razorpay/verify', protect, verifyRazorpay);

// ============================================================
// PAYMENT ROUTES - Rocket (Protected - Coming Soon)
// ============================================================
orderRouter.post('/rocket', protect, placeOrderRocket);

// ============================================================
// CANCEL ORDER (Protected)
// ============================================================
orderRouter.put('/:orderId/cancel', protect, cancelOrder);

// ============================================================
// UPDATE ORDER STATUS (Protected - Admin)
// ============================================================
orderRouter.put('/:orderId/status', protect, admin, updateStatus);

// ============================================================
// GET ORDER BY ID (Protected)
// ⚠️ IMPORTANT: This must be LAST because :orderId matches everything
// ============================================================
orderRouter.get('/:orderId', protect, getOrderById);

// ============================================================
// EXPORT
// ============================================================
export default orderRouter;