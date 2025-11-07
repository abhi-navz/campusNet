import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiSearch, FiMessageSquare, FiUser, FiUsers, FiHome } from "react-icons/fi";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);



  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 shadow bg-white">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold flex items-center">
        <span className="text-violet-700">Campus</span>
        <span className="bg-violet-700 text-white px-1 ml-1">Net</span>
      </Link>

      {/* Search Bar */}
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

      {/* Navigation buttons */}
      <div className="flex items-center space-x-4">
        <Link
          to="/home"
          className="flex items-center px-4 py-2 rounded hover:bg-gray-100"
        >
          <FiHome className="mr-1" />
          Home
        </Link>

        <Link
          to="/messages"
          className="flex items-center px-4 py-2 rounded hover:bg-gray-100"
        >
          <FiMessageSquare className="mr-1" />
          Messages
        </Link>

        <Link
          to="/network"
          className="flex items-center px-4 py-2 rounded hover:bg-gray-100"
        >
          <FiUsers className="mr-1" />
          Network
        </Link>

        {/* If user is logged in */}
        {user ? (
          <>
            <Link
              to={`/profile/${user.id}`}
              className="flex items-center px-4 py-2 rounded hover:bg-gray-100"
            >
              <FiUser className="mr-1" />
              {user.fullName.split(" ")[0]}
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {/* If no user → show login/register */}
            <Link
              to="/login"
              className="px-4 py-2 rounded bg-violet-600 text-white hover:bg-violet-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
