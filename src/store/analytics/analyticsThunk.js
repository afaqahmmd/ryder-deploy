import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService, handleApiError, extractApiData } from "../../services/api";

// Store analytics summary
export const fetchStoreAnalytics = createAsyncThunk(
  "analytics/fetchStoreAnalytics",
  async (storeId, thunkAPI) => {
    try {
      const response = await apiService.analytics.getStoreAnalytics(storeId);
      return extractApiData(response);
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: handleApiError(error) });
    }
  }
);

// Store analytics graph (sales trends, etc.)
export const fetchStoreGraph = createAsyncThunk(
  "analytics/fetchStoreGraph",
  async (storeId, thunkAPI) => {
    try {
      const response = await apiService.analytics.getStoreGraph(storeId);
      return extractApiData(response);
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: handleApiError(error) });
    }
  }
);

// Engaged users summary
export const fetchEngagedAnalytics = createAsyncThunk(
  "analytics/fetchEngagedAnalytics",
  async (storeId, thunkAPI) => {
    try {
      const response = await apiService.analytics.getEngagedAnalytics(storeId);
      return extractApiData(response);
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: handleApiError(error) });
    }
  }
);

// Engaged users graph
export const fetchEngagedGraph = createAsyncThunk(
  "analytics/fetchEngagedGraph",
  async (storeId, thunkAPI) => {
    try {
      const response = await apiService.analytics.getEngagedGraph(storeId);
      return extractApiData(response);
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: handleApiError(error) });
    }
  }
);

// Product analytics
export const fetchProductAnalytics = createAsyncThunk(
  "analytics/fetchProductAnalytics",
  async (storeId, thunkAPI) => {
    try {
      const response = await apiService.analytics.getProductAnalytics(storeId);
      const data = extractApiData(response);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: handleApiError(error) });
    }
  }
);
