import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Post from "../models/Post.js";

const router = express.Router();

/**
 * POST /api/seed/demo
 * Creates demo users and posts if not already present.
 * Safe for repeated use. Public, no password needed.
 */
router.post("/demo", async (_req, res) => {
  try {
    const existingUsers = await User.find({ email: /@example\.com$/ });
    const existingPosts = await Post.find({});

    if (existingUsers.length > 0 && existingPosts.length > 0) {
      return res.json({
        message: "Demo data already loaded!",
        demoAccounts: [
          { email: "coleman@example.com", password: "password123" },
          { email: "alex@example.com", password: "password123" },
          { email: "jordan@example.com", password: "password123" },
        ],
      });
    }

    console.log("🌱 Seeding demo data...");
    const hashedPass = await bcrypt.hash("password123", 10);

    const users = await User.insertMany([
      { username: "coleman", email: "coleman@example.com", password: hashedPass },
      { username: "alex", email: "alex@example.com", password: hashedPass },
      { username: "jordan", email: "jordan@example.com", password: hashedPass },
    ]);

    await Post.insertMany([
      {
        title: "Welcome to Project 4 Forum!",
        content: "This is demo data! Explore posts and try logging in as demo users.",
        category: "General",
        author: users[0]._id,
      },
      {
        title: "Learning Node.js",
        content: "Node.js lets you use JavaScript everywhere — frontend and backend!",
        category: "Education",
        author: users[1]._id,
      },
      {
        title: "Favorite Tech Stack?",
        content: "I love MERN! What’s your favorite?",
        category: "Tech",
        author: users[2]._id,
      },
    ]);

    console.log("✅ Demo data seeded successfully!");

    res.json({
      message: "✅ Demo data added successfully!",
      demoAccounts: [
        { email: "coleman@example.com", password: "password123" },
        { email: "alex@example.com", password: "password123" },
        { email: "jordan@example.com", password: "password123" },
      ],
    });
  } catch (err) {
    console.error("❌ Demo seeding failed:", err);
    res.status(500).json({ message: "Server error seeding demo data." });
  }
});

export default router;
