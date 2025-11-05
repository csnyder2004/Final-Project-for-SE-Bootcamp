// backend/routes/authRoutes.js
import express from "express";
import { registerUser, loginUser, verifyUser } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Verify and return user details (Protected)
 * @access  Private
 */
router.get("/me", authMiddleware, verifyUser);

export default router;
