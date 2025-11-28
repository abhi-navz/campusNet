import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { FiThumbsUp, FiMessageSquare, FiUsers, FiUserPlus, FiMail, FiUser } from "react-icons/fi"; 
import Layout from "../components/Layout";
import CommentModal from "../components/CommentModal"; 
import { timeAgo } from "../utils/timeAgo"; 

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

  // Connection State for Visitors
  const [connectionStatus, setConnectionStatus] = useState('unknown'); // 'Connect', 'Pending', 'Connected', 'Self'

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
   * @function determineConnectionStatus
   * @desc Determines the relationship status between the logged-in user and the profile user.
   */
  const determineConnectionStatus = (profileData) => {
    const visitorId = loggedInUser?.id;
    if (!visitorId) return 'Connect'; // Not logged in

    if (visitorId === profileData.id) {
        return 'Self'; // Viewing own profile
    }

    const isConnected = profileData.connections?.includes(visitorId);
    const isRequestSent = profileData.connectionRequests?.includes(visitorId); // Did *I* send a request to *them*?
    
    if (isConnected) return 'Connected';
    if (isRequestSent) return 'Pending';
    return 'Connect';
  };
  
  /**
   * @function fetchProfileData
   * @desc Fetches the target user's profile details and determines connection status.
   */
  const fetchProfileData = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    try {
      // The API now returns connectionsCount and followersCount
      const res = await fetch(`http://localhost:5000/user/${id}`, {
          method: 'GET',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();

      if (res.ok) {
        const normalizedUser = {
          ...data,
          id: data._id || data.id,
        };
        setProfileUser(normalizedUser);
        
        // Set initial connection status
        setConnectionStatus(determineConnectionStatus(normalizedUser));
        
        return normalizedUser; 
      } else {
        setProfileUser(null);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileUser(null);
      return null;
    }
  }, [id, loggedInUser]);

  /**
   * @function fetchPosts
   * @desc Fetches the recent posts for the current profile user (limited to 4).
   */
  const fetchPosts = useCallback(async (userId) => {
    setPostError(null);
    const token = localStorage.getItem('token');
    
    // Only attempt to fetch posts if logged in (as endpoint is protected)
    if (!token) {
        setPostError("Login required to load user posts.");
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

  /**
   * @function handleConnect
   * @desc Sends a connection request to the profile user.
   */
  const handleConnect = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
          alert("Please log in to send requests.");
          return;
      }

      setConnectionStatus('Pending'); // Optimistic UI update

      try {
          const res = await fetch(`http://localhost:5000/user/connect/${profileUser.id}`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await res.json();

          if (res.ok) {
              alert(data.message);
              // If auto-accepted, the status should technically become 'Connected', but we rely on the message
              if (data.message.includes('established')) {
                  setConnectionStatus('Connected');
              } else {
                  setConnectionStatus('Pending');
              }
          } else {
              alert(data.message || "Failed to send connection request.");
              setConnectionStatus('Connect'); // Revert on failure
          }
      } catch (e) {
          alert("Network error. Could not send request.");
          setConnectionStatus('Connect'); // Revert on network error
      }
  };

  // Handler for Post Likes (copied from Home.jsx)
  const handleLike = async (postId, currentLikes) => {
    const token = localStorage.getItem('token');
    const userId = loggedInUser?.id;

    if (!token || !userId) {
        alert("Please log in to interact with posts.");
        return;
    }

    try {
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
        
        const response = await fetch(`http://localhost:5000/post/like/${postId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
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
  
  // --- Main Profile UI ---
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        
        {/* Profile Header and Action Buttons */}
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
            {/* Academic Info */}
            <p className="text-gray-500 text-md mt-1">
              {profileUser.course && <span>{profileUser.course} | </span>}
              {profileUser.graduationYear && <span>Grad {profileUser.graduationYear} | </span>}
              {profileUser.location || "Location not set"}
            </p>
            
            {/* Connection Counts */}
            <div className="flex justify-center sm:justify-start space-x-4 mt-3 text-sm">
                <span className="text-gray-700 font-semibold">{profileUser.connectionsCount || 0} Connections</span>
                <span className="text-gray-700 font-semibold">{profileUser.followersCount || 0} Followers</span>
            </div>
          </div>
          
          {/* Action Buttons (Connect/Message/Edit) */}
          <div className="flex items-center sm:self-start mt-4 sm:mt-0 space-x-2">
            
            {connectionStatus === 'Self' && (
                <button
                    onClick={handleEdit}
                    className="bg-violet-700 text-white px-4 py-2 rounded-full font-medium hover:bg-violet-600 transition flex items-center"
                >
                    <FiUser className="mr-2" /> Edit Profile
                </button>
            )}

            {connectionStatus === 'Connect' && (
                <button
                    onClick={handleConnect}
                    className="bg-violet-700 text-white px-4 py-2 rounded-full font-medium hover:bg-violet-600 transition flex items-center"
                    disabled={!loggedInUser}
                >
                    <FiUserPlus className="mr-2" /> Connect
                </button>
            )}

            {connectionStatus === 'Pending' && (
                <button
                    disabled
                    className="bg-gray-400 text-white px-4 py-2 rounded-full font-medium flex items-center opacity-80"
                >
                    Request Sent
                </button>
            )}

            {connectionStatus === 'Connected' && (
                <>
                    <button
                        className="bg-violet-700 text-white px-4 py-2 rounded-full font-medium hover:bg-violet-600 transition flex items-center"
                    >
                        <FiMail className="mr-2" /> Message
                    </button>
                    <button
                        disabled
                        className="border border-green-500 text-green-500 px-4 py-2 rounded-full font-medium opacity-80"
                    >
                        Connected
                    </button>
                </>
            )}
          </div>
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


        {/* 3. SKILLS SECTION */}
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
                </span
              >
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