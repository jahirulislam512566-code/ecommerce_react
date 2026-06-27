import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/* =========================================
   AUTH: PROTECT (FIXED & SIMPLIFIED)
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

    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id; // ✅ ONLY ONE SOURCE OF TRUTH

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // Admin shortcut (NO DB CALL)
    if (decoded.role === "admin") {
      req.user = {
        _id: "admin",
        email: decoded.email,
        role: "admin",
        isAdmin: true,
      };

      req.userId = "admin";
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

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token expired"
          : "Invalid token",
    });
  }
};

/* =========================================
   ADMIN ONLY (FIXED SAFE CHECK)
========================================= */
export const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role === "admin" || req.user.isAdmin) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Admin access required",
  });
};

/* =========================================
   OPTIONAL AUTH (SAFE)
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

    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    req.user = user || null;
    req.userId = user ? user._id.toString() : null;

    if (req.user) {
      req.user.isAdmin = req.user.role === "admin";
    }

    next();
  } catch (err) {
    req.user = null;
    req.userId = null;
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
   OWNERSHIP CHECK (SAFE)
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

      // safe check
      if (req.user?.isAdmin) {
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