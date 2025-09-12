import Navbar from "../components/Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Fixed Navbar */}
      <div className="fixed top-0 w-full z-50">
        <Navbar />
      </div>

      {/* Page content */}
      <main className="flex flex-col flex-grow pt-20 p-6">
        {children}
      </main>
    </div>
  );
}
