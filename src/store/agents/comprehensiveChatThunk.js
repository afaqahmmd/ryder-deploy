import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../utils/axios";
import { processResponseData } from "../../utils/htmlRenderer";

// Comprehensive chat with agent
export const comprehensiveChat = createAsyncThunk(
  "agents/comprehensiveChat",
  async ({ message, agentId, storeId, customerId = null, newConvo = false }, thunkAPI) => {
    try {
      const requestBody = {
        message: message.trim(),
        agent_id: agentId,
        store_id: storeId,
        new_convo: newConvo
      };

      // Add customer_id if provided
      if (customerId) requestBody.customer_id = customerId;

      const response = await axiosInstance.post("/api/agents/chat/comprehensive/", requestBody);

      if (response.data && response.data.details) {
        // Convert markdown response to HTML
        const processedData = processResponseData(response.data.details.data);
        return processedData;
      } else {
        return thunkAPI.rejectWithValue({ message: "No response received" });
      }
    } catch (error) {
      let errorMessage = "Failed to get agent response";

      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = "Request timed out. The server is taking longer than expected to respond. Please try again.";
      } else if (error.response?.data) {
        if (error.response.data.details?.message) {
          errorMessage = error.response.data.details.message;
        } else if (error.response.data.details?.errors) {
          // Handle validation errors
          const errors = [];
          Object.keys(error.response.data.details.errors).forEach(field => {
            const fieldError = error.response.data.details.errors[field];
            if (typeof fieldError === 'string') {
              errors.push(`${field}: ${fieldError}`);
            } else if (Array.isArray(fieldError)) {
              errors.push(`${field}: ${fieldError.join(', ')}`);
            }
          });
          if (errors.length > 0) {
            errorMessage = errors.join('; ');
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Start new conversation
export const startNewConversation = createAsyncThunk(
  "agents/startNewConversation",
  async ({ message, agentId, storeId, newConvo = true }, thunkAPI) => {

    console.log("starting new convo")
    try {
      const requestBody = {
        message: message.trim(),
        agent_id: agentId,
        store_id: storeId,
        new_convo: newConvo
      };

      const response = await axiosInstance.post("/api/agents/chat/comprehensive/", requestBody);

      if (response.data && response.data.details) {
        // Convert markdown response to HTML
        const processedData = processResponseData(response.data.details.data);
        return processedData;
      } else {
        return thunkAPI.rejectWithValue({ message: "No response received" });
      }
    } catch (error) {
      let errorMessage = "Failed to start conversation";

      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = "Request timed out. The server is taking longer than expected to respond. Please try again.";
      } else if (error.response?.data) {
        if (error.response.data.details?.message) {
          errorMessage = error.response.data.details.message;
        } else if (error.response.data.details?.errors) {
          const errors = [];
          Object.keys(error.response.data.details.errors).forEach(field => {
            const fieldError = error.response.data.details.errors[field];
            if (typeof fieldError === 'string') {
              errors.push(`${field}: ${fieldError}`);
            } else if (Array.isArray(fieldError)) {
              errors.push(`${field}: ${fieldError.join(', ')}`);
            }
          });
          if (errors.length > 0) {
            errorMessage = errors.join('; ');
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Continue existing conversation
export const continueConversation = createAsyncThunk(
  "agents/continueConversation",
  async ({ message, agentId, storeId, customerId }, thunkAPI) => {
    try {
    console.log("continuing chat conversation")
      
      const requestBody = {
        message: message.trim(),
        agent_id: agentId,
        store_id: storeId,
        customer_id: customerId
      };

      const response = await axiosInstance.post("/api/agents/chat/comprehensive/", requestBody);

      if (response.data && response.data.details) {
        // Convert markdown response to HTML
        const processedData = processResponseData(response.data.details.data);
        return processedData;
      } else {
        return thunkAPI.rejectWithValue({ message: "No response received" });
      }
    } catch (error) {
      let errorMessage = "Failed to continue conversation";

      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = "Request timed out. The server is taking longer than expected to respond. Please try again.";
      } else if (error.response?.data) {
        if (error.response.data.details?.message) {
          errorMessage = error.response.data.details.message;
        } else if (error.response.data.details?.errors) {
          const errors = [];
          Object.keys(error.response.data.details.errors).forEach(field => {
            const fieldError = error.response.data.details.errors[field];
            if (typeof fieldError === 'string') {
              errors.push(`${field}: ${fieldError}`);
            } else if (Array.isArray(fieldError)) {
              errors.push(`${field}: ${fieldError.join(', ')}`);
            }
          });
          if (errors.length > 0) {
            errorMessage = errors.join('; ');
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
); 