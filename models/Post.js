import mongoose from "mongoose";

/**
 * @typedef {object} PostSchema
 * @property {string} content - The main text content of the post (Max 500 characters).
 * @property {mongoose.Schema.Types.ObjectId} author - Reference to the User who created the post.
 * @property {mongoose.Schema.Types.ObjectId[]} likes - Array of User IDs who have liked the post.
 * @property {number} commentCount - Count of comments (for optimization).
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */
const PostSchema = new mongoose.Schema(
  {
    // The post content, required field
    content: {
      type: String,
      required: true,
      maxlength: 800, // Enforce character limit
      trim: true,
    },
    // Reference to the User model via ObjectId
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Array to store IDs of users who have liked the post
    likes: {
      type: [mongoose.Schema.Types.ObjectId], 
      default: [],
    },
    // Placeholder for future comment tracking (just count for now)
    commentCount: {
        type: Number,
        default: 0,
    }
  },
  { 
    timestamps: true 
  }
);

const Post = mongoose.model("Post", PostSchema);
export default Post;