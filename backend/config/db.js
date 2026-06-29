import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// This global object persists across hot-reloads in development 
// and remains in memory during function 'warm' periods
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'nexusbd',
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("DB Connected successfully to NexusBD");
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;