import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

const DeleteAccountComponent = ({ onCancel, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteRequest = () => {
    setShowConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (confirmationText.toLowerCase() !== 'delete') {
      alert('Please type "delete" to confirm');
      return;
    }

    setIsLoading(true);
    // Simulate account deletion process
    setTimeout(() => {
      setIsLoading(false);
      onConfirm();
      alert('Account deletion process initiated. Please check your email for further instructions.');
    }, 2000);
  };

  if (!showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm">
          <div className="flex items-center mb-4">
            <Trash2 size={24} className="text-red-600 mr-3" />
            <h3 className="text-lg font-semibold">Delete Account</h3>
          </div>
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data will be permanently deleted including:
            </p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Ride history and bookings</li>
              <li>Profile information</li>
              <li>Payment methods</li>
              <li>App preferences</li>
            </ul>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteRequest}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center mb-4">
          <AlertTriangle size={24} className="text-red-600 mr-3" />
          <h3 className="text-lg font-semibold">Final Confirmation</h3>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            To confirm account deletion, please type <span className="font-semibold">"delete"</span> in the box below:
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Type 'delete' to confirm"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={isLoading}
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowConfirmation(false)}
            disabled={isLoading}
            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={isLoading || confirmationText.toLowerCase() !== 'delete'}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountComponent;