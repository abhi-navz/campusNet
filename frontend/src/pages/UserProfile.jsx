import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function UserProfile() {
  const { id } = useParams();   // for tracing the id of user as user/:id
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`http://localhost:5000/users/${id}`);
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  if (loading) {
    return <p className="text-gray-600">Loading user...</p>;
  }

  if (!user) {
    return <p className="text-red-500">User not found!</p>;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user.profilePic}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-violet-500"
          />
          <div>
            <h1 className="text-2xl font-bold text-violet-700">{user.name}</h1>
            <p className="text-gray-600">{user.headline}</p>
            <p className="text-gray-500 text-sm">{user.location}</p>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-violet-700 mb-2">About</h2>
          <p className="text-gray-700">{user.about}</p>
        </div>

        {/* Experience Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-violet-700 mb-2">
            Experience
          </h2>
          {user.experience?.map((exp, i) => (
            <div key={i} className="mb-4 border-l-4 border-violet-500 pl-3">
              <h3 className="font-bold">{exp.title}</h3>
              <p className="text-gray-600">
                {exp.company} • {exp.location}
              </p>
              <p className="text-gray-500 text-sm">{exp.duration}</p>
              <p className="text-gray-700">{exp.description}</p>
            </div>
          ))}
        </div>
        {/* Posts */}
        <div>
          <h2 className="text-xl font-semibold text-violet-700 mb-2">
            Recent Posts
          </h2>
          {user.posts?.map((post) => (
            <div key={post.id} className="mb-3 p-3 border rounded-lg">
              <p className="text-gray-800">{post.content}</p>
              <p className="text-gray-500 text-sm">{post.date}</p>
            </div>
          ))}
        </div>

        {/* Education Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-violet-700 mb-2">
            Education
          </h2>
          {user.education?.map((edu, i) => (
            <div key={i} className="mb-2">
              <h3 className="font-bold">{edu.school}</h3>
              <p className="text-gray-600">{edu.degree}</p>
              <p className="text-gray-500 text-sm">{edu.duration}</p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-violet-700 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills?.map((skill, i) => (
              <span
                key={i}
                className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
