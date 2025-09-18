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

describe('Delete Store Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should immediately remove store from UI when delete API succeeds', async () => {
    const { axiosInstance } = await import('../utils/axios')
    
    // Mock initial stores data
    const initialStores = [
      {
        id: 1,
        store_name: 'Test Store 1',
        domain: 'test1.myshopify.com',
        status: 'active',
        product_count: 100,
        created_at: '2024-12-15T14:30:00Z'
      },
      {
        id: 2,
        store_name: 'Test Store 2',
        domain: 'test2.myshopify.com',
        status: 'active',
        product_count: 200,
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
      expect(screen.getByText('Test Store 1')).toBeInTheDocument()
      expect(screen.getByText('Test Store 2')).toBeInTheDocument()
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
      expect(screen.queryByText('Test Store 1')).not.toBeInTheDocument()
      expect(screen.getByText('Test Store 2')).toBeInTheDocument()
    })

    // Verify API was called
    expect(axiosInstance.delete).toHaveBeenCalledWith('/api/stores/1/')

    // Verify success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Store deleted successfully!')
  })

  it('should show error toast and keep store in UI when delete API fails', async () => {
    const { axiosInstance } = await import('../utils/axios')
    
    const initialStores = [
      {
        id: 1,
        store_name: 'Test Store',
        domain: 'test.myshopify.com',
        status: 'active',
        product_count: 100,
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
      expect(screen.getByText('Test Store')).toBeInTheDocument()
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
    expect(screen.getByText('Test Store')).toBeInTheDocument()
  })

  it('should handle loading state during deletion', async () => {
    const { axiosInstance } = await import('../utils/axios')
    
    const initialStores = [
      {
        id: 1,
        store_name: 'Test Store',
        domain: 'test.myshopify.com',
        status: 'active',
        product_count: 100,
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

    // Mock delayed delete response
    axiosInstance.delete.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { message: 'Store deleted successfully' } }), 100))
    )

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
      expect(screen.getByText('Test Store')).toBeInTheDocument()
    })

    // Click delete button
    fireEvent.click(screen.getByText('Delete Store'))

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText('Delete Store?')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Delete Store'))

    // Check if loading state is shown
    expect(screen.getByText('Deleting...')).toBeInTheDocument()
    expect(screen.getByText('Deleting...')).toBeDisabled()

    // Wait for deletion to complete
    await waitFor(() => {
      expect(screen.queryByText('Test Store')).not.toBeInTheDocument()
    })
  })
})
