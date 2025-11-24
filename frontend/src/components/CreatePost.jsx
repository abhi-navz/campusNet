import { useState } from 'react';

/**
 * @component CreatePost
 * @desc A form component for authenticated users to submit new posts to the feed.
 * @param {object} props
 * @param {object} props.user - The currently logged-in user object (for display).
 * @param {function} props.onPostCreated - Callback to refresh the parent's feed state upon success.
 */
export default function CreatePost({ user, onPostCreated }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * @function handleSubmit
   * @desc Submits the post content to the protected backend endpoint /post.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!content.trim()) {
      setError("Post content cannot be empty.");
      return;
    }
    
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
        // Defensive check, as this component should only be rendered if authenticated
        setError("Authorization token missing. Please relog.");
        setLoading(false);
        return;
    }

    try {
      // Send data to the protected POST /post endpoint with the JWT in the header
      const response = await fetch('http://localhost:5000/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (response.ok) {
        setContent(''); // Clear the input field upon successful post
        // Trigger feed refresh in the parent component
        if (onPostCreated) {
            onPostCreated(); 
        }
      } else {
        setError(data.message || 'Failed to create post. Check console for details.');
      }

    } catch (err) {
      setError("Network error. Could not connect to server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg mb-6 border border-violet-200">
      <div className="flex items-start mb-3">
        {/* Author information display with placeholder image */}
        <img 
          src={user?.profilePic || "https://placehold.co/40x40/7c3aed/ffffff?text=DU"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover mr-3 border border-violet-400"
        />
        <p className="text-gray-700 font-semibold pt-1">What's new, {user?.fullName.split(' ')[0]}?</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an update, announcement, or question with CampusNet..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 resize-none h-20"
          disabled={loading}
          maxLength={500} 
        />
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-gray-500">
            {/* Character counter */}
            {500 - content.length} characters remaining
          </span>
          <button
            type="submit"
            className="bg-violet-700 text-white px-4 py-2 rounded-full font-medium hover:bg-violet-600 transition disabled:bg-gray-400"
            disabled={loading || content.trim().length === 0}
          >
            {loading ? 'Posting...' : 'Post Update'}
          </button>
        </div>
      </form>
    </div>
  );
}