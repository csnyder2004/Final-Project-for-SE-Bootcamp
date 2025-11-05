import express from "express";
import { createPost, listPosts } from "../controllers/postController.js";
import Post from "../models/Post.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // ✅ Must match your middleware export name

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Fetch all posts or filter by category (?category=Tech)
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category && category !== "All") filter.category = category;

    const posts = await Post.find(filter)
      .populate("author", "username")
      .sort({ createdAt: -1 });

    if (!posts.length)
      return res.status(200).json([{ message: "No posts found yet!" }]);

    res.status(200).json(posts);
  } catch (err) {
    console.error("❌ List posts error:", err);
    res.status(500).json({ message: "Server error fetching posts." });
  }
});

/**
 * @route   POST /api/posts
 * @desc    Create a new post (requires login)
 * @access  Private
 */
router.post("/", authMiddleware, createPost);

/**
 * @route   GET /api/posts/categories
 * @desc    Fetch distinct post categories
 * @access  Public
 */
router.get("/categories", async (_req, res) => {
  try {
    const distinct = await Post.distinct("category");
    const categories = ["All", ...distinct.sort()];
    res.status(200).json(categories);
  } catch (err) {
    console.error("❌ Categories error:", err);
    res.status(500).json({ message: "Server error fetching categories." });
  }
});

export default router;
