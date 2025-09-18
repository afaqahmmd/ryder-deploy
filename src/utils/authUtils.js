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