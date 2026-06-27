import express from "express";
import {
  addToCart,
  updateCart,
  getCart,
  removeFromCart,
  clearCart,
  syncCart,
} from "../controllers/cartController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================
   ALL CART ROUTES (AUTH REQUIRED)
========================================= */
router.use(protect);

/* =========================================
   CART ROUTES
========================================= */

// Get cart
router.get("/", getCart);

// Add item to cart
router.post("/add", addToCart);

// Update cart item quantity/size/etc
router.put("/update", updateCart);

// Remove single item
router.delete("/remove/:productId/:size", removeFromCart);

// Clear full cart
router.delete("/clear", clearCart);

// Sync cart (frontend ↔ backend)
router.post("/sync", syncCart);

/* =========================================
   ADMIN ROUTES (OPTIONAL)
========================================= */
// router.delete("/admin/clear-all", protect, admin, clearAllCarts);

export default router;