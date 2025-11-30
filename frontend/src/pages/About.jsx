import { Link, useNavigate } from "react-router-dom"; 
import { useState } from "react"; // <-- NEW: Import useState
import { FiMenu, FiLogIn, FiUserPlus, FiX, FiInfo } from "react-icons/fi"; // <-- NEW: Import Icons
import LogoLink from "../components/LogoLink"; 

export default function About() {
  const navigate = useNavigate();
  
  // NEW: State to control the visibility of the mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to navigate to the Landing page and trigger the Login/Register modal via URL state
  const handleAuthRedirect = (modalType) => {
    // Navigate to the landing page and pass the intended modal type as state
    navigate("/", { state: { openModal: modalType } });
    setIsMenuOpen(false); // Close menu after action
  };
  
  // --- Mobile Menu Content Component (Similar to Landing.jsx) ---
  const MobileMenuContent = () => (
    <div className="flex flex-col space-y-4 p-6 border-t border-gray-200">
      
      <Link 
        to="/about" // Link to self for consistency (will be active/current page)
        className="flex items-center p-3 rounded-xl bg-violet-50 text-lg text-violet-700 font-medium transition"
        onClick={() => setIsMenuOpen(false)}
      >
        <FiInfo className="mr-3 w-5 h-5" /> About CampusNet
      </Link>
      
      <button 
        onClick={() => handleAuthRedirect('login')} 
        className="flex items-center p-3 rounded-xl hover:bg-violet-50 text-lg text-violet-700 font-medium transition w-full justify-start"
      >
        <FiLogIn className="mr-3 w-5 h-5" /> Login
      </button>
      
      <button 
        onClick={() => handleAuthRedirect('register')} 
        className="flex items-center p-3 rounded-xl bg-violet-700 text-white hover:bg-violet-600 text-lg font-medium transition mt-4 w-full justify-start"
      >
        <FiUserPlus className="mr-3 w-5 h-5" /> Join Now
      </button>
      
    </div>
  );
  // --- End Mobile Menu Content ---


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* Navbar Header (Fixed to top for consistency) */}
      <header className="bg-white shadow fixed w-full top-0 z-50">
        <nav className="flex justify-between items-center px-4 sm:px-6 py-4">
          
          {/* Logo */}
          <LogoLink /> 

          {/* Desktop Links (Visible on sm and up) */}
          <div className="hidden sm:flex items-center gap-6">
            <Link
              to="/"
              className="text-violet-700 font-medium hover:underline"
            >
              Home
            </Link>
            <button
              onClick={() => handleAuthRedirect('login')}
              className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
            >
              Login
            </button>
            <button
              onClick={() => handleAuthRedirect('register')}
              className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
            >
              Join Now
            </button>
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

      {/* Content - Increased padding-top to account for fixed header */}
      <main className="flex flex-col items-center justify-center flex-grow px-6 text-center pt-24 sm:pt-16"> 
        <h1 className="text-3xl font-bold text-violet-700 mb-4">
          About CampusNet
        </h1>
        <p className="text-gray-600 max-w-2xl leading-relaxed">
          CampusNet is a professional networking platform designed exclusively
          for Delhi University students, alumni, and faculty. Our mission is to
          help you connect with peers, discover opportunities, and build
          meaningful relationships that go beyond the classroom.
        </p>
        <p className="text-gray-600 max-w-2xl leading-relaxed mt-4">
          Whether you’re a student exploring internships, an alumnus looking to
          give back, or a faculty member building collaborations, CampusNet is
          your space to grow and thrive together.
        </p>
      </main>
    </div>
  );
}