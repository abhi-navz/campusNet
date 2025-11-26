import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoLink from "../components/LogoLink"; 
import Toast from "../components/Toast"; // <-- NEW: Import Toast

export default function Register() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Error/Success states
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState(null); // <-- NEW: Toast state

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input
  };


  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToastMessage(null);

    // Basic frontend validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // SUCCESS: Show toast and redirect
        setToastMessage({ type: 'success', message: "Registration successful! Redirecting to login." });
        
        // Redirect after a pause
        setTimeout(() => {
            navigate("/login");
        }, 1500); // Give a bit more time to see the toast

      } else {
        // FAILURE: Display API error message inline
        setError(data.message || "Registration failed. Please try a different email.");
      }
      
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar (omitted for brevity, use existing) */}
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
              to="/login"
              className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
            >
              Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Form Section */}
      <main className="flex flex-col items-center justify-center flex-grow px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-violet-700 mb-6 text-center">
            Create Your Account
          </h2>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Inline Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            
            {/* Removed inline success message */}

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700"
            />
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
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700"
            />

            <button
              type="submit"
              className="bg-violet-700 text-white py-2 rounded-lg font-medium hover:bg-violet-600 transition"
              disabled={toastMessage} // Disable button on success
            >
              Register
            </button>
          </form>

          <p className="text-gray-600 text-sm text-center mt-4">
            Already joined?{" "}
            <Link
              to="/login"
              className="text-violet-700 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </main>
      
      {/* RENDER TOAST COMPONENT */}
      {toastMessage && (
        <Toast 
          message={toastMessage.message} 
          type={toastMessage.type} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </div>
  );
}