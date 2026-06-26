import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';
import razorpay from 'razorpay';
import axios from 'axios';
import crypto from 'crypto';

// Global variables for payment gateways
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ============================================================
// bKash Configuration
// ============================================================
const BKASH_CONFIG = {
    baseURL: process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
    appKey: process.env.BKASH_APP_KEY,
    appSecret: process.env.BKASH_APP_SECRET,
    username: process.env.BKASH_USERNAME,
    password: process.env.BKASH_PASSWORD,
};

// ============================================================
// Nagad Configuration
// ============================================================
const NAGAD_CONFIG = {
    baseURL: process.env.NAGAD_BASE_URL || 'https://sandbox.mynagad.com/api/dfs',
    merchantId: process.env.NAGAD_MERCHANT_ID,
    merchantNumber: process.env.NAGAD_MERCHANT_NUMBER,
    publicKey: process.env.NAGAD_PUBLIC_KEY,
    privateKey: process.env.NAGAD_PRIVATE_KEY,
};

// ============================================================
// Helper Functions
// ============================================================
const cleanIncomingItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
        _id: item._id || item.productId,
        name: item.name || "Unknown Item",
        price: Number(item.price) || 0,
        size: item.size || "M",
        quantity: Number(item.quantity) || 1,
        image: Array.isArray(item.image) ? item.image[0] : (item.image || "")
    }));
};

const formatAddress = (address) => ({
    firstName: address?.firstName || "",
    lastName: address?.lastName || "",
    email: address?.email || "",
    street: address?.street || "",
    city: address?.city || "",
    state: address?.state || "",
    zipcode: address?.zipcode || "",
    country: address?.country || "Bangladesh",
    phone: address?.phone || "",
    division: address?.division || "",
    district: address?.district || "",
    fullAddress: address?.fullAddress || "",
});

// ============================================================
// 1. Place Order using COD
// ============================================================
export const placeOrder = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId;
        const { items, amount, address } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication Failed: User ID missing." });
        }

        const cleanItems = cleanIncomingItems(items);
        const cleanAddress = formatAddress(address);

        const orderData = {
            userId,
            items: cleanItems,
            address: cleanAddress,
            amount: Number(amount),
            paymentMethod: "COD",
            payment: false,
            status: "Pending",
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        return res.json({ success: true, message: "Order Placed Successfully", orderId: newOrder._id });

    } catch (error) {
        console.error("=== COD CRASH LOG ===", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// 2. bKash Payment Integration
// ============================================================

// Get bKash Token
const getBkashToken = async () => {
    try {
        const response = await axios.post(
            `${BKASH_CONFIG.baseURL}/tokenized/checkout/token/grant`,
            {
                app_key: BKASH_CONFIG.appKey,
                app_secret: BKASH_CONFIG.appSecret,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }
        );

        if (response.data && response.data.id_token) {
            return response.data.id_token;
        }
        throw new Error('Failed to get bKash token');
    } catch (error) {
        console.error('bKash Token Error:', error.response?.data || error.message);
        throw new Error('bKash authentication failed');
    }
};

// Create bKash Payment
export const placeOrderBkash = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId;
        const { items, amount, address } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication Failed." });
        }

        // Create order first
        const cleanItems = cleanIncomingItems(items);
        const cleanAddress = formatAddress(address);

        const orderData = {
            userId,
            items: cleanItems,
            address: cleanAddress,
            amount: Number(amount),
            paymentMethod: "bKash",
            payment: false,
            status: "Pending",
            date: Date.now()
        };

        const newOrder = await orderModel.create(orderData);

        // Get bKash token
        const token = await getBkashToken();

        // Create bKash payment
        const paymentResponse = await axios.post(
            `${BKASH_CONFIG.baseURL}/tokenized/checkout/create`,
            {
                mode: '0011',
                payerReference: userId,
                callbackURL: `${process.env.FRONTEND_URL}/verify?orderId=${newOrder._id}&payment=bkash`,
                amount: Number(amount).toFixed(2),
                currency: 'BDT',
                intent: 'sale',
                merchantInvoiceNumber: `INV-${newOrder._id}-${Date.now()}`,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': token,
                    'X-APP-Key': BKASH_CONFIG.appKey,
                }
            }
        );

        if (paymentResponse.data && paymentResponse.data.paymentID) {
            // Execute payment
            const executeResponse = await axios.post(
                `${BKASH_CONFIG.baseURL}/tokenized/checkout/execute`,
                {
                    paymentID: paymentResponse.data.paymentID,
                    merchantInvoiceNumber: `INV-${newOrder._id}-${Date.now()}`,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': token,
                        'X-APP-Key': BKASH_CONFIG.appKey,
                    }
                }
            );

            if (executeResponse.data && executeResponse.data.transactionStatus === 'Completed') {
                // Update order as paid
                await orderModel.findByIdAndUpdate(newOrder._id, { payment: true, status: "Processing" });
                await userModel.findByIdAndUpdate(userId, { cartData: {} });
                
                return res.json({
                    success: true,
                    message: "bKash payment successful",
                    transactionId: executeResponse.data.trxID,
                    orderId: newOrder._id
                });
            } else {
                // Payment failed or pending
                return res.json({
                    success: false,
                    message: "bKash payment failed or pending",
                    paymentID: paymentResponse.data.paymentID,
                    orderId: newOrder._id
                });
            }
        } else {
            // Delete order if payment creation failed
            await orderModel.findByIdAndDelete(newOrder._id);
            throw new Error('Failed to create bKash payment');
        }

    } catch (error) {
        console.error("=== BKASH CRASH LOG ===", error);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || "bKash payment failed"
        });
    }
};

// bKash Payment Callback / Verify
export const verifyBkash = async (req, res) => {
    try {
        const { orderId, paymentID, status } = req.query;

        if (status === 'success' || status === 'Completed') {
            // Verify payment with bKash
            const token = await getBkashToken();
            
            const verifyResponse = await axios.post(
                `${BKASH_CONFIG.baseURL}/tokenized/checkout/verify`,
                {
                    paymentID: paymentID,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': token,
                        'X-APP-Key': BKASH_CONFIG.appKey,
                    }
                }
            );

            if (verifyResponse.data && verifyResponse.data.transactionStatus === 'Completed') {
                await orderModel.findByIdAndUpdate(orderId, { payment: true, status: "Processing" });
                const order = await orderModel.findById(orderId);
                if (order) {
                    await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
                }
                return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=success`);
            } else {
                await orderModel.findByIdAndDelete(orderId);
                return res.redirect(`${process.env.FRONTEND_URL}/cart?payment=failed`);
            }
        } else {
            await orderModel.findByIdAndDelete(orderId);
            return res.redirect(`${process.env.FRONTEND_URL}/cart?payment=cancelled`);
        }
    } catch (error) {
        console.error("=== BKASH VERIFY ERROR ===", error);
        return res.redirect(`${process.env.FRONTEND_URL}/cart?payment=error`);
    }
};

// ============================================================
// 3. Nagad Payment Integration
// ============================================================

// Generate Nagad Signature
const generateNagadSignature = (data, privateKey) => {
    const crypto = require('crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(JSON.stringify(data));
    return sign.sign(privateKey, 'base64');
};

// Create Nagad Payment
export const placeOrderNagad = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId;
        const { items, amount, address } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication Failed." });
        }

        // Create order first
        const cleanItems = cleanIncomingItems(items);
        const cleanAddress = formatAddress(address);

        const orderData = {
            userId,
            items: cleanItems,
            address: cleanAddress,
            amount: Number(amount),
            paymentMethod: "Nagad",
            payment: false,
            status: "Pending",
            date: Date.now()
        };

        const newOrder = await orderModel.create(orderData);

        // Generate Nagad payment data
        const merchantId = NAGAD_CONFIG.merchantId;
        const merchantNumber = NAGAD_CONFIG.merchantNumber;
        const orderId = `ORD-${newOrder._id}-${Date.now()}`;
        const datetime = new Date().toISOString().replace(/[-:T.Z]/g, '');

        const paymentData = {
            merchantId: merchantId,
            merchantNumber: merchantNumber,
            orderId: orderId,
            amount: Number(amount).toFixed(2),
            datetime: datetime,
            challenge: crypto.randomBytes(16).toString('hex'),
        };

        // Generate signature
        const signature = generateNagadSignature(paymentData, NAGAD_CONFIG.privateKey);

        // Create Nagad payment request
        const response = await axios.post(
            `${NAGAD_CONFIG.baseURL}/payment/initialize`,
            {
                ...paymentData,
                signature: signature,
                callbackURL: `${process.env.FRONTEND_URL}/verify?orderId=${newOrder._id}&payment=nagad`,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-API-Key': NAGAD_CONFIG.publicKey,
                }
            }
        );

        if (response.data && response.data.paymentReferenceId) {
            // Update order with Nagad payment reference
            await orderModel.findByIdAndUpdate(newOrder._id, {
                paymentReference: response.data.paymentReferenceId,
                nagadOrderId: orderId,
            });

            // Return payment URL to frontend
            return res.json({
                success: true,
                paymentUrl: `${NAGAD_CONFIG.baseURL}/payment/${response.data.paymentReferenceId}`,
                paymentReferenceId: response.data.paymentReferenceId,
                orderId: newOrder._id,
                message: "Nagad payment initialized successfully"
            });
        } else {
            await orderModel.findByIdAndDelete(newOrder._id);
            throw new Error('Failed to initialize Nagad payment');
        }

    } catch (error) {
        console.error("=== NAGAD CRASH LOG ===", error);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || "Nagad payment failed"
        });
    }
};

// Nagad Payment Callback / Verify
export const verifyNagad = async (req, res) => {
    try {
        const { orderId, paymentReferenceId, status } = req.query;

        if (status === 'success' || status === 'Completed') {
            // Verify payment with Nagad
            const response = await axios.get(
                `${NAGAD_CONFIG.baseURL}/payment/verify/${paymentReferenceId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-API-Key': NAGAD_CONFIG.publicKey,
                    }
                }
            );

            if (response.data && response.data.status === 'Completed') {
                await orderModel.findByIdAndUpdate(orderId, { payment: true, status: "Processing" });
                const order = await orderModel.findById(orderId);
                if (order) {
                    await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
                }
                return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=success`);
            } else {
                await orderModel.findByIdAndDelete(orderId);
                return res.redirect(`${process.env.FRONTEND_URL}/cart?payment=failed`);
            }
        } else {
            await orderModel.findByIdAndDelete(orderId);
            return res.redirect(`${process.env.FRONTEND_URL}/cart?payment=cancelled`);
        }
    } catch (error) {
        console.error("=== NAGAD VERIFY ERROR ===", error);
        return res.redirect(`${process.env.FRONTEND_URL}/cart?payment=error`);
    }
};

// ============================================================
// 4. Place Order using Stripe
// ============================================================
export const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId;
        const { items, amount, address } = req.body;
        const origin = req.headers.origin || req.headers.referer || "http://localhost:5173";

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication Failed." });
        }

        const cleanItems = cleanIncomingItems(items);
        const cleanAddress = formatAddress(address);

        const orderData = {
            userId,
            items: cleanItems,
            address: cleanAddress,
            amount: Number(amount),
            paymentMethod: "Stripe",
            payment: false,
            status: "Pending",
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = cleanItems.map((item) => ({
            price_data: {
                currency: 'bdt',
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity
        }));

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}&payment=stripe`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}&payment=stripe`,
            line_items,
            mode: 'payment',
        });

        return res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.error("=== STRIPE CRASH LOG ===", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// 5. Place Order using Razorpay
// ============================================================
export const placeOrderRazorpay = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId;
        const { items, amount, address } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication Failed." });
        }

        const cleanItems = cleanIncomingItems(items);
        const cleanAddress = formatAddress(address);

        const orderData = {
            userId,
            items: cleanItems,
            address: cleanAddress,
            amount: Number(amount),
            paymentMethod: "Razorpay",
            payment: false,
            status: "Pending",
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const options = {
            amount: Math.round(Number(amount) * 100),
            currency: 'INR',
            receipt: newOrder._id.toString(),
        };

        const order = await razorpayInstance.orders.create(options);
        return res.json({ success: true, order });

    } catch (error) {
        console.error("=== RAZORPAY CRASH LOG ===", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// 6. Verify Stripe Payment
// ============================================================
export const verifyStripe = async (req, res) => {
    try {
        const { orderId, success, userId } = req.body;

        if (success === "true" || success === true) {
            await orderModel.findByIdAndUpdate(orderId, { payment: true, status: "Processing" });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            return res.json({ success: true, message: "Payment Successful" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            return res.json({ success: false, message: "Payment Failed" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// 7. Verify Razorpay Payment
// ============================================================
export const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature, receiptOrderId } = req.body;

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            await orderModel.findByIdAndUpdate(receiptOrderId, { payment: true, status: "Processing" });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            return res.json({ success: true, message: "Payment Successful" });
        } else {
            return res.status(400).json({ success: false, message: "Payment Verification Failed" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// 8. Verify Rocket Payment (Placeholder)
// ============================================================
export const placeOrderRocket = async (req, res) => {
    try {
        // Rocket payment integration placeholder
        return res.json({
            success: false,
            message: "Rocket payment integration coming soon!"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// 9. Get All Orders
// ============================================================
export const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });
        return res.json({ success: true, orders });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// 10. Get User-Specific Orders
// ============================================================
export const userOrders = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId;
        const orders = await orderModel.find({ userId }).sort({ date: -1 });
        return res.json({ success: true, orders });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// 11. Update Order Status
// ============================================================
export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        return res.json({ success: true, message: "Order status updated successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// 12. Get Order by ID
// ============================================================
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        return res.json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


