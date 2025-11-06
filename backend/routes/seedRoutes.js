// backend/routes/seedRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Post from "../models/Post.js";

const router = express.Router();

/**
 * POST /api/seed/demo
 * Seeds Vols Football–themed demo users and posts.
 * Can be safely re-run — automatically clears old demo data first.
 */
router.post("/demo", async (_req, res) => {
  try {
    console.log("🌱 Seeding Tennessee Vols Football demo data...");

    // 🧹 Clean up any previous Vols demo data to prevent duplicates
    await User.deleteMany({
      $or: [
        { email: /@volsforum\.com$/ },
        { username: { $in: ["SmokeyTheDog", "NeylandLegend", "RockyTopFan"] } },
      ],
    });

    await Post.deleteMany({
      category: {
        $in: [
          "Game Day Talk",
          "Players & Recruiting",
          "Stats & Analysis",
          "Vols History",
          "SEC Rivalries",
          "Fan Zone",
        ],
      },
    });

    // 🔐 Hash password for all demo users
    const hashedPass = await bcrypt.hash("govols123", 10);

    // 👤 Demo users
    const users = await User.insertMany([
      {
        username: "SmokeyTheDog",
        email: "smokey@volsforum.com",
        password: hashedPass,
      },
      {
        username: "NeylandLegend",
        email: "neyland@volsforum.com",
        password: hashedPass,
      },
      {
        username: "RockyTopFan",
        email: "rocky@volsforum.com",
        password: hashedPass,
      },
    ]);

    // 🏈 Demo posts for each Vols category
    await Post.insertMany([
      {
        title: "🔥 Game Day Thread: Vols vs Alabama!",
        content:
          "Who’s ready for the Third Saturday in October? Let’s hear those score predictions and tailgate setups!",
        category: "Game Day Talk",
        author: users[0]._id,
      },
      {
        title: "Recruiting Update: 5⭐ QB visiting Knoxville",
        content:
          "Rumor is that a top high school QB will be on campus this weekend. Could be a big get for 2025!",
        category: "Players & Recruiting",
        author: users[1]._id,
      },
      {
        title: "Breaking Down Joe Milton’s 2024 Stats",
        content:
          "Let’s talk about completion percentage, yards per attempt, and how the offense looked under pressure.",
        category: "Stats & Analysis",
        author: users[2]._id,
      },
      {
        title: "Flashback: 1998 National Championship Season",
        content:
          "Take a trip down memory lane — what’s your favorite play from the ‘98 run?",
        category: "Vols History",
        author: users[0]._id,
      },
      {
        title: "SEC Rivalries: Which team do you love to hate?",
        content:
          "Florida, Alabama, Georgia — who’s the biggest rival in your eyes and why?",
        category: "SEC Rivalries",
        author: users[1]._id,
      },
      {
        title: "Vol Fan Zone: Share Your Tailgate Photos!",
        content:
          "Let’s see those orange tents, checkerboard dips, and Smokey plushies! #VolNation",
        category: "Fan Zone",
        author: users[2]._id,
      },
    ]);

    console.log("✅ Vols Football demo data seeded successfully!");

    res.json({
      message: "✅ Vols demo data added successfully!",
      demoAccounts: [
        { email: "smokey@volsforum.com", password: "govols123" },
        { email: "neyland@volsforum.com", password: "govols123" },
        { email: "rocky@volsforum.com", password: "govols123" },
      ],
    });
  } catch (err) {
    console.error("❌ Demo seeding failed:", err);
    res.status(500).json({ message: "Server error while seeding demo data." });
  }
});

export default router;
