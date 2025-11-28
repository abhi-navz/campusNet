import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiLogIn } from "react-icons/fi";

/**
 * @component LoginModal
 * @desc Modal form for user login.
 * @param {object} props
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSuccess - Function called on successful login.
 * @param {function} props.onSwitchToRegister - Function to switch to the Register modal.
 * @param {function} props.setToastMessage - Function to show a toast notification.
 */
export default function LoginModal({ onClose, onSuccess, onSwitchToRegister, setToastMessage }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token); 
        
        setToastMessage({ type: 'success', message: "Login successful!" });
        
        // Use onSuccess callback to handle navigation/closure in parent
        onSuccess();

      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Error:", err);
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
            <FiLogIn className="w-5 h-5 mr-2" />
            Sign In to CampusNet
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">{error}</p>}
            
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
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700"
              disabled={loading}
            />

            <button
              type="submit"
              className="bg-violet-700 text-white py-2 rounded-lg font-medium hover:bg-violet-600 transition disabled:bg-gray-400"
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>

          <p className="text-gray-600 text-sm text-center mt-4">
            New here?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-violet-700 font-medium hover:underline cursor-pointer"
            >
              Join Now
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}