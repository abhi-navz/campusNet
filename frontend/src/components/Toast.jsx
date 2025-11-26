import { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

/**
 * @component Toast
 * @desc A non-blocking notification that slides in to display success or error messages.
 * @param {object} props
 * @param {string} props.message - The text content of the notification.
 * @param {'success' | 'error'} props.type - The type of message (determines color/icon).
 * @param {function} props.onClose - Callback function to clear the message state in the parent component.
 */
export default function Toast({ message, type = 'success', onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the toast immediately
    setIsVisible(true);

    // Set timeout to hide the toast after 3000ms (3 seconds)
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for the fade-out transition (300ms) before calling parent's onClose
      setTimeout(onClose, 300); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Determine styling based on type
  const baseClasses = 'fixed bottom-5 right-5 p-4 rounded-xl shadow-lg z-50 transform transition-all duration-300 flex items-center';
  const typeClasses = type === 'success' 
    ? 'bg-green-600 text-white' 
    : 'bg-red-600 text-white';
  const icon = type === 'success' 
    ? <FiCheckCircle className="w-5 h-5 mr-3" /> 
    : <FiAlertCircle className="w-5 h-5 mr-3" />;
  
  const visibilityClass = isVisible 
    ? 'translate-y-0 opacity-100' 
    : 'translate-y-full opacity-0';

  return (
    <div className={`${baseClasses} ${typeClasses} ${visibilityClass}`}>
      {icon}
      <span className="font-medium">{message}</span>
    </div>
  );
}