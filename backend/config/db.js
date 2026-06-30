// backend/config/db.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    console.log("📦 Using cached DB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // ✅ REMOVED bufferCommands: false (good!)
      
      // ✅ INCREASE timeout from 5000ms to 30000ms
      serverSelectionTimeoutMS: 30000,  // Was 5000 - increased to 30s
      socketTimeoutMS: 60000,           // Was 45000 - increased to 60s
      
      // ✅ Add these for better reliability
      connectTimeoutMS: 30000,          // New - connection timeout
      heartbeatFrequencyMS: 10000,      // New - keep connection alive
      retryWrites: true,                // New - retry failed writes
      retryReads: true,                 // New - retry failed reads
      
      dbName: 'nexusbd',
      maxPoolSize: 10,
      minPoolSize: 1,
    };

    console.log("🔄 Connecting to MongoDB Atlas...");
    console.log(`📡 Cluster: ${MONGODB_URI?.split('@')[1]?.split('.')[0] || 'unknown'}`);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ DB Connected successfully to NexusBD");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        cached.promise = null; // Reset promise on error
        throw err;
      });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

// ✅ Add connection status check
export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;