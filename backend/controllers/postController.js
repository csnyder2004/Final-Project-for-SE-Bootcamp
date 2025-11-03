import Post from "../models/Post.js";

// Create a new post (requires login)
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id; // from JWT middleware

    const post = await Post.create({ title, content, author: userId });
    res.status(201).json({ message: "Post created successfully", post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating post" });
  }
};

// Get all posts
export const getAllPosts = async (_req, res) => {
  try {
    const posts = await Post.find().populate("author", "username").sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching posts" });
  }
};
