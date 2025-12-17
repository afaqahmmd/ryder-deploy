import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService, handleApiError, extractApiData } from "../../services/api";

// Fetch all conversations with optional filters
export const fetchConversations = createAsyncThunk(
  "conversations/fetchConversations",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.conversations.getAll(filters);
      const data = extractApiData(response);
      
      // Handle new response structure with conversations array and pagination
      if (data.conversations && Array.isArray(data.conversations)) {
        return {
          conversations: data.conversations,
          pagination: data.pagination || {}
        };
      }
      
      // Fallback for old response structure
      return Array.isArray(data) ? { conversations: data, pagination: {} } : data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue({ message: errorMessage });
    }
  }
);


// Fetch messages for a specific conversation
export const fetchConversationMessages = createAsyncThunk(
  "conversations/fetchConversationMessages",
  async ({ conversationId, page = 1, pageSize = 50 }, { rejectWithValue }) => {
    try {
      const response = await apiService.conversations.getMessages(conversationId, page, pageSize);
      const data = extractApiData(response);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue({ message: errorMessage });
    }
  }
);

// Fetch conversation by customer ID
export const fetchConversationByCustomerId = createAsyncThunk(
  "conversations/fetchConversationByCustomerId",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await apiService.conversations.getByCustomerId(customerId);
      const data = extractApiData(response);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue({ message: errorMessage });
    }
  }
);
