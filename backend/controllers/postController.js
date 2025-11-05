import Post from "../models/Post.js";

// ==============================
// ✏️ CREATE A NEW POST
// ==============================
export const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    // Validate fields
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    // Validate user (authMiddleware should attach req.user)
    const authorId = req.user?.id || req.user?._id;
    if (!authorId) {
      return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    // Create the post
    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      category: category?.trim() || "General",
      author: authorId,
    });

    return res.status(201).json({
      message: "Post created successfully!",
      post,
    });
  } catch (error) {
    console.error("❌ Create post error:", error.message);
    return res.status(500).json({ message: "Server error while creating post." });
  }
};

// ==============================
// 📋 GET ALL POSTS
// ==============================
export const listPosts = async (_req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author", "username")
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error("❌ List posts error:", error.message);
    return res.status(500).json({ message: "Server error while fetching posts." });
  }
};
