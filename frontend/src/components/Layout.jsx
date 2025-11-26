import Navbar from "../components/Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      <Navbar />

      {/* Page content */}
     
      <main className="flex flex-col flex-grow pt-20 p-6 pb-[56px] sm:pb-6"> 
        {children}
      </main>
    </div>
  );
}