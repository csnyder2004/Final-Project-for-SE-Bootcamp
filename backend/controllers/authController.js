import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * 🧩 REGISTER USER
 * Validates input, hashes password, and creates new user.
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // --- 1️⃣ Basic Validation ---
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // --- 2️⃣ Check for duplicates ---
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // --- 3️⃣ Hash password safely ---
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      console.error("⚠️ bcrypt.hash() returned undefined");
      return res.status(500).json({ message: "Password hashing failed." });
    }

    // --- 4️⃣ Create user in MongoDB ---
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await newUser.save();

    console.log(`✅ Registered new user: ${newUser.username} (${newUser.email})`);

    return res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
};

/**
 * 🔐 LOGIN USER
 * Verifies credentials, compares bcrypt hash, and returns JWT token.
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- 1️⃣ Validate input ---
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    // --- 2️⃣ Find existing user ---
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // --- 3️⃣ Guard against missing password field ---
    if (!user.password) {
      console.error("⚠️ User record missing password field:", user);
      return res
        .status(500)
        .json({ message: "Server configuration error. Please re-register." });
    }

    // --- 4️⃣ Compare password hashes ---
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // --- 5️⃣ Create JWT ---
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(`✅ ${user.username} logged in successfully`);

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

/**
 * 🧾 VERIFY TOKEN / GET USER INFO
 * Used by /api/auth/me
 */
export const verifyUser = async (req, res) => {
  try {
    // req.user is attached in authMiddleware.js
    res.status(200).json({
      message: "🔒 Token verified successfully!",
      user: req.user,
    });
  } catch (err) {
    console.error("❌ Verify token error:", err);
    res.status(500).json({ message: "Failed to verify token." });
  }
};
