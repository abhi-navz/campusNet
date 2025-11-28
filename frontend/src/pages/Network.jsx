import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiUser, FiSend, FiCheck, FiX, FiRefreshCcw, FiUsers, FiUserPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Toast from "../components/Toast"; 

/**
 * @component Network
 * @desc Allows the user to search for and connect with other CampusNet members.
 * Also handles displaying and accepting incoming connection requests.
 */
export default function Network() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ course: "", year: "", location: "" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({}); // Stores dynamic button state per user ID

  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const loggedInUserId = loggedInUser?.id;
  const token = localStorage.getItem('token');
  
  // Hardcoded options for filtering
  const COURSE_OPTIONS = ["B.Tech/B.E.", "B.A. Hons.", "B.Com Hons.", "M.Sc.", "Ph.D."];
  const YEAR_OPTIONS = [2024, 2023, 2022, 2021, 2020];
  
  // --- UTILITY ---
  
  /**
   * @function getSearchStatus
   * @desc Determines the current state of the connection button for a target user based on current search result data.
   */
  const getSearchStatus = (targetUser) => {
    const userId = loggedInUserId;
    if (!userId) return 'Connect'; 

    const targetRequests = targetUser.connectionRequests || [];
    const targetConnections = targetUser.connections || [];
    
    // 1. Already Connected
    if (targetConnections.includes(userId)) {
      return 'Connected';
    }

    // 2. Request Pending FROM ME (My ID is in their requests list)
    if (targetRequests.includes(userId)) {
      return 'Request Sent';
    }
    
    // 3. Request Pending TO ME (Their ID is in MY requests list). 
    // We rely on the search results including the current user's connection status for this.
    // For now, we only handle the sender and connected states accurately.

    // Default: Can send a request
    return 'Connect';
  };

  // --- API FETCH FUNCTIONS ---

  /**
   * @function handleSearch
   * @desc Executes the user search API call with filters.
   */
  const handleSearch = useCallback(async () => {
    // Only search if there's a general query or a filter applied
    if (!query && !filters.course && !filters.year && !filters.location) {
        setResults([]);
        return;
    }
    
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
        q: query,
        course: filters.course,
        year: filters.year,
        location: filters.location
    });

    const url = `http://localhost:5000/user/search?${params.toString()}`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setResults(data);
        // Reset connection status map based on new results
        const initialStatus = data.reduce((acc, user) => {
            // Check if the current user has a pending request from this user (the search result user)
            const hasIncomingRequest = user.connectionRequests?.includes(loggedInUserId);
            
            if (hasIncomingRequest) {
                 acc[user._id] = 'Request Received';
            } else {
                 acc[user._id] = getSearchStatus(user);
            }
            return acc;
        }, {});
        setConnectionStatus(initialStatus);
      } else {
        setError(data.message || "Search failed.");
        setResults([]);
      }
    } catch (err) {
      setError("Network error during search.");
      console.error("Network Error:", err);
    } finally {
      setLoading(false);
    }
  }, [query, filters, token, loggedInUserId]);
  
  // Initial load or query change triggers search
  useEffect(() => {
    if (loggedInUserId && token) {
        // Initial call to show some suggestions or immediately perform search if query is set
        handleSearch(); 
    }
  }, [loggedInUserId, token, handleSearch]); 
  
  // --- CONNECTION MANAGEMENT FUNCTIONS ---

  /**
   * @function handleConnectAction
   * @desc Sends a connection request to the target user.
   */
  const handleConnectAction = async (targetId) => {
    if (!token) return;

    // Optimistic UI update: Set status to "Request Sent" immediately
    setConnectionStatus(prev => ({ ...prev, [targetId]: 'Request Sent' }));
    
    try {
      const res = await fetch(`http://localhost:5000/user/connect/${targetId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      
      if (res.ok) {
        setToast({ type: 'success', message: data.message });
      } else {
        setToast({ type: 'error', message: data.message || "Failed to send request." });
        // Revert optimistic state on failure
        setConnectionStatus(prev => ({ ...prev, [targetId]: 'Connect' })); 
      }
      
      handleSearch(); // Refresh search results to update status indicators

    } catch (err) {
      setToast({ type: 'error', message: "Network error: Could not send request." });
      setConnectionStatus(prev => ({ ...prev, [targetId]: 'Connect' }));
    }
  };
  
  /**
   * @function handleAccept
   * @desc Accepts an incoming connection request.
   */
  const handleAccept = async (senderId) => {
    if (!token) return;
    
    setConnectionStatus(prev => ({ ...prev, [senderId]: 'Connected' })); // Optimistic UI
    
    try {
        const res = await fetch(`http://localhost:5000/user/accept/${senderId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
            setToast({ type: 'success', message: data.message });
            // Update local user data if needed (e.g., connection count, though re-search handles it)
        } else {
            setToast({ type: 'error', message: data.message || "Failed to accept connection." });
        }

        handleSearch(); // Refresh search results to update the list

    } catch (err) {
        setToast({ type: 'error', message: "Network error while accepting request." });
        handleSearch();
    }
  };

  // --- RENDER COMPONENTS ---

  /**
   * @component SearchFilters
   * @desc Dropdown menus for filtering search results.
   */
  const SearchFilters = () => (
    <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-100 rounded-xl">
      
      {/* Course Filter */}
      <select
        value={filters.course}
        onChange={(e) => setFilters({ ...filters, course: e.target.value })}
        className="p-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm"
      >
        <option value="">Filter by Course</option>
        {COURSE_OPTIONS.map(course => (
            <option key={course} value={course}>{course}</option>
        ))}
      </select>

      {/* Graduation Year Filter */}
      <select
        value={filters.year}
        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
        className="p-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm"
      >
        <option value="">Filter by Grad Year</option>
        {YEAR_OPTIONS.map(year => (
            <option key={year} value={year}>{year}</option>
        ))}
      </select>
      
      {/* Location Filter (Text Input) */}
      <input
        type="text"
        value={filters.location}
        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        placeholder="Filter by Location"
        className="p-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm w-full sm:w-auto"
      />
      
      <button 
        onClick={handleSearch} 
        className="p-2 bg-violet-700 text-white rounded-lg hover:bg-violet-600 transition flex items-center text-sm"
      >
        <FiSearch className="mr-1" /> Apply Filters
      </button>

      <button 
        onClick={() => {setFilters({ course: "", year: "", location: "" }); setQuery(""); handleSearch();}} 
        className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center text-sm"
      >
        <FiRefreshCcw className="mr-1" /> Reset
      </button>
    </div>
  );
  
  /**
   * @component UserCard
   * @desc Displays a user profile snippet with connection action buttons.
   */
  const UserCard = ({ user }) => {
    // Determine the current button state, prioritized by local state
    const status = connectionStatus[user._id];
    const isConnected = user.connections?.includes(loggedInUserId);
    const isRequestSent = status === 'Request Sent';
    const isRequestReceived = status === 'Request Received';
    
    let button;
    
    if (isConnected) {
      button = (
        <button disabled className="bg-green-500 text-white px-4 py-2 rounded-full text-sm flex items-center opacity-75">
          <FiCheck className="mr-1" /> Connected
        </button>
      );
    } else if (isRequestSent) {
       button = (
        <button disabled className="bg-gray-400 text-white px-4 py-2 rounded-full text-sm opacity-75">
          Request Sent
        </button>
      );
    } else if (isRequestReceived) {
        // This is the primary incoming request handler
        button = (
            <button 
                onClick={() => handleAccept(user._id)}
                className="bg-violet-700 text-white px-4 py-2 rounded-full text-sm hover:bg-violet-600 transition flex items-center"
            >
                <FiUserPlus className="mr-1" /> Accept Request
            </button>
        );
    } else {
      button = (
        <button
          onClick={() => handleConnectAction(user._id)}
          className="border border-violet-700 text-violet-700 px-4 py-2 rounded-full text-sm hover:bg-violet-50 transition flex items-center"
        >
          <FiUserPlus className="mr-1" /> Connect
        </button>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-start space-x-4">
          {/* Profile Pic */}
          <Link to={`/profile/${user._id}`}>
            <img 
              src={user.profilePic || "https://placehold.co/50x50/e0e0f0/333333?text=U"}
              alt={user.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-violet-300 shrink-0"
            />
          </Link>
          
          {/* User Info */}
          <div>
            <Link to={`/profile/${user._id}`} className="font-semibold text-lg text-violet-700 hover:underline">
              {user.fullName}
            </Link>
            <p className="text-gray-600 text-sm">{user.headline || "CampusNet Member"}</p>
            <p className="text-gray-500 text-xs mt-1">
              {user.course ? `${user.course}, ` : ''} 
              {user.graduationYear ? `Grad ${user.graduationYear}` : user.location}
            </p>
          </div>
        </div>
        
        {/* Connection Action Button */}
        <div className="mt-3 sm:mt-0">
            {button}
        </div>
      </div>
    );
  };
  
  // --- MAIN RENDER ---
  
  if (!loggedInUserId) {
    return <Layout><p className="text-center mt-20 text-red-500">Please login to access your network.</p></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-violet-700 mb-6">Explore CampusNet</h1>
        
        {/* Search Input */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-violet-100">
            <div className="relative">
                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    placeholder="Search by Name or Email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-lg"
                />
            </div>
        </div>

        {/* Search Filters */}
        <SearchFilters />

        {/* --- SEARCH RESULTS --- */}
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
                {query || filters.course || filters.year || filters.location ? `Search Results (${results.length})` : "Suggested Connections"}
            </h2>

            {error && <p className="text-red-500 text-center p-3 bg-red-100 rounded">{error}</p>}
            {loading && <p className="text-center text-gray-500 p-4 bg-white rounded-xl shadow">Searching...</p>}
            
            {!loading && results.length > 0 && (
                <div className="space-y-4">
                    {results.map(user => (
                        <UserCard key={user._id} user={user} />
                    ))}
                </div>
            )}
            {!loading && results.length === 0 && (
                <p className="text-gray-500 italic p-4 bg-white rounded-xl shadow">
                    {query || filters.course || filters.year || filters.location 
                        ? `No users found matching your criteria.`
                        : "Enter a name or filter criteria to find users."
                    }
                </p>
            )}
        </div>
        
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
        />
      )}
    </Layout>
  );
}