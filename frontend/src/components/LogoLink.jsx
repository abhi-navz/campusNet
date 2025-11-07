// frontend/src/components/LogoLink.jsx
import { Link } from "react-router-dom";

export default function LogoLink() {
  // Determine the target path based on authentication status (presence of JWT token)
  const token = localStorage.getItem("token");
  const targetPath = token ? "/home" : "/"; // Go to /home if logged in, otherwise /

  // Use a standard Link component with a dynamic destination
  return (
    <Link 
      to={targetPath} 
      className="flex items-center text-2xl font-bold"
    >
      <span className="text-violet-700">Campus</span>
      <span className="bg-violet-700 text-white px-2 py-1 rounded ml-1">
        Net
      </span>
    </Link>
  );
}