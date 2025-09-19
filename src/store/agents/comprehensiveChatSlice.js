import { createSlice } from "@reduxjs/toolkit";
import {
  comprehensiveChat,
  startNewConversation,
  continueConversation,
} from "./comprehensiveChatThunk";
import { toast } from "react-toastify";

const initialState = {
  // Chat state
  messages: [],
  customerId: null,
  conversationId: null,
  currentAgent: null,
  currentStore: null,

  // Loading states
  isChatting: false,
  isBotResponding: false,
  isStartingConversation: false,
  isContinuingConversation: false,

  // Error state
  chatError: null,

  // Chat settings
  isNewConversation: false,
};

export const comprehensiveChatSlice = createSlice({
  name: "comprehensiveChat",
  initialState,
  reducers: {
    clearChatError: (state) => {
      state.chatError = null;
    },
    setCurrentAgent: (state, action) => {
      state.currentAgent = action.payload;
    },
    setCurrentStore: (state, action) => {
      state.currentStore = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setCustomerId: (state, action) => {
      state.customerId = action.payload;
    },
    setConversationId: (state, action) => {
      state.conversationId = action.payload;
    },
    resetChat: (state) => {
      state.messages = [];
      state.customerId = null;
      state.conversationId = null;
      state.currentAgent = null;
      state.currentStore = null;
      state.isNewConversation = false;
      state.chatError = null;
    },
    setIsNewConversation: (state, action) => {
      state.isNewConversation = action.payload;
    },
    setIsBotResponding: (state, action) => {
      state.isBotResponding = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Comprehensive chat cases
      .addCase(comprehensiveChat.pending, (state) => {
        state.isChatting = true;
        state.chatError = null;
      })
      .addCase(comprehensiveChat.fulfilled, (state, action) => {
        state.isChatting = false;
        state.customerId = action.payload.customer_id;
        state.conversationId = action.payload.conversation_id;
        state.chatError = null;
      })
      .addCase(comprehensiveChat.rejected, (state, action) => {
        state.isChatting = false;
        state.chatError = action.payload?.message || "Failed to send message";
        toast.error(state.chatError);
      })

      // Start new conversation cases
      .addCase(startNewConversation.pending, (state) => {
        state.isStartingConversation = true;
        state.chatError = null;
      })
      .addCase(startNewConversation.fulfilled, (state, action) => {
        state.isStartingConversation = false;
        state.customerId = action.payload.customer_id;
        state.conversationId = action.payload.conversation_id;
        state.isNewConversation = false;
        state.chatError = null;
      })
      .addCase(startNewConversation.rejected, (state, action) => {
        state.isStartingConversation = false;
        state.chatError =
          action.payload?.message || "Failed to start conversation";
        toast.error(state.chatError);
      })

      // Continue conversation cases
      .addCase(continueConversation.pending, (state) => {
        state.isContinuingConversation = true;
        state.chatError = null;
      })
      .addCase(continueConversation.fulfilled, (state, action) => {
        state.isContinuingConversation = false;
        state.customerId = action.payload.customer_id;
        state.conversationId = action.payload.conversation_id;
        state.chatError = null;
      })
      .addCase(continueConversation.rejected, (state, action) => {
        state.isContinuingConversation = false;
        state.chatError =
          action.payload?.message || "Failed to continue conversation";
        toast.error(state.chatError);
      });
  },
});

export const {
  clearChatError,
  setCurrentAgent,
  setCurrentStore,
  addMessage,
  clearMessages,
  setCustomerId,
  setConversationId,
  resetChat,
  setIsNewConversation,
  setIsBotResponding
} = comprehensiveChatSlice.actions;

export default comprehensiveChatSlice.reducer;
