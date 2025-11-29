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

// Catch-all route for React Router
app.get("*", (req, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});


export default app;
