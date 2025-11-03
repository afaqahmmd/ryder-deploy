import { useEffect, useState, useCallback } from "react";
import { setSessionExpiryCallback } from "../utils/authUtils";

/**
 * Hook to track session expiry and show modal when session is about to expire
 * Shows modal 2 minutes before session expires
 */
export const useSessionExpiry = () => {
  const [showModal, setShowModal] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);

  const checkSessionExpiry = useCallback(() => {
    try {
      const userSession = localStorage.getItem("user_session");
      if (!userSession) return;

      const sessionData = JSON.parse(userSession);
      const expiresAt = sessionData?.expiresAt;
      
      if (!expiresAt) return;

      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Show modal 2 minutes (120000ms) before expiry
      const EXPIRY_WARNING_TIME = 2 * 60 * 1000; // 2 minutes
      
      if (timeUntilExpiry > 0 && timeUntilExpiry <= EXPIRY_WARNING_TIME && !showModal) {
        console.log("Session expiring soon, showing modal");
        setShowModal(true);
        setExpiryTime(expiresAt);
      }
    } catch (error) {
      console.error("Error checking session expiry:", error);
    }
  }, [showModal]);

  useEffect(() => {
    // Set the callback for manual session expiry modal trigger
    setSessionExpiryCallback(() => {
      setShowModal(true);
    });

    // Check session expiry every 10 seconds
    const interval = setInterval(checkSessionExpiry, 10000);

    // Initial check
    checkSessionExpiry();

    return () => clearInterval(interval);
  }, [checkSessionExpiry]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleRetry = useCallback(() => {
    // Modal will close automatically after successful refresh
    // This callback can be used for additional logic if needed
    console.log("Session refreshed, continuing...");
  }, []);

  return {
    showModal,
    expiryTime,
    onCloseModal: handleCloseModal,
    onRetry: handleRetry,
  };
};
