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

// Serve static files
app.use(express.static(path.join(_dirname, "frontend/dist")));

// --- React Frontend Fallback (Express 5 Safe Method) ---
app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    !req.url.startsWith("/auth") &&
    !req.url.startsWith("/user") &&
    !req.url.startsWith("/post")
  ) {
    return res.sendFile(path.resolve(_dirname, "frontend/dist/index.html"));
  }
  next();
});

export default app;
