import express from "express";
import {
  createPost,
  getFeed,
  likeUnlikePost,
  getComments,
  addComment,
  likeUnlikeComment
} from "../controllers/postController.js";
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


// --- COMMENT ROUTES ---

/**
 * @route GET /post/comments/:postId
 * @desc Get all comments for a specific post.
 * @access Private (Protected by authMiddleware)
 */
router.get("/comments/:postId", authMiddleware, getComments);

/**
 * @route POST /post/comments/:postId
 * @desc Add a new comment to a specific post.
 * @access Private (Protected by authMiddleware)
 */
router.post("/comments/:postId", authMiddleware, addComment);

/**
 * @route PUT /post/comment/like/:commentId
 * @desc Toggle like status on a specific comment.
 * @access Private (Protected by authMiddleware)
 */
router.put("/comment/like/:commentId", authMiddleware, likeUnlikeComment);

export default router;
