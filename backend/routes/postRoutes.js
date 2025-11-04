// backend/routes/postRoutes.js
import express from "express";
import { createPost, listPosts } from "../controllers/postController.js";
import Post from "../models/Post.js"; // for categories route
import { authMiddleware } from "../middleware/auth.js"; // adjust if your auth file is named differently

const router = express.Router();

/**
 * GET /api/posts
 * Optional query: ?category=General
 */
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== "All") {
      filter.category = category;
    }

    const posts = await Post.find(filter)
      .populate("author", "username")
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (err) {
    console.error("List posts error:", err);
    return res.status(500).json({ message: "Server error fetching posts." });
  }
});

/**
 * POST /api/posts
 * Body: { title, content, category }
 * Requires auth
 */
router.post("/", authMiddleware, createPost);

/**
 * GET /api/posts/categories
 * Returns distinct category strings, plus "All" at the top
 */
router.get("/categories", async (_req, res) => {
  try {
    const distinct = await Post.distinct("category");
    // Always include "All" as a convenient option for the UI
    const categories = ["All", ...distinct.sort()];
    return res.json(categories);
  } catch (err) {
    console.error("Categories error:", err);
    return res.status(500).json({ message: "Server error fetching categories." });
  }
});

export default router;
