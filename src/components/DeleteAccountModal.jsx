import React, { useState } from 'react';
import { MdWarning, MdDelete, MdClose } from 'react-icons/md';
import { apiService, handleApiError } from '../services/api';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/login/loginSlice';
import { toast } from 'react-toastify';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await apiService.user.deleteAccount();
      
      // Show success message with deletion summary
      const { deleted_data } = response.data.details;
      toast.success(`Account deleted successfully!\n\nDeleted:\n- ${deleted_data.stores} stores\n- ${deleted_data.agents} agents\n- ${deleted_data.conversations} conversations\n- ${deleted_data.messages} messages\n- ${deleted_data.external_websites} external websites`);
      
      // Logout user and redirect
      dispatch(logoutUser());
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetModal = () => {
    setConfirmationStep(1);
    setError(null);
    setIsDeleting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Account</h2>
          <button 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={resetModal}
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6">
          {confirmationStep === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdWarning className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                This action is irreversible!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Deleting your account will permanently remove all your data:
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">All stores and their configurations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">All AI agents and their personalities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">All conversation history</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">All product knowledge bases</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">All uploaded files and media</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Your account credentials</span>
                </li>
              </ul>
              
              <button 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                onClick={() => setConfirmationStep(2)}
              >
                I understand, proceed to delete
              </button>
            </div>
          )}

          {confirmationStep === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdWarning className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Final Confirmation Required
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You are about to permanently delete your account and all associated data.
                This action cannot be undone.
              </p>
              
              <div className="flex items-center justify-center mb-6">
                <input 
                  type="checkbox" 
                  id="confirm-delete"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  onChange={(e) => setConfirmationStep(e.target.checked ? 3 : 2)}
                />
                <label htmlFor="confirm-delete" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  I understand that this action is permanent and cannot be undone
                </label>
              </div>
            </div>
          )}

          {confirmationStep === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdDelete className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Delete
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Click the button below to permanently delete your account.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  onClick={() => setConfirmationStep(1)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete My Account'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
