import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react"; 
// Added FiCheck, FiEdit2, FiUsers 
import { FiThumbsUp, FiMessageSquare, FiUsers, FiUserPlus, FiMail, FiUser, FiCheck, FiEdit2 } from "react-icons/fi"; // <-- UPDATED IMPORT
import Layout from "../components/Layout";
import CommentModal from "../components/CommentModal"; 
import Toast from "../components/Toast"; 
import EditPostModal from "../components/EditPostModal"; // <-- NEW IMPORT
import { timeAgo } from "../utils/timeAgo"; 

/**
 * @component UserProfile
 * @desc Displays a specific user's public profile, bio, skills, and recent posts,
 * and provides management for their own connections/requests.
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
  
  // State to control whether to show 4 posts (preview) or all posts
  const [showAllPosts, setShowAllPosts] = useState(false); 
  
  // Connection State for Visitors
  const [connectionStatus, setConnectionStatus] = useState('unknown'); 
  
  // Toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Comment & Edit Modal States
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); 
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Load logged-in user from localStorage on mount (separate effect)
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
  const determineConnectionStatus = (profileData, visitorId) => {
    if (!visitorId) return 'Connect'; // Not logged in

    if (visitorId === profileData.id) {
        return 'Self'; // Viewing own profile
    }
    
    const isConnected = profileData.connections?.includes(visitorId) || false;
    const isRequestSent = profileData.connectionRequests?.includes(visitorId) || false; 
    
    if (isConnected) return 'Connected';
    if (isRequestSent) return 'Pending';
    return 'Connect';
  };

  /**
   * @function fetchProfileData
   * @desc Fetches the target user's profile details.
   */
  const fetchProfileData = useCallback(async (currentLoggedInUser) => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`http://localhost:5000/user/${id}`, {
          method: 'GET',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();

      if (res.ok) {
        const normalizedUser = {
          ...data,
          id: data._id || data.id,
          // Check if this is the logged-in user's profile
          isOwnProfile: currentLoggedInUser?.id === (data._id || data.id), 
        };
        
        // Set initial connection status
        setConnectionStatus(determineConnectionStatus(normalizedUser, currentLoggedInUser?.id));
        
        return normalizedUser; 
      } else {
        setToastMessage({type: 'error', message: data.message || "Failed to fetch profile."});
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setToastMessage({type: 'error', message: "Network error fetching profile."});
      return null;
    }
  }, [id]);

  /**
   * @function fetchPosts
   * @desc Fetches posts for the current profile user.
   * @param {string} userId - The ID of the user whose posts to fetch.
   * @param {boolean} allPosts - If true, fetches all posts. If false, limits to 4 (default preview).
   */
  const fetchPosts = useCallback(async (userId, allPosts) => {
    setPostError(null);
    const token = localStorage.getItem('token');
    
    if (!token) {
        setPostError("Login required to load user posts.");
        return;
    }

    // Pass showAllPosts state to determine if limit should be applied
    const limitQuery = allPosts ? '' : '?limit=4';

    try {
        const res = await fetch(`http://localhost:5000/post/author/${userId}${limitQuery}`, {
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
  
  // --- OPTIMIZATION FIX: Consolidate data fetching into a single coordinated effect ---
  useEffect(() => {
    // Only proceed if loggedInUser state has been initialized (after initial localStorage check)
    if (loggedInUser === null && localStorage.getItem('token')) {
        // If loggedInUser is null but a token exists, we are waiting for the state update.
        return; 
    }
    
    // This is the coordinated start of fetching all necessary data
    async function initialFetch() {
        setLoading(true);
        try {
            const userProfile = await fetchProfileData(loggedInUser);
            setProfileUser(userProfile);
            
            if (userProfile) {
                // Fetch posts immediately after getting the user profile
                await fetchPosts(userProfile.id, showAllPosts); 
            }
        } catch (error) {
            console.error("Initial profile load failed:", error);
        } finally {
            setLoading(false);
        }
    }
    
    initialFetch();
    
  }, [id, loggedInUser, fetchProfileData, fetchPosts, showAllPosts]); // Dependencies: Re-run on ID change or user status change


  // Handler for "View All Activity" toggle (Now ONLY toggles state, fetchPosts is in useEffect)
  const handleToggleShowAllPosts = () => {
    setShowAllPosts(prev => !prev);
  }

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
          setToastMessage({ type: 'error', message: "Please log in to send requests." });
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
              setToastMessage({ type: 'success', message: data.message });
              if (data.message.includes('established')) {
                  setConnectionStatus('Connected');
              } else {
                  setConnectionStatus('Pending');
              }
          } else {
              setToastMessage({ type: 'error', message: data.message || "Failed to send request." });
              setConnectionStatus('Connect'); // Revert on failure
          }
      } catch (e) {
          setToastMessage({ type: 'error', message: "Network error. Could not send request." });
          setConnectionStatus('Connect'); // Revert on network error
      }
  };

  /**
   * @function handleAcceptRequest
   * @desc Accepts an incoming connection request on the user's own profile.
   * @param {string} senderId - The ID of the user whose request is being accepted.
   */
  const handleAcceptRequest = async (senderId) => {
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`http://localhost:5000/user/accept/${senderId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
            setToastMessage({ type: 'success', message: data.message });
            
            // Optimistic UI update: Remove sender from requests and update counts/status
            setProfileUser(prev => ({
                ...prev,
                connectionRequests: prev.connectionRequests.filter(id => id !== senderId),
                connectionsCount: prev.connectionsCount + 1,
            }));

        } else {
            setToastMessage({ type: 'error', message: data.message || "Failed to accept request." });
        }
    } catch (err) {
        setToastMessage({ type: 'error', message: "Network error during acceptance." });
        console.error("Error accepting request:", err);
    }
  };

  // Handler for Post Likes (retains functionality)
  const handleLike = async (postId, currentLikes) => {
    const token = localStorage.getItem('token');
    const userId = loggedInUser?.id;

    if (!token || !userId) {
        setToastMessage({ type: 'error', message: "Please log in to interact with posts." });
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
            // If interaction fails, re-fetch the posts to sync state
            fetchPosts(id, showAllPosts); 
            console.error("Like API failed:", await response.json());
        }
    } catch (err) {
        console.error("Network error during like action:", err);
        // If interaction fails, re-fetch the posts to sync state
        fetchPosts(id, showAllPosts); 
    }
  };

  /**
   * @function handlePostUpdated
   * @desc Handles the update of a post object after the EditModal successfully returns.
   * @param {object} updatedPost - The full post object returned from the API.
   */
  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p._id === updatedPost._id ? updatedPost : p))
    );
    setToastMessage({ type: 'success', message: "Post updated successfully!" });
    // Close the edit modal now if it was open
    closeEditModal(); 
  };


  // Handler for Comment Count Update (re-fetch logic retained)
  const handleCommentCountUpdated = () => {
    // Since this is a minor update, we only re-fetch the post list to get the updated comment count.
    fetchPosts(id, showAllPosts); 
  };

  // Handlers for Modals
  const openCommentModal = (postData) => {
    setSelectedPost(postData);
    setShowCommentsModal(true);
  };
  
  const closeCommentModal = () => {
    setSelectedPost(null);
    setShowCommentsModal(false);
  };
  
  const openEditModal = (postData) => { 
    setSelectedPost(postData);
    setShowEditModal(true);
  };

  const closeEditModal = () => { 
    setSelectedPost(null);
    setShowEditModal(false);
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
    // Check if the logged-in user is the author
    const isAuthor = post.author?._id === loggedInUser?.id; 

    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-gray-800 mb-2 whitespace-pre-wrap">{post.content}</p>
        
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
            
            {/* EDIT BUTTON (Author Only) */}
            {isAuthor && (
                <button
                    onClick={() => openEditModal(post)}
                    className="flex items-center ml-auto text-gray-500 hover:text-violet-600 transition p-1 rounded-full hover:bg-gray-200"
                    title="Edit Post"
                >
                    <FiEdit2 className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>
    );
  };

  // --- Component for Pending Requests (Own Profile Only) ---
  const PendingRequestsSection = () => {
      // Check if we are viewing our own profile and if there are pending requests
      if (!profileUser.isOwnProfile || !profileUser.connectionRequests || profileUser.connectionRequests.length === 0) {
          return null;
      }
      
      const incomingRequestIds = profileUser.connectionRequests;
      
      return (
          <div className="mb-6 p-4 bg-white rounded-xl shadow border-2 border-yellow-200">
              <h2 className="text-xl font-semibold text-yellow-700 mb-4 flex items-center">
                  <FiUsers className="mr-2" /> 
                  Pending Connection Requests ({incomingRequestIds.length})
              </h2>
              
              <div className="space-y-3">
                  {incomingRequestIds.map(senderId => (
                      <div key={senderId} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700">
                              Request from User ID: <span className="font-mono text-xs bg-gray-200 px-1 rounded">{senderId}</span>
                          </p>
                          <button
                              onClick={() => handleAcceptRequest(senderId)}
                              className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-green-600 transition flex items-center"
                          >
                              <FiCheck className="mr-1 w-4 h-4" /> Accept
                          </button>
                      </div>
                  ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">
                  (Note: User details for requests are simplified in this view.)
              </p>
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
        
        {/* NEW: Pending Connection Requests (Only visible on OWN profile) */}
        <PendingRequestsSection />

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
            Activity ({showAllPosts ? 'All Posts' : 'Recent Posts'})
          </h2>
          {postError && (
              <p className="text-red-500 text-sm">{postError}</p>
          )}
          
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <ProfilePostItem key={post._id} post={post} />
              ))}
              
              {/* Toggle to see all posts */}
              <div className="text-center pt-2 border-t mt-4">
                 <button 
                    onClick={handleToggleShowAllPosts} 
                    className="text-violet-700 font-medium hover:underline text-sm"
                 >
                    {showAllPosts ? 'Hide Older Posts' : 'View All Activity'}
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
      
      {/* Edit Post Modal (NEW) */}
      {showEditModal && selectedPost && (
        <EditPostModal
          post={selectedPost}
          onClose={closeEditModal}
          onPostUpdated={handlePostUpdated}
        />
      )}
      
      {/* Toast Component */}
      {toastMessage && (
        <Toast 
          message={toastMessage.message} 
          type={toastMessage.type} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </Layout>
  );
}