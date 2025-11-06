import jwt from "jsonwebtoken";

/**
 * 🔐 Auth Middleware
 * Verifies JWT, attaches user info, and blocks unauthorized access.
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // --- 1️⃣ Ensure token exists ---
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    // --- 2️⃣ Extract token ---
    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({
        message: "Access denied. Missing token value.",
      });

    // --- 3️⃣ Verify token ---
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ JWT verification error:", error.message);

    // Handle specific JWT errors for clarity
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // Default error
    return res.status(401).json({
      message: "Unauthorized request. Please sign in again.",
    });
  }
};
