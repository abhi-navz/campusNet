import express from "express";
import {
  createPost,
  getFeed,
  likeUnlikePost,
  getComments,
  addComment,
  likeUnlikeComment,
  deleteComment, 
  getPostsByAuthor,
  deletePost,
  updatePost 
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

/**
 * @route PUT /post/:postId
 * @desc Update a specific post (Author only).
 * @access Private (Protected by authMiddleware)
 */
router.put("/:postId", authMiddleware, updatePost);

/**
 * @route DELETE /post/:postId
 * @desc Delete a specific post (Author only).
 * @access Private (Protected by authMiddleware)
 */
router.delete("/:postId", authMiddleware, deletePost); 


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
 * @route DELETE /post/comment/:commentId
 * @desc Delete a specific comment (Author only).
 * @access Private (Protected by authMiddleware)
 */
router.delete("/comment/:commentId", authMiddleware, deleteComment); // <-- NEW ROUTE

/**
 * @route PUT /post/comment/like/:commentId
 * @desc Toggle like status on a specific comment.
 * @access Private (Protected by authMiddleware)
 */
router.put("/comment/like/:commentId", authMiddleware, likeUnlikeComment);

// --- Posts in PROFILE ---
/**
 * @route GET /post/author/:authorId
 * @desc Get recent posts made by a specific user.
 * @access Private (Protected by authMiddleware)
 */
router.get("/author/:authorId", authMiddleware, getPostsByAuthor);

export default router;