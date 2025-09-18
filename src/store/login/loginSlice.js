import { createSlice } from "@reduxjs/toolkit";
import { loginUser } from "./loginThunk";
import { fetchUserDetails } from "./userThunk";
import { getCookie } from "cookies-next";
import { logout } from "../../utils/authUtils";

const initialState = {
  user: null,
  tokens: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  expiresAt: null,
};

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.expiresAt = null;
      state.error = null;
      
      // Use the centralized logout utility
      logout();
    },
    clearLoginError: (state) => {
      state.error = null;
    },
    addUser: (state) => {
      // Check for existing user session
      const token = getCookie("token");
      
      if (token) {
        state.isAuthenticated = true;
        // You might want to decode the token to get user info
        // For now, we'll just mark as authenticated
      }
    },
    setAuthState: (state, action) => {
      const { user, tokens, expiresAt } = action.payload;
      state.user = user;
      state.tokens = tokens;
      state.expiresAt = expiresAt;
      state.isAuthenticated = true;
    },
    restoreSession: (state, action) => {
      const { user, tokens, expiresAt } = action.payload;
      state.user = user;
      state.tokens = tokens;
      state.expiresAt = expiresAt;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login user cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.expiresAt = action.payload.expiresAt;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Login failed";
        state.isAuthenticated = false;
      })

      // Fetch user details cases
      .addCase(fetchUserDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch user details";
      });
  },
});

export const { logoutUser, addUser, clearLoginError, setAuthState, restoreSession } = loginSlice.actions;
export default loginSlice.reducer;
