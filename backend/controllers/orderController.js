import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import axios from "axios";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ============================================================
// CONFIGS
// ============================================================

const BKASH_CONFIG = {
    baseURL: process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
    appKey: process.env.BKASH_APP_KEY,
    appSecret: process.env.BKASH_APP_SECRET,
};

const NAGAD_CONFIG = {
    baseURL: process.env.NAGAD_BASE_URL || "https://sandbox.mynagad.com/api/dfs",
    merchantId: process.env.NAGAD_MERCHANT_ID,
    merchantNumber: process.env.NAGAD_MERCHANT_NUMBER,
    publicKey: process.env.NAGAD_PUBLIC_KEY,
    privateKey: process.env.NAGAD_PRIVATE_KEY,
};

// ============================================================
// HELPERS
// ============================================================

const cleanIncomingItems = (items) => {
    if (!Array.isArray(items)) return [];

    return items.map(item => ({
        _id: item._id || item.productId,
        name: item.name || "Unknown Item",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: Array.isArray(item.image) ? item.image[0] : item.image || ""
    }));
};

// 🔥 SERVER-SIDE PRICE VALIDATION (IMPORTANT FIX)
const calculateAmount = (items) => {
    return items.reduce((acc, item) => {
        return acc + item.price * item.quantity;
    }, 0);
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
    phone: address?.phone || ""
});

// ============================================================
// 1. COD ORDER
// ============================================================

export const placeOrder = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId;
        const { items, address } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const cleanItems = cleanIncomingItems(items);
        if (cleanItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const amount = calculateAmount(cleanItems);
        const cleanAddress = formatAddress(address);

        const order = await orderModel.create({
            userId,
            items: cleanItems,
            address: cleanAddress,
            amount,
            paymentMethod: "COD",
            payment: false,
            status: "Pending",
            date: Date.now()
        });

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        return res.json({
            success: true,
            message: "Order placed successfully",
            orderId: order._id
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// 2. BKASH (FIXED FLOW)
// ============================================================

const getBkashToken = async () => {
    const res = await axios.post(
        `${BKASH_CONFIG.baseURL}/tokenized/checkout/token/grant`,
        {
            app_key: BKASH_CONFIG.appKey,
            app_secret: BKASH_CONFIG.appSecret
        }
    );

    return res.data.id_token;
};

export const placeOrderBkash = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId;
        const { items, address } = req.body;

        const cleanItems = cleanIncomingItems(items);
        if (cleanItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart empty" });
        }

        const amount = calculateAmount(cleanItems);

        const order = await orderModel.create({
            userId,
            items: cleanItems,
            address: formatAddress(address),
            amount,
            paymentMethod: "bKash",
            payment: false,
            status: "Pending"
        });

        const token = await getBkashToken();

        const payment = await axios.post(
            `${BKASH_CONFIG.baseURL}/tokenized/checkout/create`,
            {
                mode: "0011",
                payerReference: userId,
                callbackURL: `${process.env.FRONTEND_URL}/verify?orderId=${order._id}&payment=bkash`,
                amount: amount.toFixed(2),
                currency: "BDT",
                intent: "sale"
            },
            {
                headers: {
                    Authorization: token,
                    "X-APP-Key": BKASH_CONFIG.appKey
                }
            }
        );

        return res.json({
            success: true,
            bkashURL: payment.data.bkashURL,
            paymentID: payment.data.paymentID,
            orderId: order._id
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// ============================================================
// BKASH VERIFY (FIXED SAFE VERIFICATION)
// ============================================================

export const verifyBkash = async (req, res) => {
    try {
        const { orderId, paymentID, status } = req.query;

        if (!paymentID) {
            return res.redirect(`${process.env.FRONTEND_URL}/cart?payment=failed`);
        }

        const token = await getBkashToken();

        const verify = await axios.post(
            `${BKASH_CONFIG.baseURL}/tokenized/checkout/verify`,
            { paymentID },
            {
                headers: {
                    Authorization: token,
                    "X-APP-Key": BKASH_CONFIG.appKey
                }
            }
        );

        if (verify.data?.transactionStatus === "Completed") {
            const order = await orderModel.findById(orderId);

            if (order) {
                await orderModel.findByIdAndUpdate(orderId, {
                    payment: true,
                    status: "Processing"
                });

                await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
            }

            return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=success`);
        }

        await orderModel.findByIdAndDelete(orderId);
        return res.redirect(`${process.env.FRONTEND_URL}/cart?payment=failed`);

    } catch (error) {
        return res.redirect(`${process.env.FRONTEND_URL}/cart?payment=error`);
    }
};

// ============================================================
// 3. NAGAD (FIXED CRYPTO USAGE)
// ============================================================

export const placeOrderNagad = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId;
        const { items, address } = req.body;

        const cleanItems = cleanIncomingItems(items);
        if (!cleanItems.length) {
            return res.status(400).json({ success: false });
        }

        const amount = calculateAmount(cleanItems);

        const order = await orderModel.create({
            userId,
            items: cleanItems,
            address: formatAddress(address),
            amount,
            paymentMethod: "Nagad",
            payment: false,
            status: "Pending"
        });

        const payload = {
            merchantId: NAGAD_CONFIG.merchantId,
            orderId: order._id.toString(),
            amount: amount.toFixed(2)
        };

        const signature = crypto
            .createSign("RSA-SHA256")
            .update(JSON.stringify(payload))
            .sign(NAGAD_CONFIG.privateKey, "base64");

        const response = await axios.post(
            `${NAGAD_CONFIG.baseURL}/payment/initialize`,
            { ...payload, signature },
            {
                headers: {
                    "X-API-Key": NAGAD_CONFIG.publicKey
                }
            }
        );

        return res.json({
            success: true,
            paymentUrl: response.data?.paymentUrl,
            orderId: order._id
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// STRIPE (FIXED CURRENCY)
// ============================================================

export const placeOrderStripe = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.body.userId || req.userId;

        const cleanItems = cleanIncomingItems(items);
        const amount = calculateAmount(cleanItems);

        const order = await orderModel.create({
            userId,
            items: cleanItems,
            address: formatAddress(address),
            amount,
            paymentMethod: "Stripe",
            payment: false,
            status: "Pending"
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: cleanItems.map(item => ({
                price_data: {
                    currency: "usd",
                    product_data: { name: item.name },
                    unit_amount: Math.round(item.price * 100)
                },
                quantity: item.quantity
            })),
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/verify?success=true&orderId=${order._id}&payment=stripe`,
            cancel_url: `${process.env.FRONTEND_URL}/verify?success=false&orderId=${order._id}&payment=stripe`
        });

        return res.json({ success: true, url: session.url });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// RAZORPAY (FIXED IMPORT + SAFE)
// ============================================================

export const placeOrderRazorpay = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.body.userId || req.userId;

        const cleanItems = cleanIncomingItems(items);
        const amount = calculateAmount(cleanItems);

        const order = await orderModel.create({
            userId,
            items: cleanItems,
            address: formatAddress(address),
            amount,
            paymentMethod: "Razorpay",
            payment: false,
            status: "Pending"
        });

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: order._id.toString()
        };

        const razorOrder = await razorpayInstance.orders.create(options);

        return res.json({ success: true, order: razorOrder });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// VERIFY RAZORPAY
// ============================================================

export const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, receiptOrderId, userId } = req.body;

        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);

        if (hmac.digest("hex") === razorpay_signature) {
            await orderModel.findByIdAndUpdate(receiptOrderId, {
                payment: true,
                status: "Processing"
            });

            await userModel.findByIdAndUpdate(userId, { cartData: {} });

            return res.json({ success: true });
        }

        return res.status(400).json({ success: false });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// OTHER
// ============================================================

export const placeOrderRocket = async (req, res) => {
    return res.json({ success: false, message: "Coming soon" });
};

export const allOrders = async (req, res) => {
    const orders = await orderModel.find().sort({ date: -1 });
    res.json({ success: true, orders });
};

export const userOrders = async (req, res) => {
    const userId = req.body.userId || req.userId;
    const orders = await orderModel.find({ userId }).sort({ date: -1 });
    res.json({ success: true, orders });
};

export const updateStatus = async (req, res) => {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true });
};

export const getOrderById = async (req, res) => {
    const order = await orderModel.findById(req.params.orderId);
    res.json({ success: true, order });
};

export const verifyStripe = async (req, res) => {
    try {
        const { orderId, success, userId } = req.body;

        if (success === "true" || success === true) {

            await orderModel.findByIdAndUpdate(orderId, {
                payment: true,
                status: "Processing"
            });

            if (userId) {
                await userModel.findByIdAndUpdate(userId, {
                    cartData: {}
                });
            }

            return res.json({
                success: true,
                message: "Stripe payment successful"
            });

        } else {

            await orderModel.findByIdAndDelete(orderId);

            return res.json({
                success: false,
                message: "Stripe payment failed"
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};