import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js"; 

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Health Check / Root Route
app.get("/", (req, res) => {
  res.send("CampusNet API operational.");
});

// Primary API Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/post", postRoutes); 

export default app;