
import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";

import connectDB from "./config/db.js";
import { connectCloudinary } from "./config/cloudinary.js";

import userRouter from "./routes/userRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

/* ================================
   Validate Environment Variables
================================ */

const requiredEnv = [
    "MONGODB_URI",
    "JWT_SECRET",
    "CLOUDINARY_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_SECRET_KEY"
];

for (const key of requiredEnv) {
    if (!process.env[key]) {
        console.error("Missing Environment Variable:", key);
        process.exit(1);
    }
}

/* ================================
   Security
================================ */

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
        crossOriginEmbedderPolicy: false,
    })
);

/* ================================
   Body Parser
================================ */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================================
   CORS
================================ */

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",

    "https://frontend-rosy-eta-69.vercel.app"
];

app.use(
    cors({
        origin(origin, callback) {

            if (!origin)
                return callback(null, true);

            if (process.env.NODE_ENV !== "production")
                return callback(null, true);

            if (allowedOrigins.includes(origin))
                return callback(null, true);

            return callback(new Error("Not allowed by CORS"));
        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "token"
        ]
    })
);

/* ================================
   Routes
================================ */

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "API Running"
    });

});

app.get("/health", (req, res) => {

    res.json({
        success: true,
        uptime: process.uptime(),
        timestamp: new Date()
    });

});

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

/* ================================
   404
================================ */

app.use((req, res) => {

    res.status(404).json({

        success: false,
        message: "Route Not Found"

    });

});

/* ================================
   Error Handler
================================ */

app.use((err, req, res, next) => {

    console.error(err.stack);

    if (err.message === "Not allowed by CORS") {

        return res.status(403).json({
            success: false,
            message: err.message
        });

    }

    res.status(err.status || 500).json({

        success: false,
        message: err.message || "Internal Server Error"

    });

});

/* ================================
   Database Startup
================================ */

const startServer = async () => {

    try {

        await connectDB();
        console.log("✅ MongoDB Connected");

        await connectCloudinary();
        console.log("✅ Cloudinary Connected");

        if (!process.env.VERCEL) {

            app.listen(PORT, () => {

           console.log("Server Running on port:", PORT);

            });

        }

    } catch (err) {

        console.error("Startup Error:", err);

        process.exit(1);

    }

};

startServer();

export default app;

