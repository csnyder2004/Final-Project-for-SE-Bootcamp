import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * 🧱 REGISTER USER
 * Validates input, checks duplicates, hashes password, creates user.
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // --- 1️⃣ Validate input ---
    if (!username || !email || !password)
      return res.status(400).json({ message: "Please fill out all fields." });

    if (username.trim().length < 3)
      return res.status(400).json({
        message: "Username must be at least 3 characters long.",
      });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Please enter a valid email address." });

    if (password.length < 6)
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });

    // --- 2️⃣ Check duplicates (both email and username) ---
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.trim() },
      ],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase().trim()) {
        return res.status(400).json({
          message: "That email address is already registered.",
        });
      }
      if (existingUser.username === username.trim()) {
        return res.status(400).json({
          message: "That username is already taken.",
        });
      }
    }

    // --- 3️⃣ Hash password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- 4️⃣ Create user ---
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    console.log(`✅ Registered new user: ${newUser.username}`);

    return res.status(201).json({
      message: "🎉 Registration successful! You can now log in.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return res.status(500).json({
      message: "Server error during registration. Please try again later.",
    });
  }
};

/**
 * 🔐 LOGIN USER
 * Verifies credentials and returns JWT token.
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- 1️⃣ Validate input ---
    if (!email || !password)
      return res.status(400).json({
        message: "Please enter both email and password.",
      });

    // --- 2️⃣ Find user by email ---
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user)
      return res.status(400).json({
        message: "Invalid email or password.",
      });

    // --- 3️⃣ Check password match ---
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        message: "Invalid email or password.",
      });

    // --- 4️⃣ Generate JWT ---
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(`🔑 ${user.username} logged in successfully.`);

    return res.status(200).json({
      message: "✅ Login successful!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({
      message: "Server error during login. Please try again later.",
    });
  }
};

/**
 * 🧩 VERIFY LOGGED-IN USER (Protected Route)
 */
export const verifyUser = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized: No user found in token." });

    res.status(200).json({
      message: "🔒 Token verified successfully.",
      user: req.user,
    });
  } catch (err) {
    console.error("❌ Verify token error:", err);
    return res.status(500).json({ message: "Failed to verify token." });
  }
};
