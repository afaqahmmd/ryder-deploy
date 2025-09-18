import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchUserStats,
  fetchUserProfile
} from "./dashboardThunk";
import { toast } from "react-toastify";

const initialState = {
  userStats: null,
  userProfile: null,
  isLoadingStats: false,
  isLoadingProfile: false,
  error: null,
  lastUpdated: null
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboard: (state) => {
      return initialState;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user stats cases
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoadingStats = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.userStats = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.payload?.message || "Failed to fetch user statistics";
      })

      // Fetch user profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoadingProfile = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false;
        state.userProfile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.error = action.payload?.message || "Failed to fetch user profile";
      });
  },
});

export const { 
  clearDashboardError, 
  resetDashboard,
  setUserProfile
} = dashboardSlice.actions;

export default dashboardSlice.reducer; 