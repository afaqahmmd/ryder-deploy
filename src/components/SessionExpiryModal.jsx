import React, { useState } from "react";
import { apiService } from "../services/api";
import { updateTokens } from "../utils/authUtils";
import { toast } from "react-toastify";
import { AlertCircle, Clock } from "lucide-react";

const SessionExpiryModal = ({ isOpen, onClose, onRetry }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRetry = async () => {
    setIsLoading(true);
    try {
      // Get refresh token from localStorage
      const userSession = localStorage.getItem("user_session");
      if (!userSession) {
        toast.error("Session data not found. Please log in again.");
        onClose();
        return;
      }

      const sessionData = JSON.parse(userSession);
      const refreshToken = sessionData?.tokens?.refresh_token;

      if (!refreshToken) {
        toast.error("Refresh token not found. Please log in again.");
        onClose();
        return;
      }

      // Call refresh token API
      const response = await apiService.auth.refreshToken(refreshToken);
      
      if (response.data) {
        // Handle nested response structure from backend
        const tokenData = response.data?.details?.data?.tokens || response.data;
        const { access_token, refresh_token, expires_in } = tokenData;
        
        if (!access_token) {
          throw new Error("No access token in refresh response");
        }
        
        // Update tokens in storage
        updateTokens(access_token, refresh_token, expires_in);
        
        toast.success("Session refreshed successfully!");
        onClose();
        
        // Call the retry callback if provided
        if (onRetry) {
          onRetry();
        }
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      toast.error("Failed to refresh session. Please log in again.");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full p-2">
            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Session Expiring
          </h2>
        </div>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Your session is about to expire please refresh to continue.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Click "Refresh" to refresh your session and continue working without interruption.
        </p>

        {/* Alert Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-6 flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Your work will not be lost. We'll refresh your session automatically.
          </p>
        </div>


        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryModal;
