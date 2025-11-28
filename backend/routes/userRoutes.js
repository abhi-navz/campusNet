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

// Publicly viewable profile
router.get("/:id", getUserProfile);

// Protected routes for profile actions
router.put("/update/:id", authMiddleware, updateUserProfile);
router.get("/search", authMiddleware, searchUsers); // search user route
router.post("/connect/:targetId", authMiddleware, sendConnectionRequest); //  SEND CONNECT ROUTE
router.post("/accept/:senderId", authMiddleware, acceptConnectionRequest); //  ACCEPT CONNECT ROUTE

export default router;