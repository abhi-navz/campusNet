import { useEffect, useState, useCallback, useRef } from "react"; 
import { Link, useLocation } from "react-router-dom"; 
// ADD FiShare2 and FiTrash2
import { FiThumbsUp, FiMessageSquare, FiShare2, FiTrash2 } from "react-icons/fi"; 
import Layout from "../components/Layout";
import CreatePost from "../components/CreatePost"; 
import CommentModal from "../components/CommentModal";
import Toast from "../components/Toast"; 
import DeleteConfirmationModal from "../components/DeleteConfirmationModal"; // <-- NEW IMPORT
import { timeAgo } from "../utils/timeAgo"; 

/**
 * @component Home
 * @desc The main feed component. Handles user state, feed fetching, post creation integration, and rendering posts.
 */
export default function Home() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [error, setError] = useState(null);

  // State for Modals
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // <-- NEW STATE
  const [selectedPost, setSelectedPost] = useState(null);
  
  // State for Toast Notifications
  const [toastMessage, setToastMessage] = useState(null); 

  // Ref for the CreatePost component (used to programmatically focus the input)
  const createPostRef = useRef(null); 
  const location = useLocation(); // Get current location (includes hash)

  // Initialize user state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- Effect to focus the input field when URL hash is present (from mobile + button) ---
  useEffect(() => {
    // Check if the URL hash matches the expected value and the ref is ready
    if (location.hash === '#create-post' && createPostRef.current) {
        // Trigger the exposed focusInput method
        createPostRef.current.focusInput();
    }
  }, [location.hash]); // Re-run this effect whenever the hash changes

  /**
   * @function fetchFeed
   * @desc Fetches the list of posts from the protected backend endpoint /post/feed.
   * @type {useCallback}
   */
  const fetchFeed = useCallback(async () => {
    setLoadingFeed(true);
    setError(null);
    const token = localStorage.getItem('token');

    if (!token) {
        setLoadingFeed(false);
        return;
    }

    try {
      const response = await fetch("http://localhost:5000/post/feed", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPosts(data); 
      } else {
        setError(data.message || "Failed to fetch feed data.");
        setPosts([]);
      }
    } catch (err) {
      setError("Network error. Could not connect to the API server.");
      console.error(err);
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  /**
   * @function handleLike
   * @desc Executes the protected API call to like or unlike a post, then updates local state immediately (Optimistic UI).
   * @param {string} postId - The ID of the post being liked.
   */
  const handleLike = async (postId) => {
    const token = localStorage.getItem('token');
    const userId = user.id;

    if (!token || !userId) {
        setToastMessage({ type: 'error', message: "Please log in to like posts." });
        return;
    }

    try {
        // --- OPTIMISTIC UI UPDATE ---
        setPosts(prevPosts => 
            prevPosts.map(p => {
                if (p._id === postId) {
                    const isLiked = p.likes.includes(userId);
                    const newLikes = isLiked 
                        ? p.likes.filter(id => id !== userId) // Remove like (unlike)
                        : [...p.likes, userId]; // Add like
                    
                    return { ...p, likes: newLikes };
                }
                return p;
            })
        );
        
        // --- API CALL ---
        const response = await fetch(`http://localhost:5000/post/like/${postId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Like API failed:", errorData.message);
            setToastMessage({ type: 'error', message: "Failed to process like action. State reverted." });
            fetchFeed(); // Re-fetch to restore correct state
        }
    } catch (err) {
        console.error("Network error during like action:", err);
        setToastMessage({ type: 'error', message: "Network error during like action. State reverted." });
        fetchFeed(); // Re-fetch to restore correct state
    }
  };
  
  /**
   * @function handleCommentCountUpdated
   * @desc Updates the local post object's comment count after a new comment is submitted.
   * @param {string} postId - The ID of the post to update.
   */
  const handleCommentCountUpdated = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(p => 
        p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
      )
    );
  };
  
  // --- Delete Modal Handlers ---

  /**
   * @function openDeleteModal
   * @desc Sets the post and opens the deletion confirmation modal.
   * @param {object} postData - The post object to be deleted.
   */
  const openDeleteModal = (postData) => {
    setSelectedPost(postData);
    setShowDeleteModal(true);
  };
  
  /**
   * @function closeDeleteModal
   * @desc Clears the selected post and closes the deletion modal.
   */
  const closeDeleteModal = () => {
    setSelectedPost(null);
    setShowDeleteModal(false);
  };

  /**
   * @function openCommentModal
   * @desc Sets the post and opens the comment modal.
   * @param {object} postData - The post object to display in the modal.
   */
  const openCommentModal = (postData) => {
    setSelectedPost(postData);
    setShowCommentsModal(true);
  };
  
  /**
   * @function closeCommentModal
   * @desc Clears the selected post and closes the comment modal.
   */
  const closeCommentModal = () => {
    setSelectedPost(null);
    setShowCommentsModal(false);
  };

  /**
   * @function handleDeletePost
   * @desc Handles post deletion. Triggered by modal confirmation.
   */
  const handleDeletePost = async () => {
    if (!selectedPost) return; // Should not happen if modal flow is correct

    const postId = selectedPost._id;
    const token = localStorage.getItem('token');
    
    // Close modal immediately after confirmation
    closeDeleteModal();

    // Optimistic UI: Remove post from the list immediately
    setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
    setToastMessage({ type: 'success', message: "Post deleting..." });

    try {
      const response = await fetch(`http://localhost:5000/post/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setToastMessage({ type: 'error', message: errorData.message || "Failed to delete post. State reverted." });
        fetchFeed(); 
      } else {
        setToastMessage({ type: 'success', message: "Post and associated comments deleted." });
      }
    } catch (err) {
      console.error("Network error during delete action:", err);
      setToastMessage({ type: 'error', message: "Network error. Could not delete post. State reverted." });
      fetchFeed(); // Re-fetch on network error
    }
  };
  
  /**
   * @function handleSharePost
   * @desc Placeholder for post sharing functionality (copies link to clipboard).
   */
  const handleSharePost = (post) => {
    const postUrl = `${window.location.origin}/post/${post._id}`; // Mock URL
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl)
        .then(() => setToastMessage({ type: 'success', message: "Post link copied to clipboard!" }))
        .catch(err => {
            console.error('Could not copy text: ', err);
            setToastMessage({ type: 'error', message: "Failed to copy link. Check console." });
        });
    } else {
      // Fallback: This path is rare but provided in case clipboard API fails.
      // We still cannot use window.alert/confirm/prompt.
      setToastMessage({ type: 'error', message: `Clipboard failed. URL: ${postUrl}` });
    }
  };


  // Trigger feed fetch when component mounts or user state is confirmed
  useEffect(() => {
    if (user) {
      fetchFeed();
    }
  }, [user, fetchFeed]);

  // Defensive check for unauthenticated access (should be blocked by AppRoutes)
  if (!user) {
    return (
      <Layout>
        <p className="text-gray-600 text-center mt-20">
          Authentication required to view feed.
        </p>
      </Layout>
    );
  }
  
  /**
   * @component PostItem
   * @desc Renders a single, beautifully styled post card in the feed.
   */
  const PostItem = ({ post }) => {
    // Check if the current user ID is present in the post's likes array
    const isLiked = post.likes.includes(user.id);
    // Check if current user is the author (using user.id)
    const isAuthor = post.author?._id === user.id; 

    return (
        <div className="bg-white shadow rounded-xl p-5 border border-gray-200">
        <div className="flex items-center mb-3">
            {/* Author Profile Picture */}
            <img 
            src={post.author?.profilePic || "https://placehold.co/40x40/7c3aed/ffffff?text=DU"}
            alt={post.author?.fullName}
            className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
            />
            <div>
            {/* Author Name - Linked to their profile page */}
            <Link 
                to={`/profile/${post.author?._id}`} 
                className="font-semibold text-violet-700 hover:underline transition"
            >
                {post.author?.fullName || 'Unknown User'}
            </Link>
            {/* Post Timestamp - Using imported timeAgo UTILITY */}
            <p className="text-xs text-gray-500">
                {timeAgo(post.createdAt)}
            </p>
            </div>
        </div>
        
        {/* Post Content */}
        <p className="text-gray-800 my-3 whitespace-pre-wrap">{post.content}</p>

        {/* Engagement metrics */}
        <div className="flex items-center text-sm text-gray-500 mt-2 border-t pt-2">
            {/* LIKE BUTTON */}
            <button 
                onClick={() => handleLike(post._id)}
                className={`flex items-center mr-4 p-1 rounded transition 
                            ${isLiked 
                                ? 'text-violet-700 font-bold bg-violet-100 hover:bg-violet-200' 
                                : 'text-gray-500 hover:text-violet-600 hover:bg-gray-100'}`}
            >
                <FiThumbsUp className="mr-1" />
                {isLiked ? 'Liked' : 'Like'} ({post.likes?.length || 0})
            </button>
            
            {/* COMMENTS BUTTON */}
            <button 
                onClick={() => openCommentModal(post)}
                className="flex items-center mr-4 p-1 cursor-pointer text-gray-500 hover:text-violet-600 hover:bg-gray-100 rounded transition"
            >
                <FiMessageSquare className="mr-1" />
                Comment ({post.commentCount || 0})
            </button>
            
            {/* SHARE BUTTON - NEW */}
            <button 
                onClick={() => handleSharePost(post)}
                className="flex items-center mr-4 p-1 cursor-pointer text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition"
            >
                <FiShare2 className="mr-1" />
                Share
            </button>

            {/* DELETE BUTTON - NEW (Author only, aligned to the right) */}
            {isAuthor && (
                <button 
                    // Changed handler to open the custom modal
                    onClick={() => openDeleteModal(post)} 
                    className="flex items-center p-1 cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition ml-auto"
                >
                    <FiTrash2 className="mr-1" />
                    Delete
                </button>
            )}
        </div>
        </div>
    );
  };


  return (
    <Layout>
      <div className="max-w-3xl mx-auto mt-8">
        

        {/* Post Creation Area: Pass the ref here */}
        <CreatePost ref={createPostRef} user={user} onPostCreated={fetchFeed} /> 

        {/* Feed Section Header */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Latest Posts</h2>

        {/* Loading and Error States */}
        {loadingFeed && (
            <p className="text-center text-gray-500 mt-10">Loading feed...</p>
        )}
        
        {error && (
            <p className="text-center text-red-500 mt-4 p-3 bg-red-100 rounded border border-red-300">{error}</p>
        )}

        {/* Empty Feed State */}
        {!loadingFeed && posts.length === 0 && !error && (
             <div className="text-center p-8 bg-white rounded-xl shadow-inner border border-dashed border-gray-300">
                <p className="text-gray-500">No posts yet. Be the first to share an update!</p>
             </div>
        )}

        {/* Post List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostItem key={post._id} post={post} /> 
          ))}
        </div>
      </div>
      
      {/* Comment Modal Component */}
      {showCommentsModal && selectedPost && user && (
        <CommentModal 
          post={selectedPost} 
          onClose={closeCommentModal} 
          onCommentCountUpdated={handleCommentCountUpdated} 
          loggedInUserId={user.id} 
        />
      )}

      {/* Delete Confirmation Modal (NEW) */}
      {showDeleteModal && selectedPost && (
        <DeleteConfirmationModal
          onClose={closeDeleteModal}
          onConfirm={handleDeletePost} // This function now handles API call
          postAuthor={selectedPost.author?.fullName || 'This Post'}
        />
      )}

      {/* Toast Notification */}
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