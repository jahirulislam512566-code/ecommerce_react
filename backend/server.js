// backend/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose"; // ✅ Added

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
// ENV VALIDATION
// ================================
const requiredEnv = ["MONGODB_URI", "JWT_SECRET"];
const missingRequired = requiredEnv.filter((key) => !process.env[key]);

if (missingRequired.length > 0) {
    console.error("❌ Missing required env:", missingRequired);
    process.exit(1);
}

// ================================
// SECURITY (Helmet)
// ================================
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false,
    })
);

// ================================
// BODY PARSER
// ================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ================================
// STATIC FILES (DEV ONLY)
// ================================
if (isDevelopment) {
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// ================================
// CORS FIX (IMPORTANT)
// ================================
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://ecommerce-react-8sid-dhm6429bo.vercel.app",
    "https://ecommerce-react-8sid.vercel.app",
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (isDevelopment) return callback(null, true);
        if (origin.includes("vercel.app")) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        console.warn("❌ CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "token",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ================================
// REQUEST LOG (DEV ONLY)
// ================================
if (isDevelopment) {
    app.use((req, res, next) => {
        console.log(`📤 ${req.method} ${req.url}`);
        next();
    });
}

// ================================
// 🚀 DATABASE CONNECTION MIDDLEWARE (FIX #1)
// ================================
app.use(async (req, res, next) => {
    try {
        // Skip health checks
        if (req.path === '/' || req.path === '/health') {
            return next();
        }

        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
            console.log(`⏳ DB not connected for ${req.method} ${req.path}, connecting...`);
            await connectDB();
            console.log("✅ DB connected for request");
        }
        next();
    } catch (error) {
        console.error("❌ DB connection middleware error:", error);
        res.status(503).json({
            success: false,
            error: "Database temporarily unavailable",
            message: error.message
        });
    }
});

// ================================
// ROUTES
// ================================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API Running",
        environment: isDevelopment ? "development" : "production",
        time: new Date().toISOString(),
        dbState: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

app.get("/health", (req, res) => {
    res.json({
        success: true,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        dbState: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

// API routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ================================
// 404 HANDLER
// ================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.url}`,
    });
});

// ================================
// GLOBAL ERROR HANDLER
// ================================
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(isDevelopment && { stack: err.stack }),
    });
});

// ================================
// PROCESS ERRORS
// ================================
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
});

// ================================
// START SERVER (FIX #2)
// ================================
const startServer = async () => {
    try {
        if (process.env.VERCEL) {
            console.log("🚀 Running on Vercel (serverless mode)");
            console.log("ℹ️ DB will connect on first request");
            
            // Try to connect in background (don't await)
            connectDB().catch(err => {
                console.warn("⚠️ Background DB connection failed:", err.message);
            });
            
            connectCloudinary().catch(err => {
                console.warn("⚠️ Cloudinary connection failed:", err.message);
            });
            
            return; // Don't start listening
        }

        // Local development - connect before starting
        await connectDB();
        console.log("✅ MongoDB Connected");

        try {
            await connectCloudinary();
            console.log("✅ Cloudinary Connected");
        } catch (err) {
            console.warn("⚠️ Cloudinary failed:", err.message);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running: http://localhost:${PORT}`);
            console.log(`   API: http://localhost:${PORT}/api`);
            console.log(`   Health: http://localhost:${PORT}/health`);
        });
        
    } catch (err) {
        console.error("❌ Startup Error:", err);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};

startServer();

export default app;