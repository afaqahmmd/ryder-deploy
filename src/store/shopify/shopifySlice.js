import { createSlice } from "@reduxjs/toolkit";
import { connectShopifyStore } from "./shopifyThunk";

const initialState = {
  connectionData: null,
  shop: null,
  credentials: null,
  backend: null,
  isConnecting: false,
  isConnected: false,
  error: null,
};

export const shopifySlice = createSlice({
  name: "shopify",
  initialState,
  reducers: {
    clearShopifyState: (state) => {
      state.connectionData = null;
      state.shop = null;
      state.credentials = null;
      state.backend = null;
      state.isConnected = false;
      state.error = null;
    },
    clearShopifyError: (state) => {
      state.error = null;
    },
    setShopifyConnection: (state, action) => {
      state.connectionData = action.payload;
      state.shop = action.payload.shop;
      state.credentials = action.payload.credentials;
      state.backend = action.payload.backend;
      state.isConnected = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Connect Shopify Store cases
      .addCase(connectShopifyStore.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectShopifyStore.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.connectionData = action.payload;
        state.shop = action.payload.shop;
        state.credentials = action.payload.credentials;
        state.backend = action.payload.backend;
        state.error = null;
      })
      .addCase(connectShopifyStore.rejected, (state, action) => {
        state.isConnecting = false;
        state.isConnected = false;
        state.error = action.payload?.message || "Shopify connection failed";
      });
  },
});

export const { clearShopifyState, clearShopifyError, setShopifyConnection } = shopifySlice.actions;
export default shopifySlice.reducer; 