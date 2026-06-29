// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/* =========================================
   AUTH: PROTECT
========================================= */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.token) {
      token = req.headers.token;
    }

    console.log('🔐 Protect middleware - Token:', token ? 'Present' : 'Missing');

    if (!token || token === "undefined" || token === "null" || token === "") {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded:', { id: decoded.id, role: decoded.role, email: decoded.email });
    } catch (jwtError) {
      console.error('❌ JWT Error:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: jwtError.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
      });
    }

    // ✅ Get userId from token
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // ✅ Admin shortcut
    if (decoded.role === "admin" || decoded.isAdmin === true) {
      console.log('✅ Admin detected from token');
      req.user = {
        _id: userId,
        id: userId,
        email: decoded.email || 'admin@example.com',
        role: "admin",
        isAdmin: true,
        name: decoded.name || 'Admin'
      };
      req.userId = userId;
      req.isAdmin = true;
      return next();
    }

    // Normal user from DB
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    req.userId = user._id.toString();
    req.user.isAdmin = user.role === "admin";
    req.isAdmin = user.role === "admin";

    console.log('✅ User authenticated:', user.email, 'Role:', user.role);
    next();
  } catch (error) {
    console.error("❌ Auth Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/* =========================================
   ADMIN ONLY - FIXED
========================================= */
export const admin = (req, res, next) => {
  console.log('🔐 Admin middleware check:');
  console.log('  User:', req.user);
  console.log('  User role:', req.user?.role);
  console.log('  User isAdmin:', req.user?.isAdmin);
  console.log('  req.isAdmin:', req.isAdmin);

  // ✅ Check if user exists
  if (!req.user) {
    console.log('❌ No user found');
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // ✅ Check multiple ways to verify admin
  const isAdmin = 
    req.user.role === 'admin' || 
    req.user.role === 'Admin' ||
    req.user.isAdmin === true || 
    req.user.isAdmin === 'admin' ||
    req.isAdmin === true;

  console.log('  Is admin?', isAdmin);

  if (isAdmin) {
    console.log('✅ Admin access granted');
    return next();
  }

  console.log('❌ Admin access denied');
  return res.status(403).json({
    success: false,
    message: "Admin access required",
  });
};

/* =========================================
   OPTIONAL AUTH
========================================= */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.token) {
      token = req.headers.token;
    }

    if (!token || token === "undefined" || token === "null") {
      req.user = null;
      req.userId = null;
      req.isAdmin = false;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      req.user = null;
      req.userId = null;
      req.isAdmin = false;
      return next();
    }

    // Admin shortcut
    if (decoded.role === "admin" || decoded.isAdmin === true) {
      req.user = {
        _id: userId,
        email: decoded.email || 'admin@example.com',
        role: "admin",
        isAdmin: true,
        name: decoded.name || 'Admin'
      };
      req.userId = userId;
      req.isAdmin = true;
      return next();
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      req.user = null;
      req.userId = null;
      req.isAdmin = false;
      return next();
    }

    req.user = user;
    req.userId = user._id.toString();
    req.isAdmin = user.role === "admin";
    req.user.isAdmin = user.role === "admin";

    next();
  } catch (err) {
    console.error("Optional Auth Error:", err.message);
    req.user = null;
    req.userId = null;
    req.isAdmin = false;
    next();
  }
};

/* =========================================
   REQUIRE AUTH
========================================= */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  next();
};

/* =========================================
   OWNERSHIP CHECK
========================================= */
export const checkOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      const resourceUserId = await getResourceUserId(req);

      if (!resourceUserId) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      // Admin can access anything
      if (req.user?.isAdmin || req.isAdmin) {
        return next();
      }

      if (!req.userId || req.userId !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      next();
    } catch (error) {
      console.error("Ownership Error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
};

// ✅ DEFAULT EXPORT for all functions
export default {
  protect,
  admin,
  optionalAuth,
  requireAuth,
  checkOwnership
};