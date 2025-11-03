import express from "express";
import { createPost, getAllPosts } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route: view all posts
router.get("/", getAllPosts);

// Protected route: create a post
router.post("/", protect, createPost);

export default router;
