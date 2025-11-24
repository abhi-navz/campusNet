import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js"

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

/**
 * @function getComments
 * @desc Retrieves all comments for a specific post, sorted by oldest first.
 * @route GET /post/comments/:postId
 * @access Private - Requires valid JWT.
 * @param {object} req - Request object containing postId in params.
 * @param {object} res - Response object containing an array of comments.
 */
export const getComments = async (req, res) => {
  try {
      const { postId } = req.params;
      
      // Find comments, populate author details, and sort by creation date (oldest first for thread readability)
      const comments = await Comment.find({ post: postId })
          .populate("author", "fullName profilePic")
          .sort({ createdAt: 1 });

      res.json(comments);
  } catch (error) {
      console.error("PostController: Error fetching comments:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const addComment = async (req, res) => {
  try {
      const { postId } = req.params;
      const { content } = req.body;
      const authorId = req.user.id;

      if (!content || content.trim().length === 0) {
          return res.status(400).json({ message: "Comment content cannot be empty." });
      }
      
      // 1. Create the new comment
      const newComment = new Comment({
          post: postId,
          author: authorId,
          content,
      });
      await newComment.save();
      
      // 2. Increment the commentCount on the parent Post
      await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
      
      // 3. Populate author details before sending the comment back
      const populatedComment = await Comment.findById(newComment._id)
          .populate('author', 'fullName profilePic');

      res.status(201).json(populatedComment);
  } catch (error) {
      console.error("PostController: Error adding comment:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};