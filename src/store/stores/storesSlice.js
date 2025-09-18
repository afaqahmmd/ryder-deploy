import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchStores, 
  createStore, 
  fetchStoreById,
  deleteStore,
  fetchProductCounts,
  fetchStoreProductCount,
  fetchProductsList   // ✅ new import
} from "./storesThunk";
import { toast } from "react-toastify";

const initialState = {
  stores: [],
  currentStore: null,
  productCounts: {},
  topProducts: {},   // ✅ new: { [storeId]: [products] }
  isLoading: false,
  isCreating: false,
  isDeleting: false,
  isFetchingProductCounts: false,
  isFetchingTopProducts: false,   // ✅ new
  error: null,
  totalCount: 0,
};

export const storesSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {
    clearStoresError: (state) => {
      state.error = null;
    },
    setCurrentStore: (state, action) => {
      state.currentStore = action.payload;
    },
    clearCurrentStore: (state) => {
      state.currentStore = null;
    },
    resetStores: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ============================
      // Fetch stores cases
      // ============================
      .addCase(fetchStores.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stores = action.payload.stores || [];
        state.totalCount = action.payload.count || 0;
        state.error = null;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch stores";
      })

      // ============================
      // Fetch store by ID cases
      // ============================
      .addCase(fetchStoreById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStoreById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStore = action.payload;
        state.error = null;
      })
      .addCase(fetchStoreById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch store";
      })

      // ============================
      // Create store cases
      // ============================
      .addCase(createStore.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.isCreating = false;
        state.stores.push(action.payload);
        state.totalCount += 1;
        state.error = null;
        toast.success("Store created successfully!");
      })
      .addCase(createStore.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || "Failed to create store";
        toast.error(state.error);
      })

      // ============================
      // Delete store cases
      // ============================
      .addCase(deleteStore.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.stores = state.stores.filter(store => store.id !== action.payload.id);
        state.totalCount -= 1;
        if (state.currentStore?.id === action.payload.id) {
          state.currentStore = null;
        }
        state.error = null;
        toast.success("Store deleted successfully!");
      })
      .addCase(deleteStore.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || "Failed to delete store";
        toast.error(state.error);
      })

      // ============================
      // Fetch product counts cases
      // ============================
      .addCase(fetchProductCounts.pending, (state) => {
        state.isFetchingProductCounts = true;
        state.error = null;
      })
      .addCase(fetchProductCounts.fulfilled, (state, action) => {
        state.isFetchingProductCounts = false;
        state.productCounts = action.payload;
        state.error = null;
      })
      .addCase(fetchProductCounts.rejected, (state, action) => {
        state.isFetchingProductCounts = false;
        state.error = action.payload?.message || "Failed to fetch product counts";
      })

      // ============================
      // Fetch single store product count
      // ============================
      .addCase(fetchStoreProductCount.pending, (state) => {
        state.isFetchingProductCounts = true;
        state.error = null;
      })
      .addCase(fetchStoreProductCount.fulfilled, (state, action) => {
        state.isFetchingProductCounts = false;
        if (action.payload.storeId) {
          state.productCounts[action.payload.storeId] = action.payload.count;
        }
        state.error = null;
      })
      .addCase(fetchStoreProductCount.rejected, (state, action) => {
        state.isFetchingProductCounts = false;
        state.error = action.payload?.message || "Failed to fetch store product count";
      })

      // ============================
      // Fetch top products cases
      // ============================
      .addCase(fetchProductsList.pending, (state) => {
        state.isFetchingTopProducts = true;
        state.error = null;
      })
      .addCase(fetchProductsList.fulfilled, (state, action) => {
        state.isFetchingTopProducts = false;
        const { storeId, products } = action.payload || {};
        if (storeId) {
          state.topProducts[storeId] = products || [];
        }
        state.error = null;
      })
      .addCase(fetchProductsList.rejected, (state, action) => {
        state.isFetchingTopProducts = false;
        state.error = action.payload?.message || "Failed to fetch top products";
      });
  },
});

export const { 
  clearStoresError, 
  setCurrentStore, 
  clearCurrentStore,
  resetStores
} = storesSlice.actions;

export default storesSlice.reducer;
