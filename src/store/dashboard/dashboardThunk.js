import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService, handleApiError, extractApiData } from "../../services/api";

// Fetch user statistics
export const fetchUserStats = createAsyncThunk(
  "dashboard/fetchUserStats",
  async (_, thunkAPI) => {
    try {
      const response = await apiService.user.getStats();
      return extractApiData(response);
    } catch (error) {
      const errorMessage = handleApiError(error);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);



// Fetch user profile
export const fetchUserProfile = createAsyncThunk(
  "dashboard/fetchUserProfile",
  async (_, thunkAPI) => {
    try {
      const response = await apiService.user.getProfile();
      const data = extractApiData(response);
      
      // Handle case where profile data might be in an array
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
      
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "dashboard/updateUserProfile",
  async ({ userId, profileData }, thunkAPI) => {
    try {
      if (!userId) {
        return thunkAPI.rejectWithValue({ message: "User ID is required" });
      }

      const response = await apiService.user.updatePartialProfile(userId, profileData);
      return extractApiData(response);
    } catch (error) {
      const errorMessage = handleApiError(error);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
); 