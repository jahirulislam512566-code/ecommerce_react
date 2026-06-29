// backend/controllers/productController.js
import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ============================================================
// 🔥 Helper: Safe Response
// ============================================================
const sendResponse = (res, status, success, message, data = null) => {
    return res.status(status).json({
        success,
        message,
        ...(data && data),
    });
};

// ============================================================
// ✅ Get All Products (Public)
// ============================================================
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({})
            .sort({ _id: -1 }) // safer than createdAt
            .lean();

        return sendResponse(res, 200, true, "Products fetched successfully", {
            products,
            count: products.length,
        });
    } catch (error) {
        console.error("❌ getProducts error:", error);
        return sendResponse(res, 500, false, error.message);
    }
};

// ============================================================
// ✅ Get Single Product
// ============================================================
export const singleProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return sendResponse(res, 400, false, "Product ID is required");
        }

        const product = await Product.findById(id).lean();

        if (!product) {
            return sendResponse(res, 404, false, "Product not found");
        }

        return sendResponse(res, 200, true, "Product fetched successfully", {
            product,
        });
    } catch (error) {
        console.error("❌ singleProduct error:", error);
        return sendResponse(res, 500, false, error.message);
    }
};

// ============================================================
// ✅ Add Product (Admin)
// ============================================================
export const addProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            subCategory,
            sizes,
            stock,
            bestseller,
        } = req.body;

        // -------------------------
        // Validation
        // -------------------------
        if (!name || !description || !price || !category) {
            return sendResponse(res, 400, false, "Missing required fields");
        }

        // -------------------------
        // Sizes parsing
        // -------------------------
        let sizesArray = ["S", "M", "L", "XL"];

        if (sizes) {
            try {
                sizesArray =
                    typeof sizes === "string" ? JSON.parse(sizes) : sizes;
            } catch {
                sizesArray = ["S", "M", "L", "XL"];
            }
        }

        // -------------------------
        // Image Upload
        // -------------------------
        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map(async (file) => {
                    try {
                        const result = await cloudinary.uploader.upload(
                            file.path,
                            {
                                folder: "ecommerce_products",
                                use_filename: true,
                                unique_filename: true,
                            }
                        );

                        fs.unlinkSync(file.path); // cleanup
                        return result.secure_url;
                    } catch (err) {
                        console.error("❌ Upload error:", err.message);
                        return null;
                    }
                })
            );

            imageUrls = uploads.filter(Boolean);
        }

        if (imageUrls.length === 0) {
            imageUrls = ["https://via.placeholder.com/500"];
        }

        // -------------------------
        // Create Product
        // -------------------------
        const product = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category,
            subCategory: subCategory || "",
            sizes: sizesArray,
            stock: Number(stock || 0),
            bestseller: bestseller === true || bestseller === "true",
            image: imageUrls,
        });

        return sendResponse(
            res,
            201,
            true,
            "Product created successfully",
            {
                product,
            }
        );
    } catch (error) {
        console.error("❌ addProduct error:", error);

        return sendResponse(res, 500, false, error.message);
    }
};

// ============================================================
// ✅ Update Product
// ============================================================
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return sendResponse(res, 400, false, "Product ID required");
        }

        const updates = { ...req.body };

        if (updates.sizes && typeof updates.sizes === "string") {
            try {
                updates.sizes = JSON.parse(updates.sizes);
            } catch {
                updates.sizes = updates.sizes.split(",");
            }
        }

        // New images
        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map(async (file) => {
                    try {
                        const result = await cloudinary.uploader.upload(
                            file.path,
                            {
                                folder: "ecommerce_products",
                            }
                        );

                        fs.unlinkSync(file.path);
                        return result.secure_url;
                    } catch (err) {
                        return null;
                    }
                })
            );

            updates.image = uploads.filter(Boolean);
        }

        const product = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return sendResponse(res, 404, false, "Product not found");
        }

        return sendResponse(res, 200, true, "Product updated", {
            product,
        });
    } catch (error) {
        console.error("❌ updateProduct error:", error);
        return sendResponse(res, 500, false, error.message);
    }
};

// ============================================================
// ✅ Delete Product
// ============================================================
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return sendResponse(res, 404, false, "Product not found");
        }

        // Cloudinary delete (safe)
        if (product.image?.length) {
            await Promise.all(
                product.image.map(async (url) => {
                    try {
                        const parts = url.split("/");
                        const file = parts.pop();
                        const publicId =
                            "ecommerce_products/" + file.split(".")[0];

                        await cloudinary.uploader.destroy(publicId);
                    } catch (err) {
                        console.warn("Cloudinary delete failed:", err.message);
                    }
                })
            );
        }

        await Product.findByIdAndDelete(id);

        return sendResponse(res, 200, true, "Product deleted");
    } catch (error) {
        console.error("❌ deleteProduct error:", error);
        return sendResponse(res, 500, false, error.message);
    }
};

// ============================================================
// ✅ Featured Products
// ============================================================
export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ bestseller: true })
            .limit(10)
            .sort({ _id: -1 })
            .lean();

        return sendResponse(res, 200, true, "Featured products", {
            products,
        });
    } catch (error) {
        return sendResponse(res, 500, false, error.message);
    }
};

export const addProductReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        product.reviews = product.reviews || [];

        product.reviews.push({
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment: comment || "",
            createdAt: new Date(),
        });

        await product.save();

        return res.json({
            success: true,
            message: "Review added",
        });
    } catch (error) {
        console.error("Add Review Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const products = await Product.find({ category }).sort({ _id: -1 });

        return res.json({
            success: true,
            products,
        });
    } catch (error) {
        console.error("Category Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

