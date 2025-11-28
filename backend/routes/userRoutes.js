import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  sendConnectionRequest, 
  acceptConnectionRequest, 
} from "../controllers/user/userController.js";

import authMiddleware from "../middleware/auth.js";

const router = express.Router();


// Search route - Protected, must be first
router.get("/search", authMiddleware, searchUsers);

// Connection management routes - Protected
router.post("/connect/:targetId", authMiddleware, sendConnectionRequest);
router.post("/accept/:senderId", authMiddleware, acceptConnectionRequest);

// Profile update route - Protected
router.put("/update/:id", authMiddleware, updateUserProfile);

// Profile view route - Public (can be viewed without login)

router.get("/:id", getUserProfile);

export default router;