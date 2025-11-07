import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function UserProfile() {
  const { id } = useParams(); // dynamic user id from URL (/profile/:id)
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Load logged-in user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setLoggedInUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Fetch user from backend
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`http://localhost:5000/user/${id}`);
        const data = await res.json();

        if (res.ok) {
          // Normalize _id to id for consistency
          const normalizedUser = {
            ...data,
            id: data._id || data.id,
          };
          setUser(normalizedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [id]);

  // Handle edit button click
  const handleEdit = () => {
    navigate("/edit-profile");
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <p className="text-gray-600 text-center mt-10">Loading profile...</p>
      </Layout>
    );
  }

  // User not found
  if (!user) {
    return (
      <Layout>
        <p className="text-red-500 text-center mt-10">User not found!</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
          <img
            src={user.profilePic || "/default-avatar.png"}
            alt={user.fullName}
            className="w-28 h-28 rounded-full object-cover border-2 border-violet-500"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-violet-700">
              {user.fullName}
            </h1>
            <p className="text-gray-600">{user.headline || "No headline yet"}</p>
            <p className="text-gray-500 text-sm">
              {user.location || "Location not set"}
            </p>
          </div>
        </div>

        {/* About / Bio */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-violet-700 mb-2">About</h2>
          <p className="text-gray-700">
            {user.bio
              ? user.bio
              : "This user hasn't written a bio yet."}
          </p>
        </div>

        {/* Skills Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-violet-700 mb-2">Skills</h2>
          {user.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No skills added yet.</p>
          )}
        </div>

        {/* Edit Profile Button (only for logged-in user) */}
        {loggedInUser && (loggedInUser.id === id || loggedInUser._id === id) && (
          <div className="flex justify-center sm:justify-end">
            <button
              onClick={handleEdit}
              className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
