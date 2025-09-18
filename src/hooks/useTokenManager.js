import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { initializeTokenManager, checkTokenValidity, getAccessToken } from '../utils/tokenManager';
import { isAuthenticated } from '../utils/authUtils';

/**
 * Custom hook to manage token functionality throughout the app
 */
export const useTokenManager = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      // Skip token management on login/signup pages
      const publicRoutes = ['/', '/login', '/signup', '/verify-otp'];
      if (publicRoutes.includes(location.pathname)) {
        return;
      }

      try {
        // Initialize token management system
        initializeTokenManager();
        
        // Check if user has valid tokens
        const hasValidToken = await checkTokenValidity();
        
        if (!hasValidToken) {
          // Don't redirect here - let AuthWrapper handle authentication
          // Just log the issue for debugging
          console.log("Token validation failed, but letting AuthWrapper handle redirect");
        } else {
          console.log("Token management initialized successfully");
        }
      } catch (error) {
        console.error("Token management initialization failed:", error);
        // Don't redirect here - let AuthWrapper handle authentication
      }
    };

    initializeAuth();
  }, [navigate, location.pathname]);

  // Return utility functions that components might need
  return {
    isAuthenticated: () => isAuthenticated(),
    logout: () => {
      // This will be handled by the auth utils
      window.location.href = '/login';
    },
    getAccessToken: () => getAccessToken()
  };
}; 