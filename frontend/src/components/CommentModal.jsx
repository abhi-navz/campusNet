import { useState, useEffect, useCallback } from 'react';
import { FiX, FiSend, FiUser } from 'react-icons/fi';
import { timeAgo } from '../utils/timeAgo';

/**
 * @component CommentModal
 * @desc Displays a list of comments for a post and provides an input field for adding new comments.
 * @param {object} props
 * @param {object} props.post - The post object whose comments are being viewed.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onCommentCountUpdated - Callback to refresh the parent post's comment count.
 */
export default function CommentModal({ post, onClose, onCommentCountUpdated }) {
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // <-- Combined error state

  const token = localStorage.getItem('token');

  /**
   * @function fetchComments
   * @desc Retrieves all comments for the current post from the backend.
   * @type {useCallback}
   */
  const fetchComments = useCallback(async () => {
    if (!post || !token) return;

    setLoading(true);
    setError(null); // Clear errors before fetching
    
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
   * @function handleAddComment
   * @desc Submits a new comment to the backend and updates the local list.
   */
  const handleAddComment = async (e) => {
    e.preventDefault();
    setError(null); // Clear errors before submission
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
        setNewCommentContent(''); // Clear input
        setComments(prev => [...prev, newComment]); // Add new comment to the list
        onCommentCountUpdated(post._id); // Notify Home.jsx to update post count
      } else {
        setError(newComment.message || 'Failed to submit comment.'); // Set error if API fails
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
   * @desc Renders a single comment in the list.
   * @param {object} comment - The comment object.
   */
  const CommentItem = ({ comment }) => (
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
      </div>
    </div>
  );

  if (!post) return null;

  return (
    // Modal Overlay
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