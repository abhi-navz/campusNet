// frontend/src/pages/Network.jsx

import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiUser, FiCheck, FiUserPlus, FiRefreshCcw } from "react-icons/fi";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Toast from "../components/Toast"; 

export default function Network() {
  // State Management
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ course: "", year: "", location: "" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({}); 
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [myConnectionRequests, setMyConnectionRequests] = useState([]); // NEW

  // User data
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const loggedInUserId = loggedInUser?.id;
  const token = localStorage.getItem('token');
  
  // Filter options
  const COURSE_OPTIONS = ["B.Tech/B.E.", "B.A. Hons.", "B.Com Hons.", "M.Sc.", "Ph.D."];
  const YEAR_OPTIONS = [2024, 2023, 2022, 2021, 2020];
  

  useEffect(() => {
    const fetchMyRequests = async () => {
      if (!loggedInUserId || !token) return;
      
      try {
        const res = await fetch(`https://campusnet.onrender.com/user/${loggedInUserId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (res.ok) {
          const userData = await res.json();
          setMyConnectionRequests(userData.connectionRequests || []);
          console.log("Loaded my pending requests:", userData.connectionRequests?.length || 0);
        }
      } catch (err) {
        console.error("Error loading pending requests:", err);
      }
    };
    
    fetchMyRequests();
  }, [loggedInUserId, token]);
  
  
  const getSearchStatus = (targetUser) => {
    const userId = loggedInUserId;
    if (!userId) return 'Connect'; 

    const targetRequests = targetUser.connectionRequests || [];
    const targetConnections = targetUser.connections || [];
    
    // 1. Already Connected
    if (targetConnections.includes(userId)) {
      return 'Connected';
    }

    // 2. YOU sent THEM a request (Your ID in THEIR requests)
    if (targetRequests.includes(userId)) {
      return 'Request Sent';
    }

    // Default
    return 'Connect';
  };

  // ================================
  // SEARCH EXECUTION
  // ================================

  const executeSearch = useCallback(async () => {
    if (searchTrigger === 0) {
        setResults([]);
        return;
    }
    
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    
    if (query && query.trim()) {
      params.append('q', query.trim());
    }
    if (filters.course) {
      params.append('course', filters.course);
    }
    if (filters.year) {
      params.append('year', filters.year);
    }
    if (filters.location && filters.location.trim()) {
      params.append('location', filters.location.trim());
    }

    const url = `https://campusnet.onrender.com/user/search?${params.toString()}`;
    
    console.log("Searching:", url);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setResults(data);
        
        // Determine status for each user
        const initialStatus = data.reduce((acc, targetUser) => {
            const userId = loggedInUserId;
            
            // 1. Already connected?
            if (targetUser.connections?.includes(userId)) {
                acc[targetUser._id] = 'Connected';
                console.log(`${targetUser.fullName}: Connected`);
            }
            // 2. YOU sent THEM a request?
            else if (targetUser.connectionRequests?.includes(userId)) {
                acc[targetUser._id] = 'Request Sent';
                console.log(`${targetUser.fullName}: Request Sent`);
            }
            // 3. THEY sent YOU a request?
            else if (myConnectionRequests.includes(targetUser._id)) {
                acc[targetUser._id] = 'Request Received';
                console.log(`${targetUser.fullName}: Request Received`);
            }
            // 4. No connection yet
            else {
                acc[targetUser._id] = 'Connect';
                console.log(`${targetUser.fullName}: Can Connect`);
            }
            
            return acc;
        }, {});
        
        setConnectionStatus(initialStatus);
        console.log("Search complete:", data.length, "users");
      } else {
        setError(data.message || "Search failed.");
        setResults([]);
      }
    } catch (err) {
      setError("Network error. Check console.");
      console.error("Error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, filters, token, loggedInUserId, searchTrigger, myConnectionRequests]);

  useEffect(() => {
    if (loggedInUserId && token) {
        executeSearch(); 
    }
  }, [loggedInUserId, token, executeSearch, searchTrigger]); 
  

  const handleManualSearch = () => {
      setSearchTrigger(prev => prev + 1); 
      console.log("Search triggered");
  };
  
  const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
          handleManualSearch();
      }
  };
  
  const handleReset = () => {
      setFilters({ course: "", year: "", location: "" });
      setQuery("");
      setResults([]);
      setSearchTrigger(0);
      setError(null);
      console.log("Reset");
  };

  const handleConnectAction = async (targetId) => {
    if (!token) {
      setToast({ type: 'error', message: "Please log in to connect." });
      return;
    }

    // Optimistic update
    setConnectionStatus(prev => ({ ...prev, [targetId]: 'Request Sent' }));
    
    console.log(`📤 Sending request to: ${targetId}`);

    try {
      const res = await fetch(`https://campusnet.onrender.com/user/connect/${targetId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      
      if (res.ok) {
        setToast({ type: 'success', message: data.message });
        console.log("Request sent");
        
        // If auto-accepted, update to Connected
        if (data.message.includes("established")) {
          setConnectionStatus(prev => ({ ...prev, [targetId]: 'Connected' }));
          // Remove from myConnectionRequests if they sent us one
          setMyConnectionRequests(prev => prev.filter(id => id !== targetId));
        }
      } else {
        setToast({ type: 'error', message: data.message || "Failed." });
        setConnectionStatus(prev => ({ ...prev, [targetId]: 'Connect' }));
      }
    } catch (err) {
      setToast({ type: 'error', message: "Network error." });
      setConnectionStatus(prev => ({ ...prev, [targetId]: 'Connect' }));
      console.error(" Error:", err);
    }
  };
  
  const handleAccept = async (senderId) => {
    if (!token) return;
    
    // Optimistic update
    setConnectionStatus(prev => ({ ...prev, [senderId]: 'Connected' }));
    
    console.log(`Accepting request from: ${senderId}`);
    
    try {
      const res = await fetch(`https://campusnet.onrender.com/user/accept/${senderId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ type: 'success', message: data.message });
        
        // Remove from pending requests
        setMyConnectionRequests(prev => prev.filter(id => id !== senderId));
        
        console.log(" Accepted");
      } else {
        setToast({ type: 'error', message: data.message || "Failed." });
      }
    } catch (err) {
      setToast({ type: 'error', message: "Network error." });
      console.error(" Error:", err);
    }
  };

  
  const SearchFilters = () => (
    <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-100 rounded-xl">
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
      
      <input
        type="text"
        value={filters.location}
        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        placeholder="Filter by Location"
        className="p-2 border rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm w-full sm:w-auto"
      />
      
      <button 
        onClick={handleManualSearch} 
        className="p-2 bg-violet-700 text-white rounded-lg hover:bg-violet-600 transition flex items-center text-sm"
      >
        <FiSearch className="mr-1" /> Apply Filters
      </button>

      <button 
        onClick={handleReset} 
        className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center text-sm"
      >
        <FiRefreshCcw className="mr-1" /> Reset
      </button>
    </div>
  );
  
  const UserCard = ({ user }) => {
    const status = connectionStatus[user._id] || getSearchStatus(user);
    const isConnected = status === 'Connected';
    const isRequestSent = status === 'Request Sent';
    const isRequestReceived = status === 'Request Received';
    
    let button;
    
    if (isConnected) {
      button = (
        <button 
          disabled 
          className="bg-green-500 text-white px-4 py-2 rounded-full text-sm flex items-center opacity-75 cursor-not-allowed"
        >
          <FiCheck className="mr-1" /> Connected
        </button>
      );
    } else if (isRequestSent) {
       button = (
        <button 
          disabled 
          className="bg-gray-400 text-white px-4 py-2 rounded-full text-sm opacity-75 cursor-not-allowed"
        >
          Request Sent
        </button>
      );
    } else if (isRequestReceived) {
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
        <div className="flex items-start space-x-4 flex-1">
          <Link to={`/profile/${user._id}`}>
            <img 
              src={user.profilePic || "https://placehold.co/50x50/9253ed/ffffff?text=U"}
              alt={user.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-violet-300 shrink-0"
            />
          </Link>
          
          <div className="flex-1 min-w-0">
            <Link 
              to={`/profile/${user._id}`} 
              className="font-semibold text-lg text-violet-700 hover:underline block truncate"
            >
              {user.fullName}
            </Link>
            <p className="text-gray-600 text-sm truncate">
              {user.headline || "CampusNet Member"}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {user.course && `${user.course}`}
              {user.graduationYear && `, Grad ${user.graduationYear}`}
              {user.location && !user.course && !user.graduationYear && user.location}
            </p>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-0 sm:ml-4 shrink-0">
            {button}
        </div>
      </div>
    );
  };
  
  
  if (!loggedInUserId) {
    return (
      <Layout>
        <p className="text-center mt-20 text-red-500">
          Please login to access your network.
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <h1 className="text-3xl font-bold text-violet-700 mb-6">Explore CampusNet</h1>
        
        <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-violet-100">
            <div className="relative">
                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search by Name or Email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-lg"
                />
            </div>
        </div>

        <SearchFilters />

        <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {searchTrigger > 0 ? `Search Results (${results.length})` : "Ready to Search"}
            </h2>

            {error && (
              <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg border border-red-300 mb-4">
                {error}
              </div>
            )}
            
            {loading && (
              <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-700 mb-2"></div>
                <p>Searching...</p>
              </div>
            )}
            
            {!loading && results.length > 0 && (
                <div className="space-y-4">
                    {results.map(user => (
                        <UserCard key={user._id} user={user} />
                    ))}
                </div>
            )}
            
            {!loading && results.length === 0 && searchTrigger > 0 && (
                <div className="text-gray-500 italic p-8 bg-white rounded-xl shadow text-center">
                    <FiUser className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No users found matching your criteria.</p>
                    <p className="text-sm mt-2">Try adjusting your search or filters.</p>
                </div>
            )}
            
            {!loading && results.length === 0 && searchTrigger === 0 && (
                <div className="text-gray-500 p-8 bg-white rounded-xl shadow text-center">
                    <FiSearch className="w-12 h-12 mx-auto mb-3 text-violet-400" />
                    <p className="font-medium">Start Your Search</p>
                    <p className="text-sm mt-2">
                        Enter a name or apply filters, then click "Apply Filters" or press Enter.
                    </p>
                </div>
            )}
        </div>
        
      </div>
      
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