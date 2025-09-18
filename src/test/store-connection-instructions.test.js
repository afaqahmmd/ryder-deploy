import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, test, expect, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import Stores from '../components/Stores'
import shopifyReducer from '../store/shopify/shopifySlice'

// Mock toast notifications
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock axios
vi.mock('../utils/axios', () => ({
  axiosInstance: {
    get: vi.fn(() => Promise.resolve({ data: { details: { data: [] } } })),
    post: vi.fn(() => Promise.resolve({ data: { details: { data: { id: 1 }, message: 'Success' } } })),
    delete: vi.fn(() => Promise.resolve())
  }
}))

// Mock encryption
vi.mock('../utils/encryption', () => ({
  encryptData: vi.fn((data) => ({ encryptedData: JSON.stringify(data) }))
}))

// Mock cookies
vi.mock('cookies-next', () => ({
  getCookie: vi.fn(() => 'mock-token')
}))

describe('Store Connection Instructions Enhancement', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        shopify: shopifyReducer
      }
    })
    
    // Clear localStorage before each test
    localStorage.clear()
  })

  const renderStoresComponent = () => {
    return render(
      <Provider store={store}>
        <Stores />
      </Provider>
    )
  }

  test('should display enhanced instructions when connect modal is opened', async () => {
    renderStoresComponent()

    // Click the "Add Store" button to open the modal
    const addStoreButton = screen.getByText('Add Store')
    fireEvent.click(addStoreButton)

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Connect to Shopify')).toBeInTheDocument()
    })

    // Check that the enhanced instructions are present
    expect(screen.getByText('📋 Step-by-Step Guide to Get Your Shopify Credentials')).toBeInTheDocument()
    
    // Check getting started section
    expect(screen.getByText('🚀 Getting Started:')).toBeInTheDocument()
    expect(screen.getByText('Go to')).toBeInTheDocument()
    expect(screen.getByText('admin.shopify.com')).toBeInTheDocument()
    expect(screen.getByText('Select the store you want to connect')).toBeInTheDocument()
    expect(screen.getByText('"Apps and sales channels"')).toBeInTheDocument()

    // Check API access configuration section
    expect(screen.getByText('🔐 Configure API Access:')).toBeInTheDocument()
    expect(screen.getByText('Storefront API access')).toBeInTheDocument()
    
    // Check that the scopes are displayed
    const scopesText = screen.getByText(/unauthenticated_write_checkouts/)
    expect(scopesText).toBeInTheDocument()
    expect(scopesText.textContent).toContain('unauthenticated_read_checkouts')
    expect(scopesText.textContent).toContain('unauthenticated_read_content')
    expect(scopesText.textContent).toContain('unauthenticated_write_customers')

    // Check credentials section
    expect(screen.getByText('📝 Get Your Credentials:')).toBeInTheDocument()
    expect(screen.getByText('"API credentials"')).toBeInTheDocument()
    expect(screen.getByText('Install the app')).toBeInTheDocument()
    expect(screen.getByText('Storefront Access Token:')).toBeInTheDocument()
    expect(screen.getByText('Client ID:')).toBeInTheDocument()
    expect(screen.getByText('Client Secret:')).toBeInTheDocument()

    // Check warning message
    expect(screen.getByText('⚠️ Important: Make sure to enable all the required scopes above for the integration to work properly.')).toBeInTheDocument()
  })

  test('should display all required form fields in the modal', async () => {
    renderStoresComponent()

    // Open the modal
    const addStoreButton = screen.getByText('Add Store')
    fireEvent.click(addStoreButton)

    await waitFor(() => {
      expect(screen.getByText('Connect to Shopify')).toBeInTheDocument()
    })

    // Check that all required form fields are present
    expect(screen.getByPlaceholderText('Your Shopify Client ID')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your Shopify Client Secret')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('your-shop-name.myshopify.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your Storefront API access token')).toBeInTheDocument()
    
    // Check optional fields
    expect(screen.getByText('Store Type (Optional)')).toBeInTheDocument()
    expect(screen.getByText('Store Description (Optional)')).toBeInTheDocument()
  })

  test('should have proper styling for instructions sections', async () => {
    renderStoresComponent()

    // Open the modal
    const addStoreButton = screen.getByText('Add Store')
    fireEvent.click(addStoreButton)

    await waitFor(() => {
      expect(screen.getByText('Connect to Shopify')).toBeInTheDocument()
    })

    // Check that instructions container has proper styling
    const instructionsContainer = screen.getByText('📋 Step-by-Step Guide to Get Your Shopify Credentials').closest('div')
    expect(instructionsContainer).toHaveClass('bg-blue-50', 'border-blue-200', 'rounded-lg')

    // Check that scopes container has monospace font
    const scopesContainer = screen.getByText(/unauthenticated_write_checkouts/).closest('div')
    expect(scopesContainer).toHaveClass('font-mono', 'bg-blue-100')

    // Check warning section styling
    const warningContainer = screen.getByText('⚠️ Important: Make sure to enable all the required scopes above for the integration to work properly.').closest('div')
    expect(warningContainer).toHaveClass('bg-amber-50', 'border-amber-200')
  })

  test('should close modal when cancel button is clicked', async () => {
    renderStoresComponent()

    // Open the modal
    const addStoreButton = screen.getByText('Add Store')
    fireEvent.click(addStoreButton)

    await waitFor(() => {
      expect(screen.getByText('Connect to Shopify')).toBeInTheDocument()
    })

    // Click cancel button
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByText('Connect to Shopify')).not.toBeInTheDocument()
    })
  })

  test('should validate required fields before submission', async () => {
    renderStoresComponent()

    // Open the modal
    const addStoreButton = screen.getByText('Add Store')
    fireEvent.click(addStoreButton)

    await waitFor(() => {
      expect(screen.getByText('Connect to Shopify')).toBeInTheDocument()
    })

    // Try to submit without filling required fields
    const connectButton = screen.getByRole('button', { name: /Connect Store/ })
    fireEvent.click(connectButton)

    // Form should prevent submission (HTML5 validation)
    const clientIdInput = screen.getByPlaceholderText('Your Shopify Client ID')
    expect(clientIdInput).toBeRequired()
    
    const clientSecretInput = screen.getByPlaceholderText('Your Shopify Client Secret')
    expect(clientSecretInput).toBeRequired()
    
    const shopDomainInput = screen.getByPlaceholderText('your-shop-name.myshopify.com')
    expect(shopDomainInput).toBeRequired()
    
    const storefrontTokenInput = screen.getByPlaceholderText('Your Storefront API access token')
    expect(storefrontTokenInput).toBeRequired()
  })
})