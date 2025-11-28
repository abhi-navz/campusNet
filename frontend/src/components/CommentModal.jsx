import { useState, useEffect, useCallback } from 'react';
import { FiX, FiSend, FiThumbsUp, FiTrash2 } from 'react-icons/fi'; // <-- ADD FiTrash2
import { timeAgo } from '../utils/timeAgo';

/**
 * @component CommentModal
 * @desc Displays a list of comments for a post and provides an input field for adding new comments.
 * @param {object} props
 * @param {object} props.post - The post object whose comments are being viewed.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onCommentCountUpdated - Callback to refresh the parent post's comment count.
 * @param {string} props.loggedInUserId - The ID of the currently authenticated user for like/delete checks.
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
   */
  const handleLikeComment = async (commentId) => {
    if (!token || !loggedInUserId) {
        // Using toast for non-alert feedback
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
   * @function handleDeleteComment
   * @desc Handles comment deletion.
   * @param {string} commentId - The ID of the comment to delete.
   */
  const handleDeleteComment = async (commentId) => {
    if (!token) return;
    
    // Optimistic Update: Remove comment locally
    setComments(prevComments => prevComments.filter(c => c._id !== commentId));
    
    // Also locally decrement parent post count (will be corrected on re-fetch if API fails)
    onCommentCountUpdated(post._id, -1); 

    try {
      const response = await fetch(`http://localhost:5000/post/comment/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        // Revert state and re-fetch if deletion failed
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete comment. Reverting state.");
        fetchComments();
        onCommentCountUpdated(post._id, 1); // Revert post count change
      }
      
    } catch (err) {
      console.error("Network error during comment deletion:", err);
      setError("Network error during comment deletion. Reverting state.");
      fetchComments(); // Revert/re-fetch on network error
      onCommentCountUpdated(post._id, 1); // Revert post count change
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
        onCommentCountUpdated(post._id, 1); // Pass explicit increment for cleaner logic
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
   * @desc Renders a single comment in the list, including the like and delete button.
   */
  const CommentItem = ({ comment }) => {
    const isLiked = comment.likes?.includes(loggedInUserId);
    // NEW: Check if the current user is the author of this comment
    const isAuthor = comment.author?._id === loggedInUserId; 

    const [isDeleting, setIsDeleting] = useState(false);

    const handleInitialDeleteClick = () => {
        setIsDeleting(true);
        // Automatically hide the confirm buttons after a short delay if no action is taken
        setTimeout(() => setIsDeleting(false), 5000); 
    };

    const handleConfirmDelete = () => {
        setIsDeleting(false); // Hide the buttons
        handleDeleteComment(comment._id);
    };

    return (
        <div className="flex items-start mb-4 p-3 bg-gray-50 rounded-lg relative">
            <img
                src={comment.author?.profilePic || "https://placehold.co/30x30/9253ed/ffffff?text=U"}
                alt={comment.author?.fullName}
                className="w-8 h-8 rounded-full object-cover mr-3 border border-violet-300 shrink-0"
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
                <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                    <button
                        onClick={() => handleLikeComment(comment._id)}
                        className={`flex items-center font-medium transition 
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
                    
                    {/* Delete Option (Author Only) */}
                    {isAuthor && (
                        <div className="ml-3">
                        {isDeleting ? (
                            // Confirmation Buttons
                            <div className="flex space-x-2 bg-red-100 p-1 rounded-md">
                                <span className="text-red-700 font-medium">Confirm?</span>
                                <button 
                                    onClick={handleConfirmDelete}
                                    className="text-white bg-red-600 px-2 rounded hover:bg-red-700 transition"
                                >
                                    Yes
                                </button>
                                <button 
                                    onClick={() => setIsDeleting(false)}
                                    className="text-red-600 bg-white border border-red-300 px-2 rounded hover:bg-red-50 transition"
                                >
                                    No
                                </button>
                            </div>
                        ) : (
                            // Initial Delete Button
                            <button
                                onClick={handleInitialDeleteClick}
                                className="flex items-center text-gray-500 hover:text-red-600 transition"
                            >
                                <FiTrash2 className="mr-1 w-3 h-3" />
                                Delete
                            </button>
                        )}
                        </div>
                    )}
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