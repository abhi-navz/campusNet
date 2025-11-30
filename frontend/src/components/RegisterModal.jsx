import { useState } from "react";
import { FiX, FiUserPlus } from "react-icons/fi";

/**
 * @component RegisterModal
 * @desc Modal form for user registration.
 * @param {object} props
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSwitchToLogin - Function to switch to the Login modal on success or request.
 * @param {function} props.setToastMessage - Function to show a toast notification.
 */
export default function RegisterModal({ onClose, onSwitchToLogin, setToastMessage }) {
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Error/Success states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };


  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
    
    setLoading(true);

    try {
      const response = await fetch("https://campusnet.onrender.com/auth/signup", {
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
        setToastMessage({ type: 'success', message: "Registration successful! Please log in." });
        
        // Redirect to login modal after success
        onSwitchToLogin();

      } else {
        setError(data.message || "Registration failed. Please try a different email.");
      }
      
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
        setLoading(false);
    }
  };
  
  // Handle click outside the modal content to close it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    > 
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col transform transition-transform duration-300">
        
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
          <h3 className="text-xl font-bold text-violet-700 flex items-center">
            <FiUserPlus className="w-5 h-5 mr-2" />
            Join CampusNet
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <p className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">{error}</p>
            )}
            
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700"
              disabled={loading}
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700"
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password (Min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700"
              disabled={loading}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700"
              disabled={loading}
            />

            <button
              type="submit"
              className="bg-violet-700 text-white py-2 rounded-lg font-medium hover:bg-violet-600 transition disabled:bg-gray-400"
              disabled={loading || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="text-gray-600 text-sm text-center mt-4">
            Already joined?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-violet-700 font-medium hover:underline cursor-pointer"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}