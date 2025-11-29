import { useState, forwardRef, useRef, useImperativeHandle } from 'react';

/**
 * @component CreatePost
 * @desc A form component for authenticated users to submit new posts to the feed.
 * @param {object} props
 * @param {object} props.user - The currently logged-in user object.
 * @param {function} props.onPostCreated - Callback to refresh the parent's feed state.
 */
const CreatePost = forwardRef(({ user, onPostCreated }, ref) => { // <-- Use forwardRef
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const textareaRef = useRef(null); // <-- Ref for the textarea element

  // Expose a function to the parent component (Home.jsx) to trigger focus
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      // Use requestAnimationFrame to ensure the scroll anchor fires first
      requestAnimationFrame(() => {
        textareaRef.current.focus();
      });
    }
  }));

  const handleSubmit = async (e) => {
// ... (handleSubmit function body is unchanged) ...
    e.preventDefault();
    if (!content.trim()) {
      setError("Post content cannot be empty.");
      return;
    }
    
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
        setError("Authorization token missing. Please relog.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch('https://campusnet.onrender.com/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (response.ok) {
        setContent(''); // Clear the input field
        if (onPostCreated) {
            onPostCreated(); // Tell the parent component (Home) to refresh
        }
      } else {
        setError(data.message || 'Failed to create post.');
      }

    } catch (err) {
      setError("Network error. Could not connect to server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="create-post-container" className="bg-white p-4 rounded-xl shadow-lg mb-6 border border-violet-200">
      <div className="flex items-start mb-3">
        {/* Author information display */}
        <img 
          src={user?.profilePic || "https://placehold.co/40x40/7c3aed/ffffff?text=DU"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover mr-3 border border-violet-400"
        />
        <p className="text-gray-700 font-semibold pt-1">{user?.fullName.split(' ')[0]}, what's on your mind?</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef} // <-- ATTACH REF HERE
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
});

export default CreatePost; 