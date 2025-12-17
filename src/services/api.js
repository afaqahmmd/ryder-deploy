import { axiosInstance } from "../utils/axios";
import { encryptData } from "../utils/encryption";
import { getCookie } from "cookies-next";

// API endpoints based on the backend integration guide
export const apiService = {
  // Health Check APIs
  health: {
    main: () => axiosInstance.get("/health/"),
    users: () => axiosInstance.get("/api/health/"),
    stores: () => axiosInstance.get("/api/stores/health/"),
  },

  // Authentication APIs
  auth: {
    register: (userData) => {
      const encryptedData = encryptData(userData);
      return axiosInstance.post("/api/register/", { encryptedData });
    },
    verifyEmail: (email, otp) => {
      const encryptedData = encryptData({ email });
      return axiosInstance.post("/api/verify-email/", { encryptedData, otp });
    },
    login: (credentials) => {
      const encryptedData = encryptData(credentials);
      return axiosInstance.post("/api/login/", { encryptedData });
    },
    resendOtp: (email) => axiosInstance.post("/api/resend-otp/", { email }),
    
    refreshToken: async (refreshToken) => {
      return await axiosInstance.post("/api/refresh-token/", { refresh_token: refreshToken }, { skipAuth: true });
    },

    logout: () => {
      // Clear tokens and redirect to login
      return Promise.resolve({ message: "Logged out successfully" });
    },
  },

  // User Profile APIs
  user: {
    getDetails: async () => {
      return await axiosInstance.get("/api/details/");
    },
    getProfile: async () => {
      return await axiosInstance.get("/api/profile/");
    },
    updateProfile: async (userId, userData) => {
      return await axiosInstance.put(`/api/profile/${userId}/`, userData);
    },
    updatePartialProfile: async (userId, userData) => {
      return await axiosInstance.patch(`/api/profile/${userId}/`, userData);
    },
    changePassword: async (passwordData) => {
      return await axiosInstance.post("/api/change-password/", passwordData);
    },
    getStats: async () => {
      return await axiosInstance.get("/api/stats/");
    },
    deleteAccount: async () => {
      return await axiosInstance.delete("/api/delete-account/");
    },
  },

  // Store Management APIs
  stores: {
    getAll: async () => {
      return await axiosInstance.get("/api/stores/");
    },
    create: async (storeData) => {
      const encryptedData = encryptData(storeData);
      return await axiosInstance.post("/api/stores/", { encryptedData });
    },
    getById: async (storeId) => {
      return await axiosInstance.get(`/api/stores/${storeId}/`);
    },
    delete: async (storeId) => {
      return await axiosInstance.delete(`/api/stores/${storeId}/`);
    },
    getProductCounts: async () => {
      return await axiosInstance.get("/api/stores/product-counts/");
    },
    getProductCount: async (storeId) => {
      return await axiosInstance.get(`/api/stores/${storeId}/product-count/`);
    },
    refreshProductCounts: async () => {
      return await axiosInstance.post("/api/stores/refresh-product-counts/");
    },
  },

  // Agent Management APIs
  agents: {
    // Create a new agent with all data in one request
    create: async (agentData) => {
      // Prepare FormData for file upload support
      const formData = new FormData();

      // Add all agent fields
      Object.keys(agentData).forEach((key) => {
        if (key === "external_websites" && agentData[key]) {
          // Send external_websites as JSON string for proper parsing
          formData.append(key, JSON.stringify(agentData[key]));
        } else if (key === "instructions_file" && agentData[key]) {
          formData.append(key, agentData[key]);
        } else if (
          agentData[key] !== null &&
          agentData[key] !== undefined &&
          agentData[key] !== ""
        ) {
          formData.append(key, agentData[key]);
        }
      });

      return await axiosInstance.post("/api/agents/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // Get all agents for the authenticated user
    getAll: async () => {
      return await axiosInstance.get("/api/agents/");
    },

    // Get detailed information about a specific agent
    getById: async (agentId) => {
      return await axiosInstance.get(`/api/agents/${agentId}/`);
    },

    // Update an existing agent
    update: async (agentId, agentData) => {
      const formData = new FormData();

      // Add all agent fields
      Object.keys(agentData).forEach((key) => {
        if (key === "external_websites" && agentData[key]) {
          // Send external_websites as JSON string for proper parsing
          formData.append(key, JSON.stringify(agentData[key]));
        } else if (key === "instructions_file" && agentData[key]) {
          formData.append(key, agentData[key]);
        } else if (
          agentData[key] !== null &&
          agentData[key] !== undefined &&
          agentData[key] !== ""
        ) {
          formData.append(key, agentData[key]);
        }
      });

      return await axiosInstance.put(`/api/agents/${agentId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // Delete a specific agent
    delete: async (agentId) => {
      return await axiosInstance.delete(`/api/agents/${agentId}/`);
    },

    // Activate a specific agent
    activate: async (agentId) => {
      return await axiosInstance.post(`/api/agents/${agentId}/activate/`);
    },

    // Deactivate a specific agent
    deactivate: async (agentId) => {
      return await axiosInstance.post(`/api/agents/${agentId}/deactivate/`);
    },
  },

  // Embeddings API
  embeddings: {
    // Create embeddings for a store
    create: async (storeId) => {
      console.log("inside apiiiiii creating embedingggg databaseeeeeeeeeeeee");

      return await axiosInstance.get("/api/stores/fetch-products/", {
        params: {
          store_id: storeId,
        },
      });
    },

    // Search embeddings
    search: async (query, storeId = null, limit = 10) => {
      const params = new URLSearchParams({
        query: query,
        limit: limit,
      });

      if (storeId) {
        params.append("store_id", storeId);
      }

      return await axiosInstance.get(
        `/api/agents/embeddings/search/?${params}`
      );
    },

    // Get embedding statistics
    getStats: async (storeId = null, collectionName = null) => {
      const params = new URLSearchParams();

      if (storeId) {
        params.append("store_id", storeId);
      }

      if (collectionName) {
        params.append("collection_name", collectionName);
      }

      const queryString = params.toString();
      return await axiosInstance.get(
        `/api/agents/embeddings/stats/${queryString ? `?${queryString}` : ""}`
      );
    },
  },

  // Conversations API
  conversations: {
    // Get all conversations with optional filters
   getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      
      // Handle date filters
      if (filters.startDate) {
        params.append("start_date", filters.startDate);
      }
      if (filters.endDate) {
        params.append("end_date", filters.endDate);
      }
      
      // Handle engagement filters
      if (filters.hasEngagement !== undefined && filters.hasEngagement !== null) {
        params.append("has_engagement", filters.hasEngagement ? "true" : "false");
      }
      if (filters.hasCartCreation !== undefined && filters.hasCartCreation !== null) {
        params.append("has_cart_creation", filters.hasCartCreation ? "true" : "false");
      }
      if (filters.hasOrderComplete !== undefined && filters.hasOrderComplete !== null) {
        params.append("has_order_complete", filters.hasOrderComplete ? "true" : "false");
      }
      if (filters.hasCheckout !== undefined && filters.hasCheckout !== null) {
        params.append("has_checkout", filters.hasCheckout ? "true" : "false");
      }
      
      // Handle pagination
      if (filters.page) {
        params.append("page", filters.page);
      }
      if (filters.pageSize) {
        params.append("page_size", filters.pageSize);
      }

      const queryString = params.toString();
      return await axiosInstance.get(
        `/api/agents/conversations/${queryString ? `?${queryString}` : ""}`
      );
    },


    // Get messages for a specific conversation
    getMessages: async (conversationId, page = 1, pageSize = 50) => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      return await axiosInstance.get(
        `/api/agents/conversations/${conversationId}/messages/?${params}`
      );
    },

    // Get conversation by customer ID
    getByCustomerId: async (customerId) => {
      return await axiosInstance.get(
        `/api/agents/conversations/customer/${customerId}/`
      );
    },
  },
  // Analytics APIs
  analytics: {
    // 🧩 Store overview analytics (summary)
    getStoreAnalytics: async (storeId, params = {}) => {
      return await axiosInstance.get(`/api/core/analytics/store/${storeId}/`, {
        params,
      });
    },

    // 📊 Store-level graph data (sales trends, revenue, etc.)
    getStoreGraph: async (storeId, params = {}) => {
      return await axiosInstance.get(
        `/api/core/analytics/store/${storeId}/engaged/graph/`,
        { params }
      );
    },

    // 👥 Engaged user analytics (visits, interactions)
    getEngagedAnalytics: async (storeId, params = {}) => {
      return await axiosInstance.get(
        `/api/core/analytics/store/${storeId}/engaged/`,
        { params }
      );
    },

    // 📈 Engaged user graph data
    getEngagedGraph: async (storeId, params = {}) => {
      return await axiosInstance.get(
        `/api/core/analytics/store/${storeId}/engaged/graph/`,
        { params }
      );
    },

    // 🛍️ Top-performing products for a store
    getProductAnalytics: async (storeId, params = {}) => {
      return await axiosInstance.get(
        `/api/core/analytics/products/${storeId}/`,
        { params }
      );
    },
  },
};

// Instructions API
apiService.instructions = {
  suggest: async (agentId, items) => {
    console.log("sending suggestions:", items);
    return await axiosInstance.post("/api/agents/instructions/suggest/", {
      agent_id: agentId,
      instructions: items,
    });
  },
  getByAgent: async (agentId) => {
    return await axiosInstance.get(`/api/agents/instructions/${agentId}/`);
  },
};

// Helper function to handle API errors consistently
export const handleApiError = (error) => {
  // Check if it's a network error
  if (!error.response) {
    return "Network error. Please check your connection.";
  }

  // Check if it's an authentication error (handled by interceptor)
  if (error.response.status === 401) {
    return "Authentication failed. Please log in again.";
  }

  // Extract error message from response
  if (error.response?.data?.details?.message) {
    return error.response.data.details.message;
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Helper function to extract data from API responses
export const extractApiData = (response) => {
  if (response.data?.details?.data) {
    return response.data.details.data;
  }
  if (response.data?.details) {
    return response.data.details;
  }
  return response.data;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getCookie("token");
  return !!token;
};

// Helper function to ensure valid authentication before API calls
export const ensureAuthenticated = async () => {
  const token = getCookie("token");
  if (!token) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error(error);
    return false;
  }
};
