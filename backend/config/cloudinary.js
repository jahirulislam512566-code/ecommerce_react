// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

export const connectCloudinary = async () => {
    try {
        // ✅ Log the configuration (without exposing secrets)
        console.log('🔑 Cloudinary Config:');
        console.log('  Cloud Name:', process.env.CLOUDINARY_NAME ? '✅ Set' : '❌ Missing');
        console.log('  API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
        console.log('  API Secret:', process.env.CLOUDINARY_SECRET_KEY ? '✅ Set' : '❌ Missing');

        // ✅ Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY,
        });

        // ✅ Test the connection
        try {
            const result = await cloudinary.api.ping();
            console.log('✅ Cloudinary Connected Successfully');
            return true;
        } catch (pingError) {
            console.error('❌ Cloudinary Ping Failed:', pingError.message);
            console.warn('⚠️ Cloudinary will use local storage fallback');
            return false;
        }
    } catch (error) {
        console.error('❌ Cloudinary Connection Error:', error.message);
        console.warn('⚠️ Cloudinary will use local storage fallback');
        return false;
    }
};

// ✅ Export cloudinary instance
export { cloudinary };