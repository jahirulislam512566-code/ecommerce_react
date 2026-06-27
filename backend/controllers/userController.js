import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import validator from "validator";

/* =========================
   JWT Token Helper
========================= */
const createToken = (id, role = "user") => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "3d",
    });
};

/* =========================
   LOGIN USER
========================= */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: cleanEmail }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.comparePassword) {
            return res.status(500).json({
                success: false,
                message: "Password comparison method missing in User model",
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = createToken(user._id);

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/* =========================
   REGISTER USER
========================= */
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        if (!validator.isEmail(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        const exists = await User.findOne({ email: cleanEmail });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }

        const newUser = new User({
            name,
            email: cleanEmail,
            password,
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        return res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/* =========================
   ADMIN LOGIN
========================= */
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required",
            });
        }

        if (
            email.trim().toLowerCase() === adminEmail?.trim().toLowerCase() &&
            password === adminPassword
        ) {
            const token = createToken("admin", "admin");

            return res.status(200).json({
                success: true,
                token,
                role: "admin",
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid admin credentials",
        });

    } catch (error) {
        console.error("Admin Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/* =========================
   GET USER PROFILE (FIXED)
========================= */
export const getUserProfile = async (req, res) => {
    try {
        // FIX: req.body.userId ❌ → req.user.id ✅
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No user found in request",
            });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/* =========================
   NEWSLETTER (OPTIONAL)
========================= */
export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Valid email required",
            });
        }

        console.log("Newsletter:", email);

        return res.status(200).json({
            success: true,
            message: "Subscribed successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};