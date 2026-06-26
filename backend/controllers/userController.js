import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";

/**
 * @helper Create JWT Token
 */
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

/**
 * @route   POST /api/user/login
 * @desc    Login for regular customers
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const cleanEmail = email.toLowerCase().trim();

        // Find user and explicitly include password
        const user = await User.findOne({ email: cleanEmail }).select("+password");

        if (!user) {
            return res.status(401).json({ success: false, message: "User doesn't exist" });
        }

        // Use the schema built-in method we created!
        const isMatch = await user.comparePassword(password);

        if (isMatch) {
            const token = createToken(user._id);
            return res.status(200).json({ 
                success: true, 
                token,
                user: { id: user._id, name: user.name, email: user.email } 
            });
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @route   POST /api/user/register
 * @desc    Register a new customer
 */
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const cleanEmail = email.toLowerCase().trim();

        if (!validator.isEmail(cleanEmail)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Pass the plain text password directly! The schema will handle the hashing.
        const newUser = new User({
            name,
            email: cleanEmail,
            password 
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        return res.status(201).json({ success: true, token });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @route   POST /api/user/admin
 * @desc    Admin login using environment credentials
 */
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // 💡 FIXED: Safely verify that environment variable declarations exist before execution
        const adminEmailEnv = process.env.ADMIN_EMAIL || "";
        const adminPasswordEnv = process.env.ADMIN_PASSWORD || "";

        // Strict matching with environment variables
        if (
            email.trim().toLowerCase() === adminEmailEnv.trim().toLowerCase() && 
            password === adminPasswordEnv
        ) {
            // 💡 FIXED: Signed with a proper JSON payload object, not a primitive string value
            const token = jwt.sign(
                { email: email.trim().toLowerCase(), role: "admin" }, 
                process.env.JWT_SECRET,
                { expiresIn: '1d' } // Explicit expiry setup
            );
            return res.status(200).json({ success: true, token });
        } else {
            return res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
        }
    } catch (error) {
        console.error("Admin Login Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @route   GET /api/user/profile
 * @desc    Get current user's profile data
 * @access  Private (Requires middleware)
 */
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId; 
        const user = await User.findById(userId).select("-password");

        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @route   POST /api/user/newsletter
 * @desc    Handle newsletter subscriptions
 */
export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please provide a valid email" });
        }

        console.log(`Newsletter signup: ${email}`);
        res.status(200).json({ success: true, message: "Successfully subscribed!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};