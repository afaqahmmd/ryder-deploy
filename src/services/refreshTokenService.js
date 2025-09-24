import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { axiosInstance } from "../utils/axios";
import { toast } from "react-toastify";

class RefreshTokenService {
  constructor() {
    this.refreshPromise = null;
    this.isRefreshing = false;
  }

  /**
   * Get the current access token from cookies
   */
  getAccessToken() {
    return getCookie("token");
  }

  /**
   * Get the current refresh token from cookies
   */
  getRefreshToken() {
    return getCookie("refresh_token");
  }

  /**
   * Check if access token exists and is valid
   */
  hasValidAccessToken() {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error("Error decoding token:", error);
      return false;
    }
  }

  /**
   * Check if access token is expiring soon (within 2 minutes)
   */
  isTokenExpiringSoon() {
    const token = this.getAccessToken();
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
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshToken() {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.handleRefreshFailure("No refresh token available");
      throw new Error("No refresh token available");
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      return result;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      throw error;
    }
  }

  /**
   * Perform the actual token refresh API call
   */
  async _performRefresh(refreshToken) {
    try {
      console.log("Refreshing access token...");
      
      const response = await axiosInstance.post("/api/refresh-token/", {
        refresh_token: refreshToken
      }, {
        skipAuth: true // Skip auth header for refresh request
      });

      if (response.data && response.data.details) {
        const { details } = response.data;
        const { data } = details;
        const tokens = data;

        // Store new tokens in cookies
        setCookie("token", tokens.access_token, { 
          maxAge: tokens.expires_in || 600 // Default 10 minutes if not provided
        });
        setCookie("refresh_token", tokens.refresh_token, { 
          maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        // Update user session in localStorage with new expiration
        const userSession = JSON.parse(localStorage.getItem('user_session') || '{}');
        if (userSession) {
          userSession.expiresAt = Date.now() + ((tokens.expires_in || 600) * 1000);
          localStorage.setItem('user_session', JSON.stringify(userSession));
        }

        console.log("Token refreshed successfully");
        return {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in || 600
        };
      } else {
        throw new Error("Invalid response format from refresh token endpoint");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      
      // If refresh token is invalid or expired, handle logout
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.handleRefreshFailure("Refresh token expired or invalid");
      }
      
      throw error;
    }
  }

  /**
   * Handle refresh token failure by clearing all tokens and redirecting to login
   */
  handleRefreshFailure(reason = "Token refresh failed") {
    console.log("Handling refresh failure:", reason);
    
    // Clear all tokens and session data
    deleteCookie("token");
    deleteCookie("refresh_token");
    localStorage.removeItem("user_session");
    localStorage.removeItem("shopify_session");
    
    // Show error message
    toast.error("Session expired. Please log in again.");
    
    // Redirect to login page if not already there
    if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
      window.location.href = "/login";
    }
  }

  /**
   * Ensure valid token before making API calls
   */
  async ensureValidToken() {
    if (!this.hasValidAccessToken()) {
      if (this.getRefreshToken()) {
        try {
          await this.refreshToken();
          return true;
        } catch (error) {
          return false;
        }
      } else {
        this.handleRefreshFailure("No refresh token available");
        return false;
      }
    }
    return true;
  }

  /**
   * Setup automatic token refresh timer
   */
  setupTokenRefreshTimer() {
    const token = this.getAccessToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilRefresh = expirationTime - currentTime - (2 * 60 * 1000); // Refresh 2 minutes before expiry

      if (timeUntilRefresh > 0) {
        setTimeout(() => {
          if (this.getRefreshToken()) {
            this.refreshToken().catch(error => {
              console.error("Automatic token refresh failed:", error);
            });
          }
        }, timeUntilRefresh);

        console.log(`Token will be automatically refreshed in ${Math.round(timeUntilRefresh / 1000)} seconds`);
      }
    } catch (error) {
      console.error("Error setting up token refresh timer:", error);
    }
  }

  /**
   * Clear all tokens and logout user
   */
  logout() {
    this.handleRefreshFailure("User logged out");
  }
}

// Create singleton instance
export const refreshTokenService = new RefreshTokenService();
export default refreshTokenService; 