// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import seedRoutes from "./routes/seedRoutes.js"; // 👈 added back

// ===== Load environment variables =====
dotenv.config();

// ===== Initialize Express =====
const app = express();
app.set("trust proxy", 1);

// ===== Configure CORS =====
const allowlist = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:4000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://csnyder2004.github.io",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = allowlist.filter(Boolean).some((o) => origin.startsWith(o));
    if (allowed) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// ===== Body parser =====
app.use(express.json());

/* ==========================================================
   💓 Heartbeat Logger (detects Uptime Robot pings)
   ========================================================== */
app.use((req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  if (ua.includes("UptimeRobot")) {
    console.log(`💓 Uptime Robot ping at ${new Date().toLocaleString()}`);
  }
  next();
});

/* ==========================================================
   🩺 Dedicated /ping endpoint (for uptime monitoring)
   ========================================================== */
app.get("/ping", (_req, res) => {
  console.log(`💓 Ping endpoint hit at ${new Date().toLocaleString()}`);
  res.status(200).json({ message: "Server awake 💪", time: new Date().toISOString() });
});

// ===== Root / Health routes =====
app.get("/", (_req, res) => {
  res.send("✅ Project 4 Forum API is running and connected to MongoDB!");
});

app.get("/api", (_req, res) => {
  res.json({
    status: "ok",
    message: "API online and database connection established.",
    time: new Date().toISOString(),
  });
});

// ===== Application Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/seed", seedRoutes); // 👈 new route for manual demo data

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
  });
});

// ===== Global Error Handler =====
app.use((err, _req, res, _next) => {
  console.error("💥 Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
});

// ===== Start Server (after DB connection) =====
const PORT = process.env.PORT || 4000;
let server;

(async () => {
  try {
    await connectDB();
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err?.message || err);
    process.exit(1);
  }
})();

// ===== Graceful Shutdown =====
const shutdown = (signal) => {
  console.log(`\n🔻 Received ${signal}. Closing server...`);
  if (server) {
    server.close(() => {
      console.log("🛑 HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
