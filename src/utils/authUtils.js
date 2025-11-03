import { deleteCookie, getCookie } from "cookies-next";
import { toast } from "react-toastify";

/**
 * Clear all authentication data and redirect to login
 */
export const logout = () => {
  // Clear all tokens and session data
  deleteCookie("token");
  localStorage.removeItem("user_session");
  localStorage.removeItem("shopify_session");
  
  // Show logout message
  toast.success("Successfully logged out");
  
  // Redirect to login page
  if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
    window.location.href = "/login";
  }
};

/**
 * Handle session expiration by clearing tokens and redirecting to login
 */
export const handleSessionExpiration = (message = "Session expired. Please log in again.") => {
  // add functionality that if the route is password reset, then don't redirect to login
  if (window.location.pathname === "/password-reset") {
    console.log("Password reset route detected, not redirecting to login");
    return;
  }
  // Clear all tokens and session data
  console.log("Clearing tokens and session data");
  deleteCookie("token");
  localStorage.removeItem("user_session");
  localStorage.removeItem("shopify_session");
  
  // Show error message
  toast.error(message);
  
  // Redirect to login page if not already there
  console.log("Redirecting to login page");
  if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
    window.location.href = "/login";
  }
};

/**
 * Check if user is authenticated by checking for token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token") || getCookie("token");
  return !!token;
};

/**
 * Get the current access token
 */
export const getAccessToken = () => {
  return getCookie("token");
};

/**
 * Get the refresh token from localStorage
 */
export const getRefreshToken = () => {
  try {
    const userSession = localStorage.getItem("user_session");
    if (userSession) {
      const sessionData = JSON.parse(userSession);
      return sessionData?.tokens?.refresh_token;
    }
  } catch (error) {
    console.error("Error getting refresh token:", error);
  }
  return null;
};

/**
 * Update tokens in localStorage and cookies
 */
export const updateTokens = (accessToken, refreshToken, expiresIn = 900) => {
  try {
    // Update cookie with new access token
    const expiresAt = Date.now() + expiresIn * 1000;
    
    // Update localStorage session
    const userSession = localStorage.getItem("user_session");
    if (userSession) {
      const sessionData = JSON.parse(userSession);
      sessionData.tokens.access_token = accessToken;
      sessionData.tokens.refresh_token = refreshToken;
      sessionData.expiresAt = expiresAt;
      sessionData.loginTime = new Date().toISOString();
      localStorage.setItem("user_session", JSON.stringify(sessionData));
    }
    
    // Update cookie
    document.cookie = `token=${accessToken}; path=/; max-age=${expiresIn}`;
    
    console.log("Tokens updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating tokens:", error);
    return false;
  }
};

/**
 * Show session expiry modal
 */
let sessionExpiryCallback = null;

export const setSessionExpiryCallback = (callback) => {
  sessionExpiryCallback = callback;
};

export const showSessionExpiryModal = () => {
  if (sessionExpiryCallback) {
    sessionExpiryCallback();
  }
};