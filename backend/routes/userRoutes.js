import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user/userController.js";

import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// route to view profile of the user.
router.get("/:id", getUserProfile);

// route to update the user Profile
router.put("/update/:id",authMiddleware, updateUserProfile);

export default router;
