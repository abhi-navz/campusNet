import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoLink from "../components/LogoLink"; 
import Toast from "../components/Toast"; // <-- NEW: Import Toast

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  // Combined success state for the toast message
  const [toastMessage, setToastMessage] = useState(null); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToastMessage(null); // Clear previous messages

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
        // SUCCESS: Show toast, set user data, and redirect
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token); 
        
        // Show non-blocking toast notification
        setToastMessage({ type: 'success', message: "Login successful!" });
        
        // Redirect after a slight pause for the user to see the toast
        setTimeout(() => {
            navigate("/home");
        }, 1000); // 1 second delay

      } else {
        // FAILURE: Display error message inline
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Error:", err);
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
              disabled={toastMessage} // Disable button if toast is active (meaning successful login)
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