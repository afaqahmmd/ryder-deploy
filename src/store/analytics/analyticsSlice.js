import { createSlice } from "@reduxjs/toolkit";
import {
  fetchStoreAnalytics,
  fetchStoreGraph,
  fetchEngagedAnalytics,
  fetchEngagedGraph,
  fetchProductAnalytics,
} from "./analyticsThunk";

const initialState = {
  storeAnalytics: {},      // summary data per store
  storeGraph: {},          // time-series graph data
  engagedAnalytics: {},    // engagement summary
  engagedGraph: {},        // engagement graph
  productAnalytics: {},    // top products per store
  isLoading: false,
  error: null,
};

export const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    resetAnalytics: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Store analytics
      .addCase(fetchStoreAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStoreAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        const { store_id } = action.payload;
        state.storeAnalytics[store_id] = action.payload;
      })
      .addCase(fetchStoreAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })

      // Store graph
      .addCase(fetchStoreGraph.fulfilled, (state, action) => {
        state.isLoading = false;
        const { store_id } = action.payload;
        state.storeGraph[store_id] = action.payload;
      })

      // Engaged analytics
      .addCase(fetchEngagedAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        const { store_id } = action.payload;
        state.engagedAnalytics[store_id] = action.payload;
      })

      // Engaged graph
      .addCase(fetchEngagedGraph.fulfilled, (state, action) => {
        state.isLoading = false;
        const { store_id } = action.payload;
        state.engagedGraph[store_id] = action.payload;
      })

      // Product analytics
      .addCase(fetchProductAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        const { store_id } = action.payload;
        state.productAnalytics[store_id] = action.payload;
      });
  },
});

export const { clearAnalyticsError, resetAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
