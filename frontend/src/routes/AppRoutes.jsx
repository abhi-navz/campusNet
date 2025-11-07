import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import UserProfile from "../pages/UserProfile";
import EditProfile from "../pages/EditProfile";
import About from "../pages/About";

/** Component to restrict access to authenticated users.
 * @returns {JSX.Element} Child components if authenticated, otherwise redirects to /login.
 */
function ProtectedRoute({ children }) {
  try {
    // CRITICAL UPDATE: Check only for the JWT token
    const token = localStorage.getItem("token"); 
    
    // Grant access if token exists, otherwise redirect.
    return token ? children : <Navigate to="/login" replace />;
  } catch (err) {
    console.error("Error checking authentication status:", err);
    return <Navigate to="/login" replace />;
  }
}

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}