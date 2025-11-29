import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function EditProfile() {
  const navigate = useNavigate();
  // Retrieve user data and the token from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [user] = useState(storedUser);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    headline: "",
    bio: "",
    location: "",
    skills: "",
    profilePic: "",
    course: "",
    graduationYear: "",
  });

  // Hardcoded options for the select menus
  const COURSE_OPTIONS = [
    "B.A.",
    "B.A. (Hons.)",
    "B.Sc.",
    "B.Sc. (Hons.)",
    "B.Com",
    "B.Com (Hons.)",
    "B.Tech",
    "B.Voc",
    "B.Ed",
    "BBA / BMS",
  
    "M.A.",
    "M.Sc.",
    "M.Com",
    "M.Tech",
    "MCA",
    "MBA",
  
    "LL.B.",
    "LL.M.",
    "M.Phil.",
    "Ph.D."
  ];
  const YEAR_OPTIONS = [];
  for (let y = 1970; y <= 2030; y++) YEAR_OPTIONS.push(y);

  useEffect(() => {
    // Redirect if user or token is missing
    if (!user || !token) {
      navigate("/login", { replace: true });
      return;
    }

    // Fetch existing profile data
    async function fetchProfile() {
      const res = await fetch(`https://campusnet.onrender.com/user/${user.id}`);
      const data = await res.json();
      setFormData({
        fullName: data.fullName,
        headline: data.headline || "",
        bio: data.bio || "",
        location: data.location || "",
        skills: data.skills?.join(", ") || "",
        profilePic: data.profilePic || "",
        // Populate new fields
        course: data.course || "",
        graduationYear: data.graduationYear || "",
      });
    }
    fetchProfile();
  }, [user, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for token before submitting to the protected endpoint
    if (!token) {
      alert("Authorization failed. Please login again.");
      navigate("/login");
      return;
    }

    const payload = {
      ...formData,
      skills: formData.skills.split(",").map((s) => s.trim()),
    };

    // Ensure graduationYear is sent as a number or null
    payload.graduationYear = payload.graduationYear
      ? parseInt(payload.graduationYear)
      : null;

    const res = await fetch(`https://campusnet.onrender.com/user/update/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // CRITICAL: Sending the JWT token
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      // Use inline toast notification later
      alert("Profile updated!");
      // Update local storage with the new user object
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(`/profile/${data.user.id || data.user._id}`);
    } else {
      alert(data.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-violet-700 mb-4">
          Edit Profile
        </h2>

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
            placeholder="Location (e.g., New Delhi, India)"
            value={formData.location}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />

          {/* --- NEW ACADEMIC INPUTS --- */}
          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="" disabled>
              Select Your Course / Degree
            </option>
            {COURSE_OPTIONS.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <select
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="" disabled>
              Select Expected/Actual Graduation Year
            </option>
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="skills"
            placeholder="Skills (comma separated: e.g., React, MongoDB, Python)"
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
