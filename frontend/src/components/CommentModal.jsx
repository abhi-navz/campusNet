import { useState, useEffect, useCallback } from 'react';
import { FiX, FiSend, FiThumbsUp } from 'react-icons/fi';
import { timeAgo } from '../utils/timeAgo';

/**
 * @component CommentModal
 * @desc Displays a list of comments for a post and provides an input field for adding new comments.
 * @param {object} props
 * @param {object} props.post - The post object whose comments are being viewed.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onCommentCountUpdated - Callback to refresh the parent post's comment count.
 * @param {string} props.loggedInUserId - The ID of the currently authenticated user for like checks.
 */
export default function CommentModal({ post, onClose, onCommentCountUpdated, loggedInUserId }) {
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  /**
   * @function fetchComments
   * @desc Retrieves all comments for the current post from the backend.
   * @type {useCallback}
   */
  const fetchComments = useCallback(async () => {
    if (!post || !token) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/post/comments/${post._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setComments(data);
      } else {
        setError(data.message || 'Failed to fetch comments.');
      }
    } catch (err) {
      setError('Network error while fetching comments.');
      console.error('CommentModal: Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [post, token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /**
   * @function handleLikeComment
   * @desc Toggles the like status on a specific comment with optimistic UI update.
   * @param {string} commentId - The ID of the comment being liked.
   */
  const handleLikeComment = async (commentId) => {
    if (!token || !loggedInUserId) {
        alert("Authentication required to like comments.");
        return;
    }

    try {
        // --- OPTIMISTIC UI UPDATE ---
        setComments(prevComments => 
            prevComments.map(c => {
                if (c._id === commentId) {
                    const isLiked = c.likes.includes(loggedInUserId);
                    const newLikes = isLiked 
                        ? c.likes.filter(id => id !== loggedInUserId) // Remove like
                        : [...c.likes, loggedInUserId]; // Add like
                    
                    return { ...c, likes: newLikes };
                }
                return c;
            })
        );
        
        // --- API CALL ---
        const response = await fetch(`http://localhost:5000/post/comment/like/${commentId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            // Revert state if API fails
            fetchComments(); 
            const errorData = await response.json();
            console.error("Comment Like API failed:", errorData.message);
            setError("Failed to process like action. State reverted.");
        }
    } catch (err) {
        console.error("Network error during comment like:", err);
        setError("Network error during like action. State reverted.");
        fetchComments(); // Revert/re-fetch on network error
    }
  };


  /**
   * @function handleAddComment
   * @desc Submits a new comment to the backend and updates the local list.
   */
  const handleAddComment = async (e) => {
    e.preventDefault();
    setError(null);
    const content = newCommentContent.trim();

    if (!content) {
      setError('Comment cannot be empty.');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/post/comments/${post._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const newComment = await response.json();

      if (response.ok) {
        setNewCommentContent('');
        setComments(prev => [...prev, newComment]);
        onCommentCountUpdated(post._id);
      } else {
        setError(newComment.message || 'Failed to submit comment.');
      }
    } catch (err) {
      setError('Network error while submitting comment.');
      console.error('CommentModal: Error submitting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @component CommentItem
   * @desc Renders a single comment in the list, including the like button.
   * @param {object} comment - The comment object.
   */
  const CommentItem = ({ comment }) => {
    const isLiked = comment.likes?.includes(loggedInUserId);

    return (
        <div className="flex items-start mb-4 p-3 bg-gray-50 rounded-lg">
            <img
                src={comment.author?.profilePic || "https://placehold.co/30x30/9253ed/ffffff?text=U"}
                alt={comment.author?.fullName}
                className="w-8 h-8 rounded-full object-cover mr-3 border border-violet-300"
            />
            <div className="flex-1">
                <p className="font-semibold text-violet-700 text-sm">
                    {comment.author?.fullName || 'Deleted User'}
                    <span className="text-xs text-gray-500 font-normal ml-2">
                        {timeAgo(comment.createdAt)}
                    </span>
                </p>
                <p className="text-gray-800 text-sm whitespace-pre-wrap">{comment.content}</p>

                {/* LIKE ACTION BAR */}
                <div className="flex items-center mt-1 text-xs text-gray-500">
                    <button
                        onClick={() => handleLikeComment(comment._id)}
                        className={`flex items-center mr-3 font-medium transition 
                                    ${isLiked 
                                        ? 'text-violet-700' 
                                        : 'hover:text-violet-600'}`}
                    >
                        <FiThumbsUp className="mr-1 w-3 h-3" />
                        {isLiked ? 'Liked' : 'Like'}
                    </button>
                    
                    {/* Display total likes */}
                    <span className="text-gray-400">
                        {comment.likes?.length || 0} Likes
                    </span>
                    
                    {/* Placeholder for Reply button */}
                    <span className="ml-3 font-medium cursor-pointer hover:text-violet-600">
                        Reply
                    </span>
                </div>
            </div>
        </div>
    );
  };

  if (!post) return null;

  return (
    // Modal Overlay: Semi-transparent black overlay
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"> 
      
      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
          <h3 className="text-lg font-bold text-violet-700">Comments ({post.commentCount})</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Central Error Display */}
        {error && (
            <div className="p-3 bg-red-100 text-red-700 text-center text-sm border-b border-red-300">
                Error: {error}
            </div>
        )}

        {/* Comment List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && comments.length === 0 && <p className="text-center text-gray-500">Loading comments...</p>}
          
          {!loading && comments.length === 0 && !error && (
            <p className="text-center text-gray-500 italic p-4 border border-dashed rounded-lg">
              No comments yet. Be the first!
            </p>
          )}

          {/* List of Comments */}
          {comments.map(comment => (
            <CommentItem key={comment._id} comment={comment} /> 
          ))}
        </div>

        {/* Comment Input Area (Sticky to bottom) */}
        <div className="p-4 border-t sticky bottom-0 bg-white rounded-b-xl">
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input
              type="text"
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:border-violet-500"
              maxLength={300}
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-violet-700 text-white p-3 rounded-full hover:bg-violet-600 transition disabled:bg-gray-400"
              disabled={loading || newCommentContent.trim().length === 0}
            >
              <FiSend className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}