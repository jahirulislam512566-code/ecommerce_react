import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configure Cloudinary Credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// 2. Setup Cloudinary Storage Engine
// We use an async function for params to ensure unique public_ids
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Remove extension from original name to use as base for public_id
    const fileName = file.originalname.split('.')[0];
    
    return {
      folder: 'ecommerce_products',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
      public_id: `${Date.now()}-${fileName}`, 
    };
  },
});

// 3. Initialize Multer with Validation
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'), false);
    }
  }
});

export default upload;