
import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  adminLogin,
} from "../controllers/userController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================
   API Status
   GET /api/user
========================================== */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User API is running",
    endpoints: {
      register: "POST /api/user/register",
      login: "POST /api/user/login",
      adminLogin: "POST /api/user/admin",
      profile: "GET /api/user/profile",
    },
  });
});

/* ==========================================
   Public Routes
========================================== */

/**
 * @route   POST /api/user/register
 * @desc    Register a new customer
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/user/login
 * @desc    Login customer
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   POST /api/user/admin
 * @desc    Admin Login
 * @access  Public
 */
router.post("/admin", adminLogin);

/* ==========================================
   Protected Routes
========================================== */

/**
 * @route   GET /api/user/profile
 * @desc    Get logged-in user profile
 * @access  Private
 */
router.get("/profile", protect, getUserProfile);

/**
 * Example Admin Route
 *
 * Uncomment when getAllUsers controller is ready.
 */

// import { getAllUsers } from "../controllers/userController.js";
// router.get("/all", protect, admin, getAllUsers);

export default router;

