import axios from "axios";
import { getCookie } from "cookies-next";
import { handleSessionExpiration } from "../utils/authUtils";

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

// Response error interceptor - handle authentication errors
const ResponseErrorInterceptor = async (error) => {
  const originalRequest = error.config;
  
  // If we receive a 401 or 403 and no access token is present, redirect to login
  const status = error.response?.status;
  const data = error.response?.data;
  
  if ((status === 401 || status === 403) && !originalRequest?.skipAuth) {
    const token = getCookie("token");
    console.log("Token:", token);
    const detailMessage = data?.errors?.detail || data?.detail || data?.message || "";
    console.log("Detail message:", detailMessage);
    const matchesMissingCreds = typeof detailMessage === "string" &&
      detailMessage.toLowerCase().includes("authentication credentials were not provided");
    console.log("Matches missing creds:", matchesMissingCreds);
    
    if (!token || matchesMissingCreds) {
      handleSessionExpiration("Please log in to continue.");
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
