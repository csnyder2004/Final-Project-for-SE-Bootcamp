import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// ===== TEST ROUTE =====
app.get("/", (_req, res) => {
  res.send("✅ API running with MongoDB and Render deployment working!");
});

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// ===== SERVER STARTUP =====
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB(); // connect to MongoDB Atlas
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running and listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();
