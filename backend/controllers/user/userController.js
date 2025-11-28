import User from "../../models/User.js";
import mongoose from "mongoose";


// UTILITY FUNCTIONS

/**
 * Utility function to convert Mongoose ObjectId arrays to string arrays
 */
const convertIdsToStrings = (arr) => {
  return arr ? arr.map(id => id.toString()) : [];
};


// PROFILE MANAGEMENT


/**
 * @function getUserProfile
 * @desc Fetches a user's public profile by ID
 * @route GET /user/:id
 * @access Public
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -__v")
      .populate({ path: "connections", select: "_id" })
      .populate({ path: "followers", select: "_id" })
      .populate({ path: "connectionRequests", select: "_id" });

    if (!user) return res.status(404).json({ message: "User not found" });

    const userResponse = {
      ...user.toObject(),
      connectionsCount: user.connections.length,
      followersCount: user.followers.length,
      id: user._id,
    };

    // Check if the requester is viewing their own profile
    const isOwnProfile = req.user && req.user.id === user._id.toString();

    if (isOwnProfile) {
      // Viewing own profile: Keep connectionRequests as array of IDs
      userResponse.connectionRequestsCount = user.connectionRequests.length;
      userResponse.connectionRequests = convertIdsToStrings(user.connectionRequests);
      userResponse.connections = convertIdsToStrings(user.connections);
      userResponse.followers = convertIdsToStrings(user.followers);
      
      console.log(`User viewing own profile. Pending requests: ${userResponse.connectionRequests.length}`);
    } else {
      // Viewing someone else's profile: Hide sensitive details
      userResponse.connectionRequestsCount = user.connectionRequests.length;
      userResponse.connectionRequests = undefined;
      userResponse.connections = undefined;
      userResponse.followers = undefined;
    }

    res.json(userResponse);
  } catch (error) {
    console.error("UserController: Error fetching profile:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @function updateUserProfile
 * @desc Updates the authenticated user's profile
 * @route PUT /user/update/:id
 * @access Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only update your own profile." });
    }

    const {
      fullName,
      headline,
      bio,
      skills,
      location,
      profilePic,
      course,
      graduationYear,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        headline,
        bio,
        skills,
        location,
        profilePic,
        course,
        graduationYear,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const formattedUser = {
      ...updatedUser.toObject(),
      id: updatedUser._id,
    };

    res.json({ message: "Profile updated", user: formattedUser });
  } catch (error) {
    console.error("UserController: Update failed:", error.message);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// SEARCH FUNCTIONALITY
/**
 * @function searchUsers
 * @desc Searches for users by name/email, excluding the current user, applying filters.
 * @route GET /user/search?q=query&course=...&year=...&location=...
 * @access Private
 */
export const searchUsers = async (req, res) => {
  try {
    const { q, course, year, location } = req.query;
    const currentUserId = req.user.id;

    console.log("🔍 Search request:", { q, course, year, location, from: currentUserId });

    let query = {
      _id: { $ne: currentUserId },
    };

    const conditions = [];

    if (q && q.trim().length > 0) {
      const searchPattern = new RegExp(q.trim(), "i");
      conditions.push({
        $or: [
          { fullName: { $regex: searchPattern } },
          { email: { $regex: searchPattern } },
        ]
      });
    }

    if (course && course.trim().length > 0) {
      conditions.push({ course: course });
    }

    if (year && !isNaN(parseInt(year))) {
      conditions.push({ graduationYear: parseInt(year) });
    }

    if (location && location.trim().length > 0) {
      const locationPattern = new RegExp(location.trim(), "i");
      conditions.push({ location: { $regex: locationPattern } });
    }

    if (conditions.length > 0) {
      query.$and = conditions;
    }

    console.log("Query:", JSON.stringify(query, null, 2));

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .select(
        "fullName headline profilePic location course graduationYear email connectionRequests connections followers following"
      );
    
    console.log(`Found ${users.length} users`);

    const formattedUsers = users.map((user, index) => {
        const formatted = {
            ...user.toObject(),
            connectionRequests: convertIdsToStrings(user.connectionRequests),
            connections: convertIdsToStrings(user.connections),
            followers: convertIdsToStrings(user.followers),
            following: convertIdsToStrings(user.following),
        };
        
        if (index < 3) {
            console.log(`👤 ${formatted.fullName}:`);
            console.log(`   - Connected to me? ${formatted.connections.includes(currentUserId)}`);
            console.log(`   - Has my request? ${formatted.connectionRequests.includes(currentUserId)}`);
        }
        
        return formatted;
    });

    res.json(formattedUsers);
  } catch (error) {
    console.error("Search error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ message: "Server error during search", error: error.message });
  }
};


// CONNECTION MANAGEMENT


/**
 * @function sendConnectionRequest
 * @desc Sends a connection request to the target user
 * @route POST /user/connect/:targetId
 * @access Private
 */
export const sendConnectionRequest = async (req, res) => {
  try {
    const targetId = req.params.targetId;
    const senderId = req.user.id;
    
    const senderIdString = senderId.toString();
    const targetIdString = targetId.toString();

    if (targetId === senderId) {
      return res.status(400).json({ message: "Cannot connect to yourself." });
    }

    const [targetUser, senderUser] = await Promise.all([
      User.findById(targetId),
      User.findById(senderId),
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }
    
    if (!senderUser) {
      return res.status(404).json({ message: "Your profile not found." });
    }
    
    const targetConnections = convertIdsToStrings(targetUser.connections);
    const targetRequests = convertIdsToStrings(targetUser.connectionRequests);
    const senderRequests = convertIdsToStrings(senderUser.connectionRequests);

    if (targetConnections.includes(senderIdString)) {
      return res.status(400).json({ message: "Already connected." });
    }

    if (targetRequests.includes(senderIdString)) {
      return res.status(400).json({ message: "Request already sent." });
    }

    // Auto-accept if they already sent you a request
    if (senderRequests.includes(targetIdString)) {
      await acceptConnectionLogic(targetId, senderId);
      return res.json({ message: "Connection established!" });
    }
    
    // Send new request
    await User.findByIdAndUpdate(targetId, {
      $addToSet: { connectionRequests: senderId },
    });

    await User.findByIdAndUpdate(senderId, { 
      $addToSet: { following: targetId } 
    });
    await User.findByIdAndUpdate(targetId, { 
      $addToSet: { followers: senderId } 
    });

    console.log(`Request sent: ${senderId} → ${targetId}`);

    res.json({ message: "Connection request sent!" });
  } catch (error) {
    console.error(" Error sending request:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @function acceptConnectionLogic
 * @desc Helper to finalize a connection
 */
const acceptConnectionLogic = async (senderId, recipientId) => {
  await User.findByIdAndUpdate(recipientId, {
    $pull: { connectionRequests: senderId },
    $addToSet: { connections: senderId, following: senderId },
  });

  await User.findByIdAndUpdate(senderId, {
    $addToSet: { connections: recipientId, following: recipientId, followers: recipientId },
  });

  console.log(`Connection accepted: ${senderId} ↔ ${recipientId}`);
};

/**
 * @function acceptConnectionRequest
 * @desc Accepts an incoming connection request
 * @route POST /user/accept/:senderId
 * @access Private
 */
export const acceptConnectionRequest = async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const recipientId = req.user.id;

    const recipientUser = await User.findById(recipientId);
    
    if (!recipientUser) {
      return res.status(404).json({ message: "Your profile not found." });
    }
    
    const recipientRequests = convertIdsToStrings(recipientUser.connectionRequests);
    
    if (!recipientRequests.includes(senderId)) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    await acceptConnectionLogic(senderId, recipientId);

    const updatedRecipient = await User.findById(recipientId).select("-password -__v");

    const formattedUser = {
      ...updatedRecipient.toObject(),
      id: updatedRecipient._id,
    };

    res.json({ message: "Connection accepted!", user: formattedUser });
  } catch (error) {
    console.error("Error accepting request:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};