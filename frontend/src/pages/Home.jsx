import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom"; // Needed for linking author to their profile
import Layout from "../components/Layout";
import CreatePost from "../components/CreatePost"; 
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
   * @type {useCallback} - Memoized to prevent unnecessary re-creations.
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
          'Authorization': `Bearer ${token}`, // Send JWT for authorization
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPosts(data); 
      } else {
        // Handle error response from API
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
  const PostItem = ({ post }) => (
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
          {/* Post Timestamp: using timeAgo utility */}
          <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
        </div>
      </div>
      
      {/* Post Content */}
      <p className="text-gray-800 my-3 whitespace-pre-wrap">{post.content}</p>

      {/* Engagement metrics placeholder */}
      <div className="flex items-center text-sm text-gray-500 mt-2 border-t pt-2">
        <span className="mr-4 cursor-pointer hover:text-violet-600 transition">
            👍 {post.likes?.length || 0} Likes
        </span>
        <span className="cursor-pointer hover:text-violet-600 transition">
            💬 {post.commentCount || 0} Comments
        </span>
      </div>
    </div>
  );


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
    </Layout>
  );
}