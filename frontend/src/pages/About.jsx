import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow">
        <nav className="flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center text-2xl font-bold">
            <span className="text-violet-700">Campus</span>
            <span className="bg-violet-700 text-white px-2 py-1 rounded ml-1">
              Net
            </span>
          </Link>

          {/* Links */}
          <div className="flex gap-6">
            
            <Link
              to="/login"
              className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
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
