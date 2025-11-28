import React from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

/**
 * @component DeleteConfirmationModal
 * @desc A custom modal to confirm a destructive action (post deletion).
 * @param {object} props
 * @param {function} props.onClose - Function to close the modal without deleting.
 * @param {function} props.onConfirm - Function to proceed with the deletion.
 * @param {string} props.postAuthor - The name of the post author (for context).
 */
export default function DeleteConfirmationModal({ onClose, onConfirm, postAuthor }) {
  
  // Handle click outside the modal content to close it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Modal Overlay
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 transition-opacity"
      onClick={handleOverlayClick}
    > 
      
      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col transform transition-transform duration-300 scale-100">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-red-600 rounded-t-xl">
          <h3 className="text-lg font-bold text-white flex items-center">
            <FiAlertTriangle className="w-5 h-5 mr-2" />
            Confirm Deletion
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-white hover:bg-red-700 transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this post?
          </p>
          <p className="text-sm text-gray-500">
            This action is permanent and cannot be undone. All associated comments will also be deleted.
          </p>
        </div>

        {/* Footer/Actions */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-gray-700 border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition"
          >
            Yes, Delete Post
          </button>
        </div>

      </div>
    </div>
  );
}