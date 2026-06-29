// backend/middleware/multer.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// ============================================================
// 1. Configure Cloudinary Credentials
// ============================================================
const cloudName = process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_SECRET_KEY;

const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

console.log(`📦 Cloudinary: ${isCloudinaryConfigured ? '✅ Configured' : '❌ Not configured - Using local storage'}`);

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
    console.log('✅ Cloudinary configured successfully');
} else {
    console.warn('⚠️ Cloudinary credentials missing. Using local storage for images.');
}

// ============================================================
// 2. Setup Local Storage (Fallback)
// ============================================================
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/products';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// ============================================================
// 3. Setup Cloudinary Storage - FIXED
// ============================================================
let cloudinaryStorage = null;
if (isCloudinaryConfigured) {
    try {
        cloudinaryStorage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: async (req, file) => {
                const fileName = file.originalname.split('.')[0];
                const ext = file.originalname.split('.').pop(); // Get file extension
                const isSvg = file.mimetype === 'image/svg+xml' || 
                              file.originalname.toLowerCase().endsWith('.svg');
                
                // ✅ Return params based on file type
                if (isSvg) {
                    // SVG files - upload as raw with svg extension
                    return {
                        folder: 'ecommerce_products',
                        resource_type: 'raw',
                        public_id: `${Date.now()}-${fileName.replace(/\s+/g, '_')}.${ext}`,
                        format: 'svg',
                    };
                }
                
                // Regular images - include extension in public_id
                return {
                    folder: 'ecommerce_products',
                    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
                    transformation: [
                        { width: 1000, height: 1000, crop: 'limit', quality: 'auto' },
                        { fetch_format: 'auto' }
                    ],
                    public_id: `${Date.now()}-${fileName.replace(/\s+/g, '_')}.${ext}`,
                };
            },
        });
        console.log('✅ Cloudinary Storage configured');
    } catch (error) {
        console.error('❌ Cloudinary Storage configuration failed:', error.message);
        cloudinaryStorage = null;
    }
}

// ============================================================
// 4. Choose Storage Engine
// ============================================================
const storage = cloudinaryStorage && isCloudinaryConfigured ? cloudinaryStorage : localStorage;

// ============================================================
// 5. File Filter
// ============================================================
const fileFilter = (req, file, cb) => {
    console.log('🔍 File filter checking:', file.originalname, file.mimetype);
    
    const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'image/jpg', 
        'image/webp', 
        'image/gif',
        'image/svg+xml'
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    
    if (allowedTypes.includes(file.mimetype)) {
        console.log('✅ File accepted:', file.originalname);
        cb(null, true);
    } else {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            console.log('✅ File accepted by extension:', file.originalname);
            cb(null, true);
        } else {
            console.log('❌ File rejected:', file.originalname, file.mimetype);
            cb(new Error(`Invalid file type: ${file.mimetype || file.originalname}. Only images are allowed!`), false);
        }
    }
};

// ============================================================
// 6. Initialize Multer
// ============================================================
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024,
        files: 10,
        fieldSize: 10 * 1024 * 1024,
    },
    fileFilter: fileFilter
});

// ============================================================
// 7. Debug Middleware
// ============================================================
export const debugMulter = (req, res, next) => {
    console.log('🔍 Multer Debug:');
    console.log('  Content-Type:', req.headers['content-type']);
    console.log('  Content-Length:', req.headers['content-length']);
    console.log('  Method:', req.method);
    console.log('  URL:', req.url);
    next();
};

// ============================================================
// 8. Error Handler for Multer
// ============================================================
export const handleMulterError = (err, req, res, next) => {
    console.log('🔍 Multer Error Handler:', err);
    
    if (err instanceof multer.MulterError) {
        console.log('❌ Multer Error:', err.code, err.message);
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum file size is 10MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 10 files per request.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field. Please use "images" as the field name.'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    }
    
    if (err) {
        console.log('❌ General Error:', err.message || err);
        return res.status(400).json({
            success: false,
            message: err.message || 'Upload failed'
        });
    }
    
    next();
};

// ============================================================
// 9. Helper: Multiple Images Upload
// ============================================================
export const uploadMultiple = (req, res, next) => {
    console.log('🔍 uploadMultiple called');
    upload.array('images', 10)(req, res, (err) => {
        if (err) {
            console.log('❌ uploadMultiple error:', err);
            return next(err);
        }
        console.log('✅ uploadMultiple success, files:', req.files?.length || 0);
        console.log('✅ uploadMultiple success, body:', req.body);
        next();
    });
};

// ============================================================
// 10. Export Default
// ============================================================
export default upload;