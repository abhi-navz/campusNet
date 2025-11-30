import { Link } from "react-router-dom";
import LogoLink from "../components/LogoLink"; // <-- NEW: Import the component

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow">
        <nav className="flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <LogoLink /> {/* <-- USE the new component */}

          {/* Links */}
          <div className="flex items-center gap-6">
          <Link
            to="/about"
            className="text-violet-700 font-medium hover:underline"
          >
            About CampusNet
          </Link>
            <Link
              to="/login"
              className="text-violet-700 font-medium hover:underline"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
            >
              Join Now
            </Link>
            
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-grow text-center px-4">
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
            className="bg-violet-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-600 transition"
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