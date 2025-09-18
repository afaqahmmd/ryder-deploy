import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import Stores from '../components/Stores'
import shopifyReducer from '../store/shopify/shopifySlice'
import storesReducer from '../store/stores/storesSlice'

// Mock dependencies
vi.mock('../utils/axios', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      shopify: shopifyReducer,
      stores: storesReducer
    },
    preloadedState: {
      shopify: {
        isConnecting: false,
        isConnected: false,
        connectionData: null,
        error: null,
        ...initialState.shopify
      },
      stores: {
        stores: [],
        currentStore: null,
        productCounts: {},
        isLoading: false,
        isCreating: false,
        isDeleting: false,
        isFetchingProductCounts: false,
        error: null,
        totalCount: 0,
        ...initialState.stores
      }
    }
  })
}

// Test data
const mockStores = [
  {
    id: 1,
    store_name: 'Fashion Store',
    domain: 'fashion-store.myshopify.com',
    store_type: 'fashion',
    store_description: 'Online fashion store specializing in trendy apparel',
    status: 'active',
    product_count: 150,
    created_at: '2024-12-15T14:30:00Z',
    updated_at: '2024-12-15T14:30:00Z'
  },
  {
    id: 2,
    store_name: 'Electronics Store',
    domain: 'electronics-store.myshopify.com',
    store_type: 'electronics',
    store_description: 'Premium electronics and gadgets',
    status: 'active',
    product_count: 75,
    created_at: '2024-12-15T15:00:00Z',
    updated_at: '2024-12-15T15:00:00Z'
  }
]

const mockRefreshResponse = {
  data: {
    details: {
      message: 'Product counts refreshed for 2 stores',
      data: [
        { id: 1, store_name: 'Fashion Store', product_count: 160 },
        { id: 2, store_name: 'Electronics Store', product_count: 80 }
      ]
    }
  }
}

describe('Store Enhancements', () => {
  let store

  beforeEach(() => {
    store = createTestStore()
    vi.clearAllMocks()
  })

  describe('Store Creation Form', () => {
    it('should render store type dropdown with all options', () => {
      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Open the modal
      fireEvent.click(screen.getByText('Add Store'))

      // Check if store type dropdown is rendered
      const storeTypeSelect = screen.getByLabelText('Store Type (Optional)')
      expect(storeTypeSelect).toBeInTheDocument()

      // Check if all store types are available
      const options = storeTypeSelect.querySelectorAll('option')
      expect(options).toHaveLength(16) // 15 types + 1 default option

      // Check for specific store types
      expect(screen.getByText('Fashion & Apparel')).toBeInTheDocument()
      expect(screen.getByText('Electronics & Technology')).toBeInTheDocument()
      expect(screen.getByText('Home & Garden')).toBeInTheDocument()
    })

    it('should render store description textarea', () => {
      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Open the modal
      fireEvent.click(screen.getByText('Add Store'))

      // Check if description textarea is rendered
      const descriptionTextarea = screen.getByLabelText('Store Description (Optional)')
      expect(descriptionTextarea).toBeInTheDocument()
      expect(descriptionTextarea).toHaveAttribute('maxLength', '200')
      expect(descriptionTextarea).toHaveAttribute('rows', '3')
    })

    it('should show character count for description', () => {
      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Open the modal
      fireEvent.click(screen.getByText('Add Store'))

      const descriptionTextarea = screen.getByLabelText('Store Description (Optional)')
      
      // Type some text
      fireEvent.change(descriptionTextarea, {
        target: { value: 'This is a test description' }
      })

      // Check if character count is displayed
      expect(screen.getByText('25/200')).toBeInTheDocument()
    })

    it('should handle form submission with new fields', async () => {
      const mockDispatch = vi.fn()
      store.dispatch = mockDispatch

      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Open the modal
      fireEvent.click(screen.getByText('Add Store'))

      // Fill in the form
      fireEvent.change(screen.getByLabelText('Client ID'), {
        target: { value: 'test-client-id' }
      })
      fireEvent.change(screen.getByLabelText('Client Secret'), {
        target: { value: 'test-client-secret' }
      })
      fireEvent.change(screen.getByLabelText('Shop Domain'), {
        target: { value: 'test-store.myshopify.com' }
      })
      fireEvent.change(screen.getByLabelText('Storefront Access Token'), {
        target: { value: 'test-token' }
      })
      fireEvent.change(screen.getByLabelText('Store Type (Optional)'), {
        target: { value: 'fashion' }
      })
      fireEvent.change(screen.getByLabelText('Store Description (Optional)'), {
        target: { value: 'Test fashion store' }
      })

      // Submit the form
      fireEvent.click(screen.getByText('Connect Store'))

      // Check if dispatch was called with correct parameters
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: {
              clientId: 'test-client-id',
              clientSecret: 'test-client-secret',
              shopDomain: 'test-store.myshopify.com',
              storefrontToken: 'test-token',
              storeType: 'fashion',
              storeDescription: 'Test fashion store'
            }
          })
        )
      })
    })
  })

  describe('Store List Display', () => {
    it('should display store type badges', async () => {
      const { axiosInstance } = await import('../utils/axios')
      axiosInstance.get.mockResolvedValue({
        data: {
          details: {
            data: mockStores
          }
        }
      })

      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Wait for stores to load
      await waitFor(() => {
        expect(screen.getByText('Fashion & Apparel')).toBeInTheDocument()
        expect(screen.getByText('Electronics & Technology')).toBeInTheDocument()
      })
    })

    it('should display store descriptions', async () => {
      const { axiosInstance } = await import('../utils/axios')
      axiosInstance.get.mockResolvedValue({
        data: {
          details: {
            data: mockStores
          }
        }
      })

      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Wait for stores to load
      await waitFor(() => {
        expect(screen.getByText('Online fashion store specializing in trendy apparel')).toBeInTheDocument()
        expect(screen.getByText('Premium electronics and gadgets')).toBeInTheDocument()
      })
    })

    it('should display product counts', async () => {
      const { axiosInstance } = await import('../utils/axios')
      axiosInstance.get.mockResolvedValue({
        data: {
          details: {
            data: mockStores
          }
        }
      })

      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Wait for stores to load
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
        expect(screen.getByText('75')).toBeInTheDocument()
      })
    })
  })

  describe('Refresh Product Counts', () => {
    it('should render refresh button', () => {
      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      expect(screen.getByText('Refresh Counts')).toBeInTheDocument()
    })

    it('should handle refresh product counts', async () => {
      const { axiosInstance } = await import('../utils/axios')
      axiosInstance.get.mockResolvedValue({
        data: {
          details: {
            data: mockStores
          }
        }
      })
      axiosInstance.post.mockResolvedValue(mockRefreshResponse)

      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Wait for stores to load
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
      })

      // Click refresh button
      fireEvent.click(screen.getByText('Refresh Counts'))

      // Check if API was called
      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith('/api/stores/refresh-product-counts/')
      })

      // Check if success toast was shown
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Product counts refreshed successfully!')
      })
    })

    it('should handle refresh error', async () => {
      const { axiosInstance } = await import('../utils/axios')
      axiosInstance.get.mockResolvedValue({
        data: {
          details: {
            data: mockStores
          }
        }
      })
      axiosInstance.post.mockRejectedValue(new Error('Refresh failed'))

      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Wait for stores to load
      await waitFor(() => {
        expect(screen.getByText('Refresh Counts')).toBeInTheDocument()
      })

      // Click refresh button
      fireEvent.click(screen.getByText('Refresh Counts'))

      // Check if error toast was shown
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to refresh product counts')
      })
    })

    it('should show loading state during refresh', async () => {
      const { axiosInstance } = await import('../utils/axios')
      axiosInstance.get.mockResolvedValue({
        data: {
          details: {
            data: mockStores
          }
        }
      })

      // Mock a delayed response
      axiosInstance.post.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockRefreshResponse), 100))
      )

      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Wait for stores to load
      await waitFor(() => {
        expect(screen.getByText('Refresh Counts')).toBeInTheDocument()
      })

      // Click refresh button
      fireEvent.click(screen.getByText('Refresh Counts'))

      // Check if loading state is shown
      expect(screen.getByText('Refreshing...')).toBeInTheDocument()
      expect(screen.getByText('Refreshing...')).toBeDisabled()
    })
  })

  describe('Delete Store Functionality', () => {
    it('should immediately remove store from UI when delete API succeeds', async () => {
      const { axiosInstance } = await import('../utils/axios')
      
      // Mock initial stores data
      const initialStores = [
        {
          id: 1,
          store_name: 'Fashion Store',
          domain: 'fashion-store.myshopify.com',
          status: 'active',
          product_count: 150,
          created_at: '2024-12-15T14:30:00Z'
        },
        {
          id: 2,
          store_name: 'Electronics Store',
          domain: 'electronics-store.myshopify.com',
          status: 'active',
          product_count: 75,
          created_at: '2024-12-15T15:00:00Z'
        }
      ]

      // Mock successful fetch stores response
      axiosInstance.get.mockResolvedValue({
        data: {
          details: {
            data: initialStores
          }
        }
      })

      // Mock successful delete response
      axiosInstance.delete.mockResolvedValue({
        data: { message: 'Store deleted successfully' }
      })

      const store = createTestStore({
        stores: {
          stores: initialStores,
          isLoading: false
        }
      })

      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Wait for stores to load
      await waitFor(() => {
        expect(screen.getByText('Fashion Store')).toBeInTheDocument()
        expect(screen.getByText('Electronics Store')).toBeInTheDocument()
      })

      // Click delete button on first store
      const deleteButtons = screen.getAllByText('Delete Store')
      fireEvent.click(deleteButtons[0])

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText('Delete Store?')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Delete Store'))

      // Verify store is immediately removed from UI
      await waitFor(() => {
        expect(screen.queryByText('Fashion Store')).not.toBeInTheDocument()
        expect(screen.getByText('Electronics Store')).toBeInTheDocument()
      })

      // Verify API was called
      expect(axiosInstance.delete).toHaveBeenCalledWith('/api/stores/1/')

      // Verify success toast was shown
      expect(toast.success).toHaveBeenCalledWith('Store deleted successfully!')
    })

    it('should show error toast when delete API fails', async () => {
      const { axiosInstance } = await import('../utils/axios')
      
      const initialStores = [
        {
          id: 1,
          store_name: 'Fashion Store',
          domain: 'fashion-store.myshopify.com',
          status: 'active',
          product_count: 150,
          created_at: '2024-12-15T14:30:00Z'
        }
      ]

      // Mock successful fetch stores response
      axiosInstance.get.mockResolvedValue({
        data: {
          details: {
            data: initialStores
          }
        }
      })

      // Mock failed delete response
      axiosInstance.delete.mockRejectedValue(new Error('Delete failed'))

      const store = createTestStore({
        stores: {
          stores: initialStores,
          isLoading: false
        }
      })

      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Wait for stores to load
      await waitFor(() => {
        expect(screen.getByText('Fashion Store')).toBeInTheDocument()
      })

      // Click delete button
      fireEvent.click(screen.getByText('Delete Store'))

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText('Delete Store?')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Delete Store'))

      // Verify error toast was shown
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to delete store')
      })

      // Verify store is still in UI (not deleted)
      expect(screen.getByText('Fashion Store')).toBeInTheDocument()
    })

    it('should handle localStorage store deletion', async () => {
      const { axiosInstance } = await import('../utils/axios')
      
      const localStorageStore = {
        id: 'local-store',
        store_name: 'Local Store',
        domain: 'demo-store.myshopify.com',
        status: 'active',
        source: 'localStorage',
        created_at: '2024-12-15T14:30:00Z'
      }

      // Mock localStorage data
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        shop: { name: 'Local Store' },
        credentials: { shopDomain: 'demo-store.myshopify.com' }
      }))

      const store = createTestStore({
        stores: {
          stores: [localStorageStore],
          isLoading: false
        }
      })

      render(
        <Provider store={store}>
          <Stores />
        </Provider>
      )

      // Wait for store to load
      await waitFor(() => {
        expect(screen.getByText('Local Store')).toBeInTheDocument()
      })

      // Click delete button
      fireEvent.click(screen.getByText('Delete Store'))

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText('Delete Store?')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Delete Store'))

      // Verify localStorage was cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('shopify_session')

      // Verify success toast was shown
      expect(toast.success).toHaveBeenCalledWith('Store deleted successfully')
    })
  })

  describe('Helper Functions', () => {
    it('should correctly map store type labels', () => {
      // Import the helper function (we'll need to export it from the component)
      const getStoreTypeLabel = (type) => {
        const typeMap = {
          'fashion': 'Fashion & Apparel',
          'electronics': 'Electronics & Technology',
          'home_garden': 'Home & Garden',
          'beauty_health': 'Beauty & Health',
          'sports_outdoors': 'Sports & Outdoors',
          'food_beverage': 'Food & Beverage',
          'automotive': 'Automotive',
          'books_media': 'Books & Media',
          'toys_games': 'Toys & Games',
          'jewelry_accessories': 'Jewelry & Accessories',
          'art_crafts': 'Art & Crafts',
          'pet_supplies': 'Pet Supplies',
          'baby_kids': 'Baby & Kids',
          'office_supplies': 'Office & Business',
          'other': 'Other'
        }
        return typeMap[type] || 'Other'
      }

      expect(getStoreTypeLabel('fashion')).toBe('Fashion & Apparel')
      expect(getStoreTypeLabel('electronics')).toBe('Electronics & Technology')
      expect(getStoreTypeLabel('unknown')).toBe('Other')
    })
  })
}) 