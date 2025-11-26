import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FiSearch,
  FiMessageSquare,
  FiUser,
  FiUsers,
  FiHome,
  FiMenu,
  FiX,
  FiBell,
  FiPlus
} from "react-icons/fi";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    setIsMenuOpen(false); 
  };

  // Logic to determine logo destination
  const token = localStorage.getItem("token");
  const logoPath = token ? "/home" : "/";
  
  // Logic for profile link
  const profileLink = user ? `/profile/${user.id}` : "/login";

  // --- Mobile Hamburger/Side Menu Content ---
  const MobileMenuContent = () => (
    <div className="flex flex-col space-y-4 p-4 border-t">
      {/* Search Bar is still inside the menu for better screen real estate */}
      <div className="mb-4">
        <div className="relative">
          <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search CampusNet..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            onClick={() => setIsMenuOpen(false)} // Close menu after search interaction
          />
        </div>
      </div>

      {/* Primary Links (kept here for redundancy/logged-out experience) */}
      <Link to="/home" className="flex items-center p-2 rounded hover:bg-gray-200 text-lg" onClick={() => setIsMenuOpen(false)}>
        <FiHome className="mr-3" /> Home
      </Link>
      <Link to="/network" className="flex items-center p-2 rounded hover:bg-gray-200 text-lg" onClick={() => setIsMenuOpen(false)}>
        <FiUsers className="mr-3" /> Network
      </Link>

      {/* User Actions (Logout, Auth Links) - Always kept in the hamburger menu */}
      {user ? (
        <button
          onClick={handleLogout}
          className="p-2 rounded bg-red-500 text-white hover:bg-red-600 mt-4 text-lg"
        >
          Logout
        </button>
      ) : (
        <>
          <Link to="/login" className="p-2 rounded bg-violet-600 text-white hover:bg-violet-700 text-lg">
            Login
          </Link>
          <Link to="/register" className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-lg">
            Register
          </Link>
        </>
      )}
    </div>
  );

  return (
    <>
      <header className="w-full shadow bg-white fixed top-0 z-50">
        {/* --- TOP BAR (Visible on all sizes) --- */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          
          {/* Logo */}
          <Link to={logoPath} className="text-2xl font-bold flex items-center shrink-0">
            <span className="text-violet-700">Campus</span>
            <span className="bg-violet-700 text-white px-1 ml-1 rounded">Net</span>
          </Link>

          {/* Desktop Search Bar & Navigation (Visible ONLY on Desktop) */}
          <div className="hidden sm:flex items-center flex-1 space-x-4">
            {/* Desktop Search Bar */}
            <div className="flex-1 mx-6">
              <div className="relative">
                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Desktop Navigation Links */}
            <Link to="/home" className="flex items-center p-2 rounded hover:bg-gray-100"><FiHome className="mr-1" /> Home</Link>
            <Link to="/messages" className="flex items-center p-2 rounded hover:bg-gray-100"><FiMessageSquare className="mr-1" /> Messages</Link>
            <Link to="/network" className="flex items-center p-2 rounded hover:bg-gray-100"><FiUsers className="mr-1" /> Network</Link>
            <Link to="/notifications" className="flex items-center p-2 rounded hover:bg-gray-100"><FiBell className="mr-1" /> Notif.</Link>
            
            {/* Profile Link (Desktop) */}
            {user && (
              <Link to={profileLink} className="flex items-center px-4 py-2 rounded bg-violet-600 text-white hover:bg-violet-700">
                <FiUser className="mr-1" /> {user.fullName.split(" ")[0]}
              </Link>
            )}
            
            {/* Auth/Logout Buttons (Desktop) */}
            {user ? (
              <button onClick={handleLogout} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">
                Logout
              </button>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="px-4 py-2 rounded bg-violet-600 text-white hover:bg-violet-700">Login</Link>
                <Link to="/register" className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Register</Link>
              </div>
            )}
          </div>

          {/* --- MOBILE ICONS (Visible ONLY on Mobile) --- */}
          <div className="sm:hidden flex items-center space-x-3">
            
            {/* Mobile Profile Icon (Small Circle) - Linked to Profile */}
            {user && (
              <Link to={profileLink} onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center border border-violet-500">
                  <FiUser className="w-5 h-5 text-violet-700" />
              </Link>
            )}

            {/* Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 rounded-full hover:bg-gray-100 transition"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU/SIDE DRAWER --- */}
        <div 
          className={`sm:hidden bg-white overflow-hidden transition-all duration-300 shadow-xl 
                    ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <MobileMenuContent />
        </div>
      </header>

      {/* --- MOBILE BOTTOM NAVIGATION BAR (Fixed Bottom, Logged In Only) --- */}
      {user && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-2xl border-t border-gray-200 z-50 sm:hidden">
            <div className="flex justify-around items-center h-14">
                
                {/* Home */}
                <Link to="/home" className="flex flex-col items-center justify-center text-xs text-violet-700 hover:text-violet-900 transition">
                    <FiHome className="w-6 h-6" />
                    <span>Home</span>
                </Link>

                {/* Network */}
                <Link to="/network" className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-violet-700 transition">
                    <FiUsers className="w-6 h-6" />
                    <span>Network</span>
                </Link>

                {/* Post/Add Button (Center Action) - USES HASH TO TRIGGER FOCUS IN Home.jsx */}
                <Link to="/home#create-post" className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-violet-700 text-white shadow-lg hover:bg-violet-800 transition transform hover:scale-105">
                    <FiPlus className="w-5 h-5" />
                </Link>
                
                {/* Messages */}
                <Link to="/messages" className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-violet-700 transition">
                    <FiMessageSquare className="w-6 h-6" />
                    <span>Messages</span>
                </Link>

                {/* Notifications */}
                <Link to="/notifications" className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-violet-700 transition">
                    <FiBell className="w-6 h-6" />
                    <span>Notif.</span>
                </Link>
            </div>
        </div>
      )}
    </>
  );
}