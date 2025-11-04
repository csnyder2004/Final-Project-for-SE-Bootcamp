// backend/controllers/postController.js
import Post from "../models/Post.js";

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    // If you set req.user in your auth middleware, use req.user.id (or req.user._id)
    const authorId = req.user?.id || req.user?._id;
    if (!authorId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const post = await Post.create({
      title,
      content,
      category: category?.trim() || "General",
      author: authorId,
    });

    return res.status(201).json({ message: "Post created.", post });
  } catch (err) {
    console.error("Create post error:", err);
    return res.status(500).json({ message: "Server error creating post." });
  }
};

// List posts (we’ll enhance in Step 3 to support category filter)
export const listPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author", "username")
      .sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    console.error("List posts error:", err);
    return res.status(500).json({ message: "Server error fetching posts." });
  }
};
