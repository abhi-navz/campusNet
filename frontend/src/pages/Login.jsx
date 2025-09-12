import { Link } from "react-router-dom";

export default function Login() {
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
          <div className="flex items-center gap-6">
            <Link
              to="/about"
              className="text-violet-700 font-medium hover:underline"
            >
              About CampusNet
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

      {/* Form Section */}
      <main className="flex flex-col items-center justify-center flex-grow px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-violet-700 mb-6 text-center">
            Welcome Back
          </h2>

          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email Address"
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700"
            />
            <input
              type="password"
              placeholder="Password"
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700"
            />

            <button
              type="submit"
              className="bg-violet-700 text-white py-2 rounded-lg font-medium hover:bg-violet-600 transition"
            >
              Login
            </button>
          </form>

          {/* Link below form */}
          <p className="text-gray-600 text-sm text-center mt-4">
            New here?{" "}
            <Link
              to="/register"
              className="text-violet-700 font-medium hover:underline"
            >
              Join Now
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
