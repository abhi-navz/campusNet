import express from "express";
import { createPost, getFeed, likeUnlikePost } from "../controllers/postController.js";
import authMiddleware from "../middleware/auth.js"; // Import JWT middleware for protected routes

const router = express.Router();

/**
 * @route GET /post/feed
 * @desc Get the main activity feed.
 * @access Private (Protected by authMiddleware)
 */
router.get("/feed", authMiddleware, getFeed);

/**
 * @route POST /post
 * @desc Create a new feed post.
 * @access Private (Protected by authMiddleware)
 */
router.post("/", authMiddleware, createPost);

/**
 * @route PUT /post/like/:postId
 * @desc Toggle like status on a post.
 * @access Private (Protected by authMiddleware)
 */
router.put("/like/:postId", authMiddleware, likeUnlikePost);

export default router;