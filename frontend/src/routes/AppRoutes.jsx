import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Landing from "../pages/Landing";

import Home from "../pages/Home";
import UserProfile from "../pages/UserProfile";
import EditProfile from "../pages/EditProfile";
import About from "../pages/About";

// --- NEW IMPORTS ---
import Network from "../pages/Network";
import Messages from "../pages/Messages";
import Notifications from "../pages/Notifications";
// -------------------

/** Component to restrict access to authenticated users.
 * @returns {JSX.Element} Child components if authenticated, otherwise redirects to /login.
 */
function ProtectedRoute({ children }) {
  try {
    const token = localStorage.getItem("token"); 
    
    // Grant access if token exists, otherwise redirect.
    // Note: The redirect path is now "/" since login is on the landing page.
    return token ? children : <Navigate to="/" replace />;
  } catch (err) {
    console.error("Error checking authentication status:", err);
    return <Navigate to="/" replace />;
  }
}

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        {/* Removed redundant /login and /register routes */}
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
        
        
        <Route
          path="/network"
          element={
            <ProtectedRoute>
              <Network />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}