import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom"; 
import { FiThumbsUp, FiMessageSquare } from "react-icons/fi"; 
import Layout from "../components/Layout";
import CreatePost from "../components/CreatePost"; 
import CommentModal from "../components/CommentModal";
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

  // State for Comment Modal
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Initialize user state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
        alert("Please log in to interact with posts.");
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
            alert("Failed to process like action. Please try again.");
            fetchFeed(); // Re-fetch to restore correct state
        }
    } catch (err) {
        console.error("Network error during like action:", err);
        alert("Network error during like action. Please try again.");
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
  
  /**
   * @function openCommentModal
   * @desc Sets the post and opens the modal.
   * @param {object} postData - The post object to display in the modal.
   */
  const openCommentModal = (postData) => {
    setSelectedPost(postData);
    setShowCommentsModal(true);
  };
  
  /**
   * @function closeCommentModal
   * @desc Clears the selected post and closes the modal.
   */
  const closeCommentModal = () => {
    setSelectedPost(null);
    setShowCommentsModal(false);
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
   * @param {object} props.post - The post object containing likes and author data.
   */
  const PostItem = ({ post }) => {
    // Check if the current user ID is present in the post's likes array
    const isLiked = post.likes.includes(user.id);

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
            {/* LIKE BUTTON - Dynamic styling and logic */}
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
            
            {/* COMMENTS BUTTON - Opens the modal */}
            <button 
                onClick={() => openCommentModal(post)}
                className="flex items-center p-1 cursor-pointer text-gray-500 hover:text-violet-600 hover:bg-gray-100 rounded transition"
            >
                <FiMessageSquare className="mr-1" />
                {post.commentCount || 0} Comments
            </button>
        </div>
        </div>
    );
  };


  return (
    <Layout>
      <div className="max-w-3xl mx-auto mt-8">
        

        {/* Post Creation Area: onPostCreated triggers a feed refresh */}
        <CreatePost user={user} onPostCreated={fetchFeed} />

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
    </Layout>
  );
}