import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT tokens and attach user info to the request.
 * Protects routes from unauthorized access.
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
