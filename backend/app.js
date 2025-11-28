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

// Health Route
app.get("/", (req, res) => {
  res.send("CampusNet API operational.");
});

// API Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/post", postRoutes);

// Serve frontend build
app.use(express.static(path.join(_dirname, "frontend/dist")));

// Catch-all route (for Express 5)
app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});

export default app;
