
import mongoose from "mongoose";
import dotenv from "dotenv"; 

dotenv.config();

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("DB Connected successfully to NexusBD");
        });

        // Pass the dbName explicitly in the options object
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'nexusbd' 
        });
        
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;