import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService, handleApiError, extractApiData } from "../../services/api";

// 🏪 Store analytics summary
export const fetchStoreAnalytics = createAsyncThunk(
  "analytics/fetchStoreAnalytics",
  async ({ storeId, start_date, end_date }, thunkAPI) => {
    try {
      const response = await apiService.analytics.getStoreAnalytics(storeId, {
        start_date,
        end_date,
      });
      return extractApiData(response);
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: handleApiError(error) });
    }
  }
);

// 📈 Store analytics graph
export const fetchStoreGraph = createAsyncThunk(
  "analytics/fetchStoreGraph",
  async ({ storeId, start_date, end_date }, thunkAPI) => {
    try {
      const response = await apiService.analytics.getStoreGraph(storeId, {
        start_date,
        end_date,
      });
      return extractApiData(response);
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: handleApiError(error) });
    }
  }
);

// 👥 Engaged users summary
export const fetchEngagedAnalytics = createAsyncThunk(
  "analytics/fetchEngagedAnalytics",
  async ({ storeId, start_date, end_date }, thunkAPI) => {
    try {
      const response = await apiService.analytics.getEngagedAnalytics(storeId, {
        start_date,
        end_date,
      });
      return extractApiData(response);
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: handleApiError(error) });
    }
  }
);

// 📊 Engaged users graph
export const fetchEngagedGraph = createAsyncThunk(
  "analytics/fetchEngagedGraph",
  async ({ storeId, start_date, end_date }, thunkAPI) => {
    try {
      const response = await apiService.analytics.getEngagedGraph(storeId, {
        start_date,
        end_date,
      });
      return extractApiData(response);
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: handleApiError(error) });
    }
  }
);

// 🛍️ Product analytics
export const fetchProductAnalytics = createAsyncThunk(
  "analytics/fetchProductAnalytics",
  async ({ storeId, start_date, end_date }, thunkAPI) => {
    try {
      const response = await apiService.analytics.getProductAnalytics(storeId, {
        start_date,
        end_date,
      });
      return extractApiData(response);
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: handleApiError(error) });
    }
  }
);
