import axios from "axios";
import { getCookie } from "cookies-next";
import { handleSessionExpiration, getRefreshToken, updateTokens, showSessionExpiryModal } from "../utils/authUtils";

export const baseDomain = import.meta.env.VITE_BACKEND_URL;

export const axiosInstance = axios.create({
  baseURL: baseDomain,
  timeout: 60000  // Increased to 60 seconds for comprehensive chat API
});

// Request interceptor - add token to requests
const RequestInterceptor = async (config) => {
  if (!config.skipAuth) {
    const token = getCookie("token");
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
  }


  return config;
};

// Response interceptor - handle successful responses
const ResponseInterceptor = (response) => {
  return response;
};

// Track if refresh is in progress to avoid multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

// Response error interceptor - handle authentication errors and token refresh
const ResponseErrorInterceptor = async (error) => {
  const originalRequest = error.config;
  const status = error.response?.status;
  const data = error.response?.data;
  
  // Handle 401/403 errors
  if ((status === 401 || status === 403) && !originalRequest?.skipAuth) {
    const token = getCookie("token");
    const detailMessage = data?.errors?.detail || data?.detail || data?.message || "";
    const matchesMissingCreds = typeof detailMessage === "string" &&
      detailMessage.toLowerCase().includes("authentication credentials were not provided");
    
    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }
    
    // If no token or missing credentials, try to refresh
    if (!token || matchesMissingCreds) {
      isRefreshing = true;
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          // Call refresh token API
          const response = await axios.post(`${baseDomain}/api/refresh-token/`, 
            { refresh_token: refreshToken },
            { skipAuth: true }
          );
          
          // Handle nested response structure from backend
          const tokenData = response.data?.details?.data?.tokens || response.data;
          const { access_token, refresh_token, expires_in } = tokenData;
          
          if (!access_token) {
            throw new Error("No access token in refresh response");
          }
          
          // Update tokens
          updateTokens(access_token, refresh_token, expires_in);
          
          // Update original request with new token
          originalRequest.headers.authorization = `Bearer ${access_token}`;
          
          // Process queued requests
          processQueue(null, access_token);
          
          // Retry original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          processQueue(refreshError, null);
          handleSessionExpiration("Session expired. Please log in again.");
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available
        handleSessionExpiration("Please log in to continue.");
      }
    }
  }
  
  // For other errors, reject the promise
  const expectedErrors =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 509;
    
  if (!expectedErrors) {
    return Promise.reject(error.response);
  } else {
    return Promise.reject(error.response);
  }
};

// Apply interceptors
axiosInstance.interceptors.request.use(RequestInterceptor, (error) => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(ResponseInterceptor, ResponseErrorInterceptor);
