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
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
