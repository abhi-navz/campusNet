import User from "../../models/User.js";
import mongoose from "mongoose";

export const getUserProfile = async (req, res) => {
    try {
      // Fetch user profile
      const user = await User.findById(req.params.id)
        .select("-password -__v")
        .populate({ path: 'connections', select: '_id' }) 
        .populate({ path: 'followers', select: '_id' })
        .populate({ path: 'connectionRequests', select: '_id' }); 
  
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Prepare response that includes counts
      const userResponse = {
          ...user.toObject(),
          connectionsCount: user.connections.length,
          followersCount: user.followers.length,
      };
      
      // Expose request count only if viewing own profile
      if (req.user && req.user.id === req.params.id) {
          userResponse.connectionRequestsCount = user.connectionRequests.length;
      }
  
      // Remove large connection/follower arrays
      userResponse.connections = undefined; 
      userResponse.followers = undefined; 
      userResponse.connectionRequests = undefined;
  
      res.json(userResponse);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };


export const updateUserProfile = async (req, res) => {
    try {
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: "Forbidden: You can only update your own profile." });
      }

      // Include new academic fields
      const { 
          fullName, 
          headline, 
          bio, 
          skills, 
          location, 
          profilePic, 
          course, 
          graduationYear
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
            graduationYear 
        },
        { new: true }
      ).select("-password");
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Normalize ID before sending back
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

/**
 * @function searchUsers
 * @desc Searches for users by name/email, excluding the current user, applying filters.
 * @route GET /user/search?q=query&course=...&year=...
 * @access Private - Requires valid JWT.
 * * CRITICAL UPDATE: Fetching the full connection arrays is necessary for the frontend to determine status accurately.
 */
export const searchUsers = async (req, res) => {
    try {
        const { q, course, year, location } = req.query;
        const currentUserId = req.user.id; 

        let query = {
            _id: { $ne: currentUserId }, // Exclude current user
        };
        
        // 1. Name/Email Search Query
        if (q && q.trim().length > 0) { // <-- FIX: Check if query has meaningful content
            const searchPattern = new RegExp(q, 'i');
            query.$or = [
                { fullName: { $regex: searchPattern } },
                { email: { $regex: searchPattern } }
            ];
        }

        // 2. Filter Application
        if (course) {
            query.course = course;
        }
        // CRITICAL FIX: Ensure year is parsed as a number correctly or ignored
        if (year && !isNaN(parseInt(year))) { 
            query.graduationYear = parseInt(year);
        }
        if (location) {
             const locationPattern = new RegExp(location, 'i');
             query.location = { $regex: locationPattern };
        }

        // 3. Fetch and Sort Users 
        // We select all user profile fields PLUS the raw connection arrays (which contain IDs).
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .select(
                "fullName headline profilePic location course graduationYear connectionRequests connections followers following" // Include all raw ID arrays
            );
        
        // Since we are selecting the raw ID arrays, the frontend logic will work based on simple includes() checks.
        res.json(users);
    } catch (error) {
        // Log the error detail
        console.error("UserController: Error searching users:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @function sendConnectionRequest
// ... (omitted existing code)
 */
export const sendConnectionRequest = async (req, res) => {
    try {
        const targetId = req.params.targetId;
        const senderId = req.user.id;
        const senderIdObject = new mongoose.Types.ObjectId(senderId);
        const targetIdObject = new mongoose.Types.ObjectId(targetId);

        if (targetId === senderId) {
            return res.status(400).json({ message: "Cannot send a request to yourself." });
        }

        const [targetUser, senderUser] = await Promise.all([
            User.findById(targetId),
            User.findById(senderId)
        ]);

        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found." });
        }

        if (targetUser.connections.includes(senderIdObject)) {
            return res.status(400).json({ message: "Already connected." });
        }
        
        if (targetUser.connectionRequests.includes(senderIdObject)) {
            return res.status(400).json({ message: "Connection request already pending." });
        }
        
        if (senderUser.connectionRequests.includes(targetIdObject)) {
             await acceptConnectionLogic(targetId, senderId);
             return res.json({ message: "Connection established (request auto-accepted)." });
        }

        await User.findByIdAndUpdate(targetId, {
            $push: { connectionRequests: senderId }
        });
        
        await User.findByIdAndUpdate(senderUser._id, { $push: { following: targetId } }); // Use senderUser._id to ensure correct type
        await User.findByIdAndUpdate(targetUser._id, { $push: { followers: senderId } }); // Use targetUser._id

        res.json({ message: "Connection request sent successfully." });
    } catch (error) {
        console.error("UserController: Error sending connection request:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const acceptConnectionLogic = async (senderId, recipientId) => {
    // 1. Recipient side
    await User.findByIdAndUpdate(recipientId, {
        $pull: { connectionRequests: senderId }, 
        $addToSet: { connections: senderId },       
        $addToSet: { following: senderId }, 
    });
    
    // 2. Sender side
    await User.findByIdAndUpdate(senderId, {
        $addToSet: { connections: recipientId },
        $addToSet: { following: recipientId }, 
        $addToSet: { followers: recipientId }, 
    });
};

export const acceptConnectionRequest = async (req, res) => {
    try {
        const senderId = req.params.senderId;
        const recipientId = req.user.id; 

        const recipientUser = await User.findById(recipientId);
        if (!recipientUser.connectionRequests.includes(senderId)) {
            return res.status(404).json({ message: "Connection request not found." });
        }

        await acceptConnectionLogic(senderId, recipientId);

        const updatedRecipient = await User.findById(recipientId).select("-password -__v");
        
        const formattedUser = {
            ...updatedRecipient.toObject(),
            id: updatedRecipient._id,
        };

        res.json({ message: "Connection accepted.", user: formattedUser });
    } catch (error) {
        console.error("UserController: Error accepting connection request:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};