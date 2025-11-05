// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";

// Load env
dotenv.config();

// App
const app = express();
app.set("trust proxy", 1);

// ----- CORS (Render + GitHub Pages + Local Dev) -----
const allowlist = [
  process.env.FRONTEND_URL,                      // e.g. https://csnyder2004.github.io/Final-Project-for-SE-Bootcamp
  "http://localhost:3000",
  "http://localhost:4000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://csnyder2004.github.io",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow same-origin or server-to-server (no origin)
    if (!origin) return callback(null, true);
    const ok = allowlist.filter(Boolean).some((o) => origin.startsWith(o));
    return callback(null, ok ? true : true); // <- keep open during dev; tighten later if needed
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());

// ----- Health/Root Routes -----
app.get("/", (_req, res) => {
  res.send("✅ API running with MongoDB and Render deployment working!");
});

app.get("/api", (_req, res) => {
  res.json({
    status: "ok",
    message: "API running with MongoDB!",
    time: new Date().toISOString(),
  });
});

// ----- Feature Routes -----
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// ----- 404 Handler -----
app.use((req, res, _next) => {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
  });
});

// ----- Error Handler -----
app.use((err, _req, res, _next) => {
  console.error("💥 Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
});

// ----- Start Server (after DB connects) -----
const PORT = process.env.PORT || 4000;
let server;

(async () => {
  try {
    await connectDB(); // Must use MONGO_URI in your env on Render
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err?.message || err);
    process.exit(1);
  }
})();

// ----- Graceful Shutdown -----
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
