import Post from "../models/Post.js";
import User from "../models/User.js";

/**
 * @function createPost
 * @desc Handles the creation of a new text post in the feed.
 * @route POST /post
 * @access Private - Requires valid JWT for user identification.
 * @param {object} req - Request object containing content in body and user.id from JWT.
 * @param {object} res - Response object.
 */
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    // req.user.id is injected by authMiddleware, representing the author.
    const author = req.user.id; 

    if (!content) {
      return res.status(400).json({ message: "Post content cannot be empty." });
    }

    const newPost = new Post({ content, author });
    await newPost.save();

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("PostController: Error creating post:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @function getFeed
 * @desc Retrieves a list of recent posts for the user's feed.
 * @route GET /post/feed
 * @access Private - Requires valid JWT.
 * @param {object} req - Request object.
 * @param {object} res - Response object containing an array of posts.
 */
export const getFeed = async (req, res) => {
  try {
    // Fetch posts, sorting by descending creation time (newest first).
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      // Efficiently fetch author's required details using Mongoose Population.
      .populate("author", "fullName profilePic") 
      .limit(20); // Standard practice to limit feed size for performance

    res.json(posts);
  } catch (error) {
    console.error("PostController: Error fetching feed:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @function likeUnlikePost
 * @desc Toggles the like status for the authenticated user on a specific post.
 * @route PUT /post/like/:postId
 * @access Private - Requires valid JWT.
 * @param {object} req - Request object containing postId in params and user.id from JWT.
 * @param {object} res - Response object.
 */
export const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    // User ID is extracted from the validated JWT token
    const userId = req.user.id; 

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Check if the user already liked the post
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // UNLIKE: Use the MongoDB $pull operator to remove the user ID
      post.likes.pull(userId);
      await post.save();
      res.json({ message: "Post unliked successfully." });
    } else {
      // LIKE: Use the MongoDB $push operator to add the user ID
      post.likes.push(userId);
      await post.save();
      res.json({ message: "Post liked successfully." });
    }
  } catch (error) {
    console.error("PostController: Error liking/unliking post:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};