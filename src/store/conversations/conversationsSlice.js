import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchConversations, 
  fetchConversationMessages,
  fetchConversationByCustomerId
} from "./conversationsThunk";
import { toast } from "react-toastify";

const initialState = {
  conversations: [],
  currentConversation: null,
  currentMessages: [],
  isLoading: false,
  isLoadingMessages: false,
  error: null,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_previous: false,
    page_size: 20
  },
  messagesPagination: {
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_previous: false,
    page_size: 50
  }
};

export const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    clearConversationError: (state) => {
      state.error = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.currentMessages = [];
    },
    clearMessages: (state) => {
      state.currentMessages = [];
      state.messagesPagination = {
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        has_next: false,
        has_previous: false,
        page_size: 50
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations cases
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.conversations || [];
        state.pagination = action.payload.pagination || {
          current_page: 1,
          total_pages: 1,
          total_count: 0,
          has_next: false,
          has_previous: false,
          page_size: 20
        };
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch conversations";
        toast.error(state.error);
      })
      
      // Fetch conversation messages cases
      .addCase(fetchConversationMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        state.currentConversation = action.payload.conversation || null;
        state.currentMessages = action.payload.messages || [];
        state.messagesPagination = action.payload.pagination || {
          current_page: 1,
          total_pages: 1,
          total_count: 0,
          has_next: false,
          has_previous: false,
          page_size: 50
        };
        state.error = null;
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload?.message || "Failed to fetch conversation messages";
        toast.error(state.error);
      })
      
      // Fetch conversation by customer ID cases
      .addCase(fetchConversationByCustomerId.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchConversationByCustomerId.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        state.currentConversation = action.payload;
        state.currentMessages = action.payload.messages || [];
        state.error = null;
      })
      .addCase(fetchConversationByCustomerId.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload?.message || "Failed to fetch conversation";
        toast.error(state.error);
      });
  },
});

export const { 
  clearConversationError, 
  setCurrentConversation, 
  clearCurrentConversation,
  clearMessages
} = conversationsSlice.actions;

export default conversationsSlice.reducer;
