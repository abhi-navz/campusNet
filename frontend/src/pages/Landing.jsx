import { useState } from "react"; // <-- NEW: Import useState
import { Link } from "react-router-dom";
import LogoLink from "../components/LogoLink"; 
// Import Menu/X icons
import { FiMenu, FiLogIn, FiUserPlus, FiX, FiInfo } from "react-icons/fi"; // <-- UPDATED ICONS

export default function Landing() {
  // NEW: State to control the visibility of the mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to close the menu after a link is clicked
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // --- Mobile Menu Content Component ---
  const MobileMenuContent = () => (
    <div className="flex flex-col space-y-4 p-6 border-t border-gray-200">
      
      <Link 
        to="/about" 
        className="flex items-center p-3 rounded-xl hover:bg-violet-50 text-lg text-violet-700 font-medium transition"
        onClick={handleLinkClick}
      >
        <FiInfo className="mr-3 w-5 h-5" /> About CampusNet
      </Link>
      
      <Link 
        to="/login" 
        className="flex items-center p-3 rounded-xl hover:bg-violet-50 text-lg text-violet-700 font-medium transition"
        onClick={handleLinkClick}
      >
        <FiLogIn className="mr-3 w-5 h-5" /> Login
      </Link>
      
      <Link 
        to="/register" 
        className="flex items-center p-3 rounded-xl bg-violet-700 text-white hover:bg-violet-600 text-lg font-medium transition mt-4"
        onClick={handleLinkClick}
      >
        <FiUserPlus className="mr-3 w-5 h-5" /> Join Now
      </Link>
      
    </div>
  );
  // --- End Mobile Menu Content ---

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar - Fixed to top */}
      <header className="bg-white shadow fixed w-full top-0 z-50">
        <nav className="flex justify-between items-center px-4 sm:px-6 py-4">
          
          {/* Logo */}
          <LogoLink /> 

          {/* Desktop Links (Visible on sm and up) */}
          <div className="hidden sm:flex items-center gap-6">
            <Link
              to="/about"
              className="text-violet-700 font-medium hover:underline"
            >
              About CampusNet
            </Link>
            <Link
              to="/login"
              className="text-violet-700 font-medium hover:underline flex items-center"
            >
              <FiLogIn className="mr-1" /> Login
            </Link>
            <Link
              to="/register"
              className="bg-violet-700 text-white px-4 py-2 rounded-full font-medium hover:bg-violet-600 transition flex items-center"
            >
              <FiUserPlus className="mr-1" /> Join Now
            </Link>
          </div>

          {/* Mobile Hamburger Menu Toggle (Visible only below sm breakpoint) */}
          <div className="sm:hidden">
             <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 rounded-full hover:bg-gray-100 transition"
            >
              {isMenuOpen 
                ? <FiX className="w-6 h-6" /> 
                : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu Dropdown */}
        <div 
          className={`sm:hidden bg-white overflow-hidden transition-all duration-300 shadow-xl border-t border-gray-100
                    ${isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <MobileMenuContent />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-grow text-center px-4 pt-24">
        <h2 className="text-4xl font-bold text-violet-700 mb-4">
          Welcome to CampusNet
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl">
          A professional network for Delhi University students, alumni, and faculty.  
          Connect with peers, mentors, and opportunities — build lasting relationships that go beyond the classroom.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/register"
            className="bg-violet-700 text-white px-6 py-3 rounded-full font-medium hover:bg-violet-600 transition"
          >
            Join Now
          </Link>
          <div className="flex items-center gap-2 text-gray-700">
            <span>Already joined?</span>
            <Link
              to="/login"
              className="text-violet-700 font-medium hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}