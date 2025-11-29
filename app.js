import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

const app = express();
const _dirname = path.resolve();

// Middlewares
app.use(express.json());
app.use(cors());

// API Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/post", postRoutes);

// Serve frontend build
app.use(express.static(path.join(_dirname, "frontend/dist")));

// --- FIX FOR EXPRESS 5 ---
// React Router fallback (must be LAST)
// Express 5 does NOT support "*", "/*", or regex.
// Only this form works: "/:path*"

app.get("/:path*", (req, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});

export default app;
