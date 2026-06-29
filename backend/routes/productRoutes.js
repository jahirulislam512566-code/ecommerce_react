// backend/routes/productRoutes.js
import express from "express";

import {
    addProduct,
    getProducts,
    singleProduct,
    updateProduct,
    deleteProduct,
    addProductReview,
    getProductsByCategory,
    getFeaturedProducts,
} from "../controllers/productController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import upload, {
    handleMulterError,
    uploadMultiple,
} from "../middleware/multer.js";

const router = express.Router();

// ============================================================
// PUBLIC ROUTES
// ============================================================

// ⚠️ IMPORTANT: specific routes FIRST
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);

// Main list
router.get("/", getProducts);

// ⚠️ MUST be last among GET routes
router.get("/:id", singleProduct);

// ============================================================
// ADMIN ROUTES
// ============================================================

// Create product
router.post(
    "/add",
    protect,
    admin,
    uploadMultiple,
    handleMulterError,
    addProduct
);

// Update product
router.put(
    "/:id",
    protect,
    admin,
    upload.array("images", 5),
    handleMulterError,
    updateProduct
);

// Delete product
router.delete("/:id", protect, admin, deleteProduct);

// ============================================================
// REVIEW ROUTE
// ============================================================
router.post("/review", protect, addProductReview);

export default router;