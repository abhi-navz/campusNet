import Layout from "../components/Layout";

export default function Messages() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-violet-700 mb-4">Messages</h1>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600">
            This page will host direct messaging functionality with your connections. 
            (Feature coming soon)
          </p>
        </div>
      </div>
    </Layout>
  );
}