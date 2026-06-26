import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @desc    Configures and initializes Cloudinary connection
 */
const connectCloudinary = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    console.log("✅ Cloudinary Configured Successfully");
  } catch (error) {
    console.error(" Cloudinary Configuration Error:", error.message);
  }
};

export { connectCloudinary, cloudinary };