import { getCookie, deleteCookie } from "cookies-next";
import { logout as logoutUser, handleSessionExpiration } from "./authUtils";

/**
 * Check if token is expired
 */
export const isTokenExpired = () => {
  const token = getCookie("token");
  if (!token) return true;

  try {
    // Decode JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp <= currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

/**
 * Check if token is expiring soon (within 2 minutes)
 */
export const isTokenExpiringSoon = () => {
  const token = getCookie("token");
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = payload.exp - currentTime;
    return timeUntilExpiry < 120; // 2 minutes buffer
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

/**
 * Start token refresh timer
 * This function sets up a timer to refresh the token before it expires
 */
export const startTokenRefreshTimer = (dispatch, expiresAt, isLogin = false) => {
  if (!expiresAt) {
    console.warn("No expiration time provided for token refresh timer");
    return;
  }

  const now = Date.now();
  const timeUntilExpiry = expiresAt - now;
  
  // If token is already expired, don't set up refresh timer
  if (timeUntilExpiry <= 0) {
    console.warn("Token is already expired, cannot set up refresh timer");
    return;
  }

  // Set up refresh timer to trigger 2 minutes before expiry
  const refreshTime = timeUntilExpiry - (2 * 60 * 1000); // 2 minutes before expiry
  
  if (refreshTime > 0) {
    console.log(`Setting up token refresh timer for ${new Date(expiresAt).toISOString()}`);
    
    setTimeout(() => {
      console.log("Token refresh timer triggered");
      // Here you would typically dispatch a token refresh action
      // For now, we'll just log that the timer was triggered
      // You can implement actual token refresh logic here when needed
    }, refreshTime);
  } else {
    console.log("Token expires too soon, skipping refresh timer setup");
  }
};

/**
 * Logout user by clearing all tokens and session data
 */
// export const logoutUser = () => {
//   logoutUser();
// };

/**
 * Check token validity
 */
export const checkTokenValidity = async () => {
  try {
    if (isTokenExpired()) {
      console.log("am i here?")
      handleSessionExpiration("Session expired. Please log in again.");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Token validation failed:", error);
    console.log("or am i here?");
    handleSessionExpiration("Session expired. Please log in again.");
    return false;
  }
};

/**
 * Get current access token
 */
export const getAccessToken = () => {
  return getCookie("token");
};

/**
 * Initialize token management system
 * Call this when the app starts or when user logs in
 */
export const initializeTokenManager = () => {
  // Check current token validity
  checkTokenValidity();
};

/**
 * Handle successful login/signup by setting up token management
 */
export const handleLoginSuccess = (tokens, expiresAt) => {
  // The tokens are already stored in cookies by the login/signup thunks
  console.log("Token management initialized after successful login");
}; 