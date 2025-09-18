import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

export const fetchUserDetails = createAsyncThunk(
  "login/fetchUserDetails",
  async (_, thunkAPI) => {
    try {
      const response = await apiService.user.getDetails();
      
      if (response.data && response.data.details) {
        const { data } = response.data.details;
        return {
          user: data,
          message: response.data.details.message
        };
      } else {
        return thunkAPI.rejectWithValue({ message: "Failed to fetch user details" });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.details?.message || "Failed to fetch user details";
      console.error("Error fetching user details:", error);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);
