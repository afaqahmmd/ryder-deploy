import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService, handleApiError, extractApiData } from "../../services/api";
import { axiosInstance } from "../../utils/axios";

// Fetch all stores
export const fetchStores = createAsyncThunk(
  "stores/fetchStores",
  async (_, thunkAPI) => {
    try {
      const response = await apiService.stores.getAll();
      const data = extractApiData(response);

      return {
        stores: Array.isArray(data) ? data : data.stores || [],
        count: data.count || (Array.isArray(data) ? data.length : 0),
        message: data.message,
      };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Fetch store by ID
export const fetchStoreById = createAsyncThunk(
  "stores/fetchStoreById",
  async (storeId, thunkAPI) => {
    try {
      if (!storeId) {
        return thunkAPI.rejectWithValue({ message: "Store ID is required" });
      }

      const response = await apiService.stores.getById(storeId);
      return extractApiData(response);
    } catch (error) {
      const errorMessage = handleApiError(error);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Create store
export const createStore = createAsyncThunk(
  "stores/createStore",
  async (storeData, thunkAPI) => {
    try {
      // Validate required fields
      const requiredFields = [
        "store_name",
        "domain",
        "client_id",
        "client_secret",
        "access_token",
      ];
      const missingFields = requiredFields.filter((field) => !storeData[field]);

      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
        return thunkAPI.rejectWithValue({ message: errorMsg });
      }

      const payload = {
        store_name: storeData.store_name,
        domain: storeData.domain,
        client_id: storeData.client_id,
        client_secret: storeData.client_secret,
        access_token: storeData.access_token,
        status: storeData.status || "active",
      };

      const response = await apiService.stores.create(payload);
      return extractApiData(response);
    } catch (error) {
      const errorMessage = handleApiError(error);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Delete store
export const deleteStore = createAsyncThunk(
  "stores/deleteStore",
  async (storeId, thunkAPI) => {
    try {
      if (!storeId) {
        return thunkAPI.rejectWithValue({ message: "Store ID is required" });
      }

      await apiService.stores.delete(storeId);
      return { id: storeId };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Fetch product counts for all stores
export const fetchProductCounts = createAsyncThunk(
  "stores/fetchProductCounts",
  async (_, thunkAPI) => {
    try {
      const response = await apiService.stores.getProductCounts();
      return extractApiData(response);
    } catch (error) {
      const errorMessage = handleApiError(error);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

// Fetch product count for specific store
export const fetchStoreProductCount = createAsyncThunk(
  "stores/fetchStoreProductCount",
  async (storeId, thunkAPI) => {
    try {
      if (!storeId) {
        return thunkAPI.rejectWithValue({ message: "Store ID is required" });
      }

      const response = await apiService.stores.getProductCount(storeId);
      const data = extractApiData(response);

      return {
        storeId: storeId.toString(),
        count: data.count || 0,
      };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

export const fetchProductsList = createAsyncThunk(
  "stores/fetchProductsList",
  async (
    { storeId, page = 1, page_size = 12, query = "" },
    { rejectWithValue }
  ) => {
    try {
      if (!storeId) {
        return rejectWithValue("Store ID is required");
      }
      const response = await axiosInstance.get(
        `api/stores/products/?store_id=${storeId}&page=${page}&page_size=${page_size}&search=${query}`
      );
      const details =
        response.data?.details?.data || response.data?.data || response.data;
      const products = details?.products || [];
      return { storeId, products };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details?.message ||
          error.response?.data?.message ||
          "Failed to fetch products"
      );
    }
  }
);
