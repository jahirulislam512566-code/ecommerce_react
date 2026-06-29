// backend/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { connectCloudinary } from "./config/cloudinary.js";

import userRouter from "./routes/userRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";

// ================================
// Validate Environment Variables
// ================================

const requiredEnv = ["MONGODB_URI", "JWT_SECRET"];
const optionalEnv = ["CLOUDINARY_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_SECRET_KEY"];

const missingRequired = requiredEnv.filter(key => !process.env[key]);

if (missingRequired.length > 0) {
    console.error("❌ Missing required environment variables:", missingRequired.join(", "));
    process.exit(1);
}

// Log optional missing variables
const missingOptional = optionalEnv.filter(key => !process.env[key]);
if (missingOptional.length > 0) {
    console.warn("⚠️ Optional environment variables missing:", missingOptional.join(", "));
    console.warn("⚠️ Cloudinary features may not work properly");
}

console.log("✅ All required environment variables are present");

// ================================
// Security Headers
// ================================

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: "same-origin" },
        contentSecurityPolicy: isProduction ? undefined : false,
    })
);

// ================================
// Body Parser
// ================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ================================
// Static Files
// ================================

// Serve uploaded files (only in development)
if (isDevelopment) {
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// ================================
// CORS Configuration
// ================================

const allowedOrigins = [
    // Development
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    
    // Production
    "https://frontend-rosy-eta-69.vercel.app",
    // Add your production URL here
    // "https://yourdomain.com",
    // "https://www.yourdomain.com",
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // Allow all in development
        if (isDevelopment) return callback(null, true);

        // Check production origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn(`⚠️ CORS blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token", "Accept", "Origin"],
    exposedHeaders: ["Content-Length", "X-Request-Id"],
    maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// ================================
// Request Logging (Development Only)
// ================================

if (isDevelopment) {
    app.use((req, res, next) => {
        console.log(`📤 ${req.method} ${req.url}`);
        next();
    });
}

// ================================
// Routes
// ================================

// Health Check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API Running",
        version: "1.0.0",
        environment: isDevelopment ? "development" : "production",
        timestamp: new Date().toISOString(),
    });
});

app.get("/health", (req, res) => {
    res.json({
        success: true,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        environment: isDevelopment ? "development" : "production",
    });
});

// API Routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// API Documentation (Development Only)
if (isDevelopment) {
    app.get("/api", (req, res) => {
        res.json({
            success: true,
            message: "API Documentation",
            endpoints: {
                user: {
                    register: "POST /api/user/register",
                    login: "POST /api/user/login",
                    adminLogin: "POST /api/user/admin",
                    profile: "GET /api/user/profile",
                },
                product: {
                    getAll: "GET /api/product",
                    getById: "GET /api/product/:id",
                    add: "POST /api/product/add (Admin)",
                    update: "PUT /api/product/:id (Admin)",
                    delete: "DELETE /api/product/:id (Admin)",
                },
                cart: {
                    get: "GET /api/cart",
                    add: "POST /api/cart/add",
                    update: "PUT /api/cart/update",
                    remove: "DELETE /api/cart/remove/:productId",
                    clear: "DELETE /api/cart/clear",
                },
                order: {
                    place: "POST /api/order/place",
                    userOrders: "GET /api/order/userorders",
                    getById: "GET /api/order/:orderId",
                    cancel: "PUT /api/order/:orderId/cancel",
                    adminList: "GET /api/order/list (Admin)",
                },
            },
        });
    });
}

// ================================
// 404 Handler
// ================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
        ...(isDevelopment && { availableRoutes: "/api" }),
    });
});

// ================================
// Global Error Handler
// ================================

app.use((err, req, res, next) => {
    // Log error
    console.error("❌ Error occurred:", {
        name: err.name,
        message: err.message || "No message provided",
        stack: isDevelopment ? err.stack : undefined,
        code: err.code,
        status: err.status,
        method: req.method,
        url: req.url,
    });

    // Handle specific error types
    const errorResponses = {
        ValidationError: {
            status: 400,
            message: "Validation Error",
            errors: Object.values(err.errors).map((e) => e.message),
        },
        MongoError: {
            status: 409,
            message: "Duplicate entry found",
            field: err.keyPattern ? Object.keys(err.keyPattern)[0] : undefined,
        },
        "Not allowed by CORS": {
            status: 403,
            message: "Not allowed by CORS",
        },
    };

    const response = errorResponses[err.name] || errorResponses[err.message];
    if (response) {
        return res.status(response.status).json({ success: false, ...response });
    }

    // Default error response
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(isDevelopment && {
            stack: err.stack,
            name: err.name,
            code: err.code,
        }),
    });
});

// ================================
// Process Error Handlers
// ================================

process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
});

// ================================
// Server Startup
// ================================

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log("✅ MongoDB Connected");

        // Connect to Cloudinary (optional)
        try {
            await connectCloudinary();
            console.log("✅ Cloudinary Connected");
        } catch (error) {
            console.warn("⚠️ Cloudinary connection failed:", error.message);
            console.warn("⚠️ Images will be stored locally");
        }

        // Start server
        if (!process.env.VERCEL) {
            const server = app.listen(PORT, () => {
                console.log(`🚀 Server running on http://localhost:${PORT}`);
                console.log(`📚 Environment: ${isDevelopment ? "development" : "production"}`);
                if (isDevelopment) {
                    console.log(`📦 API Docs: http://localhost:${PORT}/api`);
                }
            });

            // Handle server errors
            server.on("error", (error) => {
                if (error.code === "EADDRINUSE") {
                    console.error(`❌ Port ${PORT} is already in use`);
                    process.exit(1);
                }
                console.error("❌ Server error:", error);
            });
        } else {
            console.log("✅ Running on Vercel - Serverless mode");
        }
    } catch (error) {
        console.error("❌ Startup Error:", error);
        process.exit(1);
    }
};

startServer();

// ================================
// Export for Vercel
// ================================
export default app;