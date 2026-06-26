import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * @middleware protect
 * @desc Verify User or Admin Token and attach credentials + IDs to req context
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Look for token in 'Authorization' header OR custom 'token' header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.headers.token) {
    token = req.headers.token;
  }

  // 2. If no token, stop immediately
  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({ 
      success: false, 
      message: "Not authorized, no token provided" 
    });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FIXED: Ensure userId is always set
    req.userId = decoded.id || decoded.userId || null;

    // ✅ FIXED: Handle Admin token check
    if (decoded.role === "admin" || decoded.email === (process.env.ADMIN_EMAIL || "").trim().toLowerCase()) {
      req.user = {
        _id: decoded.id || 'admin',
        email: decoded.email,
        role: "admin",
        isAdmin: true,
        name: "Administrator"
      };
      
      // Ensure userId is set for admin
      req.userId = req.user._id.toString();
      
      return next();
    }

    // 4. Handle normal database-registered customer login flow
    if (!decoded.id && !decoded.userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token: user ID not found" 
      });
    }

    // Find user from database
    const userId = decoded.id || decoded.userId;
    req.user = await User.findById(userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "User no longer exists" 
      });
    }

    // ✅ FIXED: Ensure userId is always a string
    req.userId = req.user._id.toString();

    // ✅ FIXED: Add isAdmin flag for consistent access
    req.user.isAdmin = req.user.role === "admin";

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired, please login again" 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: "Not authorized, token failed" 
    });
  }
};

/**
 * @middleware admin
 * @desc Verify Admin Permissions (Must be used AFTER protect)
 */
export const admin = (req, res, next) => {
  // Check if user is admin
  if (req.user && (req.user.role === "admin" || req.user.isAdmin === true)) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: "Access denied. Administrative privileges required." 
    });
  }
};

/**
 * @middleware optionalAuth
 * @desc Optional authentication - doesn't require token but attaches user if present
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  // 1. Look for token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.headers.token) {
    token = req.headers.token;
  }

  // 2. If no token, continue as guest
  if (!token || token === "undefined" || token === "null") {
    req.user = null;
    req.userId = null;
    return next();
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Find user
    const userId = decoded.id || decoded.userId;
    if (userId) {
      const user = await User.findById(userId).select("-password");
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
        req.user.isAdmin = user.role === "admin";
      }
    }
    
    next();
  } catch (error) {
    // Token invalid, continue as guest
    req.user = null;
    req.userId = null;
    next();
  }
};

/**
 * @middleware requireAuth
 * @desc Alternative to protect - throws 401 if not authenticated
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  next();
};

/**
 * @middleware checkOwnership
 * @desc Check if user owns the resource
 */
export const checkOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      const resourceUserId = await getResourceUserId(req);
      
      if (!resourceUserId) {
        return res.status(404).json({
          success: false,
          message: "Resource not found"
        });
      }

      // Admin can access any resource
      if (req.user.isAdmin) {
        return next();
      }

      // Check if user owns the resource
      if (req.userId !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource"
        });
      }

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      res.status(500).json({
        success: false,
        message: "Error checking resource ownership"
      });
    }
  };
};

// ============================================================
// Updated Cart Controller Example (uses the fixed middleware)
// ============================================================
// In your cartController.js, you can now safely use req.userId:
/*
export const addToCart = async (req, res) => {
  try {
    const userId = req.userId; // ✅ Now this is guaranteed to be a string
    const { productId, size, quantity } = req.body;
    
    // Use userId to find cart
    let cart = await Cart.findOne({ userId });
    // ... rest of your logic
  } catch (error) {
    // ...
  }
};
*/