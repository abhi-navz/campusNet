// backend/controllers/user/userController.js

import User from "../../models/User.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
    try {
      // SECURITY CHECK: Ensure the user ID from the JWT payload (req.user.id) 
      // matches the ID of the profile being updated (req.params.id)
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: "Forbidden: You can only update your own profile." });
      }

      const { fullName, headline, bio, skills, location, profilePic } = req.body;
  
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { fullName, headline, bio, skills, location, profilePic },
        { new: true }
      ).select("-password");
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      //normalize ID before sending back
      const formattedUser = {
        ...updatedUser.toObject(),
        id: updatedUser._id,
      };
  
      res.json({ message: "Profile updated", user: formattedUser });
    } catch (error) {
      res.status(500).json({ message: "Update failed", error: error.message });
    }
  };
  