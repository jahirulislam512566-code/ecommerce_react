import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

/**
 * @desc    Create a product with Cloudinary asset uploading
 * @route   POST /api/product/add
 */
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller, stock } = req.body;

        // 1. Safe extraction of binary files from Multer configurations
        const imageFiles = req.files || [];
        const localPaths = Array.isArray(imageFiles) 
            ? imageFiles.map((item) => item.path)
            : Object.values(imageFiles).flat().map((item) => item.path);

        // 2. Upload images asynchronously to Cloudinary and collect real URLs
        const uploadPromises = localPaths.map((path) => 
            cloudinary.uploader.upload(path, { resource_type: "image" })
        );
        const uploadResults = await Promise.all(uploadPromises);
        const imageUrls = uploadResults.map((result) => result.secure_url);

        // 3. Safe parsing for JSON format sizes array strings
        let parsedSizes = [];
        if (sizes) {
            try {
                parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
            } catch (e) {
                return res.status(400).json({ success: false, message: "Invalid JSON format for sizes" });
            }
        }

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" || bestseller === true,
            sizes: parsedSizes,
            image: imageUrls, // Now safely contains production secure Cloudinary links
            stock: Number(stock) || 0,
            date: Date.now()
        };

        const product = new Product(productData);
        await product.save();

        res.status(201).json({ success: true, message: "Product Added Successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all products catalog listings
 * @route   GET /api/product/list
 */
export const getProducts = async (req, res) => {
    try {
        // Updated to explicitly match your frontend success evaluation block requirements
        const products = await Product.find({}).sort({ date: -1 });
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get single product details
 * @route   GET /api/product/:id
 */
export const singleProduct = async (req, res) => {
    try {
        const { id } = req.params; 

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID layout" });
        }

        const product = await Product.findById(id);

        if (product) {
            res.json({ success: true, product });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Remove product & clean up assets from Cloudinary
 * @route   POST /api/product/remove
 */
export const deleteProduct = async (req, res) => {
    try {
        // 💡 MATCHES FRONTEND: Pulled straight from request body to support your axios.post calls
        const { id } = req.body; 

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID layout" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Clean up asset image elements inside Cloudinary media manager bucket folders
        if (product.image && product.image.length > 0) {
            const deletePromises = product.image.map((imgUrl) => {
                const publicId = imgUrl.split("/").pop().split(".")[0];
                return cloudinary.uploader.destroy(publicId);
            });
            await Promise.all(deletePromises);
        }

        await Product.findByIdAndDelete(id);
        res.json({ success: true, message: "Product Removed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Add product review
 * @route   POST /api/product/review
 */
export const addProductReview = async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID layout" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: "Product already reviewed" });
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ success: true, message: "Review added" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};