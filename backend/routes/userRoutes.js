import express from "express";
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  adminLogin 
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Auth Routes ---

/**
 * @desc    Register a new customer
 * @route   POST /api/users/register
 */
router.post("/register", registerUser);

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 */
router.post("/login", loginUser);

/**
 * @desc    Authenticate admin & get token
 * @route   POST /api/users/admin
 */
router.post("/admin", adminLogin);


// --- Private Routes ---

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 */
router.get("/profile", protect, getUserProfile);

// Example of an Admin-only route for your e-commerce dashboard
// router.get("/all", protect, admin, getAllUsers);

export default router;