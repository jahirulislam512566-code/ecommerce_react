// backend/controllers/orderController.js
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

// ============================================================
// Get User Orders (GET request)
// ============================================================
export const userOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, limit = 20, page = 1 } = req.query;

        const query = { userId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .limit(Number(limit))
                .skip(skip),
            Order.countDocuments(query)
        ]);

        // Calculate total spent
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        res.json({
            success: true,
            orders,
            totalSpent,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });

    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

// ============================================================
// Get Order by ID
// ============================================================
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (order.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this order'
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};

// ============================================================
// Update Order Status (Admin)
// ============================================================
export const updateStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

// ============================================================
// Cancel Order
// ============================================================
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (order.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        const nonCancellableStatuses = ['Delivered', 'Cancelled', 'Refunded'];
        if (nonCancellableStatuses.includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled in ${order.status} state`
            });
        }

        // Restore product stock
        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (product && product.stock !== undefined) {
                product.stock += (item.quantity || 1);
                await product.save();
            }
        }

        order.status = 'Cancelled';
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    }
};

// ============================================================
// All Orders (Admin)
// ============================================================
export const allOrders = async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;

        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(Number(limit))
                .skip(skip),
            Order.countDocuments(query)
        ]);

        // Calculate summary
        const summary = {
            totalOrders: total,
            totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
            pendingOrders: orders.filter(o => o.status === 'Pending').length,
            processingOrders: orders.filter(o => o.status === 'Processing').length,
            shippedOrders: orders.filter(o => o.status === 'Shipped').length,
            deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
            cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
        };

        res.json({
            success: true,
            orders,
            summary,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

// ============================================================
// Place Order
// ============================================================
export const placeOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            items,
            subtotal,
            deliveryCharge,
            discount,
            amount,
            address,
            paymentMethod,
            deliveryMethod = 'standard',
            deliveryNote = '',
        } = req.body;

        // Validate
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        if (!address || !address.firstName || !address.phone) {
            return res.status(400).json({
                success: false,
                message: 'Complete address information is required'
            });
        }

        // Create order
        const order = new Order({
            userId,
            items,
            subtotal: subtotal || 0,
            deliveryCharge: deliveryCharge || 0,
            discount: discount || 0,
            totalAmount: amount || (subtotal + (deliveryCharge || 0)),
            address,
            status: 'Pending',
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            payment: false,
            deliveryMethod,
            deliveryNote: deliveryNote || '',
            orderDate: new Date(),
            date: Date.now(),
        });

        await order.save();

        // Generate tracking number
        order.trackingNumber = `TRK${Date.now().toString().slice(-8)}${order._id.toString().slice(-4)}`;
        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: {
                _id: order._id,
                status: order.status,
                totalAmount: order.totalAmount,
                trackingNumber: order.trackingNumber,
            }
        });

    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to place order',
            error: error.message
        });
    }
};

// ============================================================
// Placeholder Payment Methods
// ============================================================
export const placeOrderStripe = async (req, res) => {
    res.json({ success: true, message: 'Stripe payment coming soon' });
};

export const placeOrderRazorpay = async (req, res) => {
    res.json({ success: true, message: 'Razorpay payment coming soon' });
};

export const placeOrderBkash = async (req, res) => {
    res.json({ success: true, message: 'bKash payment coming soon' });
};

export const placeOrderNagad = async (req, res) => {
    res.json({ success: true, message: 'Nagad payment coming soon' });
};

export const placeOrderRocket = async (req, res) => {
    res.json({ success: true, message: 'Rocket payment coming soon' });
};

export const verifyStripe = async (req, res) => {
    res.json({ success: true, message: 'Stripe verified' });
};

export const verifyRazorpay = async (req, res) => {
    res.json({ success: true, message: 'Razorpay verified' });
};

export const verifyBkash = async (req, res) => {
    res.json({ success: true, message: 'bKash verified' });
};