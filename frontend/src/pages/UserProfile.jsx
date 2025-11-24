import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { FiThumbsUp, FiMessageSquare } from "react-icons/fi"; // For post interaction icons
import Layout from "../components/Layout";
import CommentModal from "../components/CommentModal"; // For opening comments
import { timeAgo } from "../utils/timeAgo"; // For relative timestamp display

/**
 * @component UserProfile
 * @desc Displays a specific user's public profile, bio, skills, and recent posts.
 */
export default function UserProfile() {
  const { id } = useParams(); // Dynamic user ID from URL (/profile/:id)
  const navigate = useNavigate();

  // State management
  const [profileUser, setProfileUser] = useState(null); // The user profile being viewed
  const [loggedInUser, setLoggedInUser] = useState(null); // The authenticated user
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postError, setPostError] = useState(null);

  // Comment Modal State
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Load logged-in user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setLoggedInUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  /**
   * @function fetchProfileData
   * @desc Fetches the target user's profile details from the public endpoint.
   */
  const fetchProfileData = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/user/${id}`);
      const data = await res.json();

      if (res.ok) {
        const normalizedUser = {
          ...data,
          id: data._id || data.id,
        };
        setProfileUser(normalizedUser);
        return normalizedUser; // Return for use in fetchPosts
      } else {
        setProfileUser(null);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileUser(null);
      return null;
    }
  }, [id]);

  /**
   * @function fetchPosts
   * @desc Fetches the recent posts for the current profile user (limited to 4).
   */
  const fetchPosts = useCallback(async (userId) => {
    setPostError(null);
    const token = localStorage.getItem('token');
    
    // Authorization check for protected post endpoint
    if (!token) {
        setPostError("Authentication token missing. Cannot load posts.");
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/post/author/${userId}?limit=4`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
            setPosts(data);
        } else {
            setPostError(data.message || "Failed to fetch user posts.");
            setPosts([]);
        }
    } catch (error) {
        setPostError("Network error: Could not load posts.");
        console.error("Error fetching user posts:", error);
    }
  }, []);

  // Main effect to load data
  useEffect(() => {
    setLoading(true);
    fetchProfileData().then(user => {
        if (user) {
            fetchPosts(user.id);
        }
        setLoading(false);
    });
  }, [fetchProfileData, fetchPosts]);

  // Handler for Edit button
  const handleEdit = () => {
    navigate("/edit-profile");
  };

  // Handler for Post Likes (similar to Home.jsx) - NOTE: This requires the user's ID
  const handleLike = async (postId, currentLikes) => {
    const token = localStorage.getItem('token');
    const userId = loggedInUser?.id;

    if (!token || !userId) {
        alert("Please log in to interact with posts.");
        return;
    }

    try {
        // Optimistic update: Update the state before API response
        setPosts(prevPosts => 
            prevPosts.map(p => {
                if (p._id === postId) {
                    const isLiked = currentLikes.includes(userId);
                    const newLikes = isLiked 
                        ? currentLikes.filter(id => id !== userId)
                        : [...currentLikes, userId];
                    
                    return { ...p, likes: newLikes };
                }
                return p;
            })
        );
        
        // API Call
        const response = await fetch(`http://localhost:5000/post/like/${postId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            // If API fails, revert state by re-fetching posts
            fetchPosts(id); 
            console.error("Like API failed:", await response.json());
        }
    } catch (err) {
        console.error("Network error during like action:", err);
        fetchPosts(id); 
    }
  };

  // Handler for Comment Count Update (simpler version for profile page)
  const handleCommentCountUpdated = () => {
    fetchPosts(id); // Simple re-fetch to update count, or could be optimized
  };

  // Handlers for Comment Modal
  const openCommentModal = (postData) => {
    setSelectedPost(postData);
    setShowCommentsModal(true);
  };
  
  const closeCommentModal = () => {
    setSelectedPost(null);
    setShowCommentsModal(false);
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <p className="text-gray-600 text-center mt-10">Loading profile...</p>
      </Layout>
    );
  }

  // User not found
  if (!profileUser) {
    return (
      <Layout>
        <p className="text-red-500 text-center mt-10">User not found!</p>
      </Layout>
    );
  }

  /**
   * @component ProfilePostItem
   * @desc Renders a single post for the profile page.
   */
  const ProfilePostItem = ({ post }) => {
    const isLiked = post.likes.includes(loggedInUser?.id);

    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-gray-800 mb-2 line-clamp-2">{post.content}</p>
        
        {/* Engagement bar */}
        <div className="flex items-center text-xs text-gray-500 mt-2">
            <p className="mr-4">{timeAgo(post.createdAt)}</p>

            {/* LIKE BUTTON */}
            <button 
                onClick={() => handleLike(post._id, post.likes)}
                className={`flex items-center mr-3 font-medium transition 
                            ${isLiked 
                                ? 'text-violet-700 font-bold hover:text-violet-600' 
                                : 'text-gray-500 hover:text-violet-600'}`}
                disabled={!loggedInUser}
            >
                <FiThumbsUp className="mr-1 w-3 h-3" />
                {post.likes?.length || 0}
            </button>
            
            {/* COMMENTS BUTTON */}
            <button 
                onClick={() => openCommentModal(post)}
                className="flex items-center text-gray-500 hover:text-violet-600 transition"
                disabled={!loggedInUser}
            >
                <FiMessageSquare className="mr-1 w-3 h-3" />
                {post.commentCount || 0}
            </button>
        </div>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 p-4 bg-white rounded-xl shadow">
          <img
            src={profileUser.profilePic || "https://placehold.co/112x112/9253ed/ffffff?text=DU"}
            alt={profileUser.fullName}
            className="w-28 h-28 rounded-full object-cover border-4 border-violet-500"
          />
          <div className="text-center sm:text-left flex-1 pt-3">
            <h1 className="text-3xl font-bold text-violet-700">
              {profileUser.fullName}
            </h1>
            <p className="text-gray-600 text-lg">
              {profileUser.headline || "No headline yet"}
            </p>
            <p className="text-gray-500 text-md mt-1">
              {profileUser.location || "Location not set"}
            </p>
          </div>
          
          {/* Edit Profile Button (only for logged-in user) */}
          {loggedInUser && loggedInUser.id === profileUser.id && (
            <div className="flex items-center sm:self-start mt-4 sm:mt-0">
              <button
                onClick={handleEdit}
                className="bg-violet-700 text-white px-4 py-2 rounded-full font-medium hover:bg-violet-600 transition"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* 1. ABOUT / BIO SECTION */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-semibold text-violet-700 mb-2">About</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {profileUser.bio
              ? profileUser.bio
              : "This user hasn't written a bio yet."}
          </p>
        </div>
        
        {/* 2. ACTIVITY (POSTS) SECTION */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-semibold text-violet-700 mb-4">
            Activity (Recent Posts)
          </h2>
          {postError && (
              <p className="text-red-500 text-sm">{postError}</p>
          )}
          
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <ProfilePostItem key={post._id} post={post} />
              ))}
              {/* Option to see more posts (future feature) */}
              {/* Note: This button is static, awaiting a dedicated all-posts page */}
              <div className="text-center pt-2 border-t mt-4">
                 <button className="text-violet-700 font-medium hover:underline text-sm">
                    View All Activity
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm italic">
                {profileUser.id === loggedInUser?.id 
                    ? "You haven't posted anything yet." 
                    : `${profileUser.fullName.split(' ')[0]} hasn't posted anything yet.`
                }
            </p>
          )}
        </div>


        {/* 3. SKILLS SECTION - MOVED DOWN */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-semibold text-violet-700 mb-2">Skills</h2>
          {profileUser.skills && profileUser.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profileUser.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm italic">No skills added yet.</p>
          )}
        </div>


      </div>

      {/* Comment Modal Component (requires loggedInUser for interactions) */}
      {showCommentsModal && selectedPost && loggedInUser && (
        <CommentModal 
          post={selectedPost} 
          onClose={closeCommentModal} 
          onCommentCountUpdated={handleCommentCountUpdated} 
          loggedInUserId={loggedInUser.id}
        />
      )}
    </Layout>
  );
}