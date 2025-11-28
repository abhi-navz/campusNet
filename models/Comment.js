import mongoose from "mongoose";

/**
 * @typedef {object} CommentSchema
 * @property {mongoose.Schema.Types.ObjectId} post - Reference to the Post the comment belongs to.
 * @property {mongoose.Schema.Types.ObjectId} author - Reference to the User who created the comment.
 * @property {string} content - The text content of the comment (Max 300 characters).
 * @property {mongoose.Schema.Types.ObjectId[]} likes - NEW: Array of User IDs who have liked the comment.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */
const CommentSchema = new mongoose.Schema(
  {
    // The post the comment belongs to
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    // The user who made the comment
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Comment content
    content: {
      type: String,
      required: true,
      maxlength: 300,
      trim: true,
    },
   
   // Likes for the comment itself
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for fast lookups by post ID and sorting by date
CommentSchema.index({ post: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;