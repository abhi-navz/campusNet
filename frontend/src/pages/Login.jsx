import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoLink from "../components/LogoLink"; // <-- NEW: Import the consistent Logo component

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login successful!");
        // CRITICAL UPDATE: Store both user data AND the JWT token
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token); 
        navigate("/home");
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow">
        <nav className="flex justify-between items-center px-6 py-4">
          
          <LogoLink /> 

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

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700"
            />

            <button
              type="submit"
              className="bg-violet-700 text-white py-2 rounded-lg font-medium hover:bg-violet-600 transition"
            >
              Login
            </button>
          </form>

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