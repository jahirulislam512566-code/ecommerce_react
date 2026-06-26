import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import helmet from 'helmet';
import connectDB from './config/db.js';
import { connectCloudinary } from './config/cloudinary.js';

// Route Imports
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import orderRouter from './routes/orderRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to Services
connectDB();
connectCloudinary();

// --- Security Middleware ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5173", "http://localhost:5174", "http://localhost:4173", "http://localhost:4174"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// --- Body Parsers ---
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 

// --- CORS Setup ---
const allowedOrigins = [
    // Development
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4173',
    'http://localhost:4174',
    'http://localhost:5173',  // Frontend Vite
    'http://localhost:5174',  // Admin Vite
    'http://localhost:5175',  // Backup Vite
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    // Production (Add your domains)
    // 'https://yourdomain.com',
    // 'https://admin.yourdomain.com',
    // 'https://api.yourdomain.com'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS Blocked for origin: ${origin}`);
            callback(new Error(`CORS policy: ${origin} not allowed`), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'token',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Allow-Origin'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400
};

app.use(cors(corsOptions));

// REMOVE THIS LINE - It's causing the error
// app.options('*', cors(corsOptions));

// --- API Routes ---
app.use('/api/user', userRouter);
app.use('/api/product', productRouter); 
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
    res.status(200).json({ 
        success: true, 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "NexusBD API Active",
        version: '1.0.0',
        endpoints: {
            auth: '/api/user',
            products: '/api/product',
            cart: '/api/cart',
            orders: '/api/order',
            health: '/health'
        }
    });
});

// --- 404 Handler ---
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        availableRoutes: [
            '/api/user',
            '/api/product',
            '/api/cart',
            '/api/order',
            '/health',
            '/'
        ]
    });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: err.errors
        });
    }
    
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy: Origin not allowed'
        });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV !== 'production' && { 
            stack: err.stack,
            error: err
        })
    });
});

// --- Start Server ---
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);
});

// --- Graceful Shutdown ---
const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
    
    setTimeout(() => {
        console.error('Force shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});

export default app;