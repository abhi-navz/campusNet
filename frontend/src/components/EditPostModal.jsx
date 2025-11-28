import React, { useState } from 'react';
import { FiX, FiEdit3 } from 'react-icons/fi';

/**
 * @component EditPostModal
 * @desc Modal for editing an existing post's content.
 * @param {object} props
 * @param {object} props.post - The post object being edited.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onPostUpdated - Callback function to update the parent state with the new post data.
 */
export default function EditPostModal({ post, onClose, onPostUpdated }) {
  const [editedContent, setEditedContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const token = localStorage.getItem('token');
  const MAX_LENGTH = 800; // Match backend maximum length

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const content = editedContent.trim();

    if (!content) {
      setError("Post content cannot be empty.");
      return;
    }
    
    if (content.length > MAX_LENGTH) {
      setError(`Post content exceeds the maximum length of ${MAX_LENGTH} characters.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/post/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success: Update the parent component's state with the new post data
        onPostUpdated(data.post); 
        onClose(); // Close the modal
      } else {
        setError(data.message || 'Failed to update post.');
      }

    } catch (err) {
      setError("Network error. Could not connect to server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Modal Overlay
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 transition-opacity"
      onClick={handleOverlayClick}
    > 
      
      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
          <h3 className="text-lg font-bold text-violet-700 flex items-center">
            <FiEdit3 className="w-5 h-5 mr-2" />
            Edit Your Post
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body (Form) */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col flex-1">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 resize-none h-40 text-gray-800 flex-1"
              disabled={loading}
              maxLength={MAX_LENGTH}
            />
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {MAX_LENGTH - editedContent.length} characters remaining
              </span>
              <button
                type="submit"
                className="bg-violet-700 text-white px-4 py-2 rounded-full font-medium hover:bg-violet-600 transition disabled:bg-gray-400"
                disabled={loading || editedContent.trim().length === 0 || editedContent.length > MAX_LENGTH}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
        </form>

      </div>
    </div>
  );
}