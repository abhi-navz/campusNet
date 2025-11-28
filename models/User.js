import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    // Profile-related fields
    profilePic: {
      type: String, // store image URL (like from Cloudinary)
      default: "",
    },
    headline: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: "",
    },
    
//    education specific fields.
    university: {
        type: String,
        default: "", 
        index: true,
    },
    course: {
        type: String,
        default: "",
        index: true,
    },
    graduationYear: {
        type: Number,
        default: null,
        index: true,
    },

    
    // Users who have requested to connect with THIS user (A sent request to B, so A is in B's list)
    connectionRequests: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },

    // Users who are mutual connections
    connections: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },

    // Users who follow this user (one-way relationship, for social feeds like posts/updates)
    followers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },

    // Users this user follows (one-way relationship)
    following: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;