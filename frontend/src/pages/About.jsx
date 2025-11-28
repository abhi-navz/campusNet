import { Link, useNavigate } from "react-router-dom"; // <-- ADD useNavigate
import LogoLink from "../components/LogoLink"; 

export default function About() {
  const navigate = useNavigate();
  
  // Function to navigate to the Landing page and trigger the Login modal via URL state
  const handleAuthRedirect = (modalType) => {
    // Navigate to the landing page and pass the intended modal type as state
    navigate("/", { state: { openModal: modalType } });
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow">
        <nav className="flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <LogoLink /> 

          {/* Links */}
          <div className="flex gap-6">
            
            <button
              onClick={() => handleAuthRedirect('login')} // <-- UPDATED TO BUTTON/REDIRECT
              className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
            >
              Login
            </button>
            <button
              onClick={() => handleAuthRedirect('register')} // <-- UPDATED TO BUTTON/REDIRECT
              className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
            >
              Join Now
            </button>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="flex flex-col items-center justify-center flex-grow px-6 text-center">
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