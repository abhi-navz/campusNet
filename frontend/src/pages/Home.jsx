import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return (
      <Layout>
        <p className="text-gray-600 text-center mt-20">
          Please login to view your feed.
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-violet-700 mb-2">
          Welcome, {user.fullName.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-600 mb-6">
          Here’s what’s happening in your CampusNet feed:
        </p>

        {/* Feed Section */}
        <div className="space-y-4">
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-gray-800">
              🎓 Welcome to CampusNet! Start connecting with peers.
            </p>
          </div>

          {/* Future: dynamic posts will be mapped here */}
        </div>
      </div>
    </Layout>
  );
}
