// backend/routes/seedRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { connectDB } from "../config/db.js";

const router = express.Router();

router.post("/demo", async (req, res) => {
  try {
    // 🧩 Security: allow seeding only with key in production
    if (process.env.NODE_ENV === "production") {
      const key = req.query.key;
      if (key !== process.env.SEED_KEY) {
        return res.status(403).json({ message: "❌ Unauthorized seeding attempt." });
      }
    }

    // 💡 In development, skip the key check
    await connectDB();

    console.log("⚠️ Clearing old data...");
    await User.deleteMany({});
    await Post.deleteMany({});

    console.log("🌱 Seeding demo users...");
    const hashedPass = await bcrypt.hash("password123", 10);

    const users = await User.insertMany([
      {
        username: "coleman",
        email: "coleman@example.com",
        password: hashedPass,
      },
      {
        username: "alex",
        email: "alex@example.com",
        password: hashedPass,
      },
      {
        username: "jordan",
        email: "jordan@example.com",
        password: hashedPass,
      },
    ]);

    console.log("🧱 Seeding demo posts...");
    const posts = await Post.insertMany([
      {
        title: "Welcome to Project 4 Forum!",
        content:
          "This is a demo post. Try logging in as any user below to explore!",
        category: "General",
        author: users[0]._id,
      },
      {
        title: "Learning Node.js",
        content:
          "Node.js lets you use JavaScript everywhere — frontend and backend!",
        category: "Education",
        author: users[1]._id,
      },
      {
        title: "Favorite Tech Stack?",
        content:
          "I love MERN! What’s your favorite? Try posting your thoughts!",
        category: "Tech",
        author: users[2]._id,
      },
    ]);

    console.log(`✅ Seeded ${users.length} users and ${posts.length} posts!`);

    res.json({
      message: "✅ Demo data loaded successfully!",
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
