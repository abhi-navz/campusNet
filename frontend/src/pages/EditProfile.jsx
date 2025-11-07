import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    headline: "",
    bio: "",
    location: "",
    skills: "",
    profilePic: "",
  });

  useEffect(() => {
    // Fetch existing profile data
    async function fetchProfile() {
      const res = await fetch(`http://localhost:5000/user/${user.id}`);
      const data = await res.json();
      setFormData({
        fullName: data.fullName,
        headline: data.headline || "",
        bio: data.bio || "",
        location: data.location || "",
        skills: data.skills?.join(", ") || "",
        profilePic: data.profilePic || "",
      });
    }
    fetchProfile();
  }, [user.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      skills: formData.skills.split(",").map((s) => s.trim()),
    };

    const res = await fetch(`http://localhost:5000/user/update/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
        alert("Profile updated!");
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate(`/profile/${data.user._id || data.user.id}`);
    } else {
      alert(data.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-violet-700 mb-4">Edit Profile</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="text"
            name="headline"
            placeholder="Headline (e.g. DU Student | Developer)"
            value={formData.headline}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <textarea
            name="bio"
            placeholder="About you..."
            value={formData.bio}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="text"
            name="skills"
            placeholder="Skills (comma separated)"
            value={formData.skills}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="text"
            name="profilePic"
            placeholder="Profile Picture URL"
            value={formData.profilePic}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          <button
            type="submit"
            className="bg-violet-700 text-white px-4 py-2 rounded hover:bg-violet-600"
          >
            Save Changes
          </button>
        </form>
      </div>
    </Layout>
  );
}
