import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import KnowledgeBaseTab from '../KnowledgeBaseTab'

// Mock the useEmbeddings hook
vi.mock('../../../hooks/useEmbeddings', () => ({
  useEmbeddings: vi.fn(),
}))

// Mock the stores thunk
vi.mock('../../../store/stores/storesThunk', () => ({
  fetchStores: vi.fn(),
  fetchProductCounts: vi.fn(),
}))

// Mock react-redux
const mockStore = configureStore({
  reducer: {
    stores: {
      stores: [
        { id: 1, store_name: 'Test Store 1' },
        { id: 2, store_name: 'Test Store 2' },
      ],
      productCounts: { 1: 10, 2: 20 },
      isLoading: false,
      error: null,
    },
  },
})

const renderWithProvider = (component) => {
  return render(
    <Provider store={mockStore}>
      {component}
    </Provider>
  )
}

describe('KnowledgeBaseTab', () => {
  const mockUseEmbeddings = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    mockUseEmbeddings.mockReturnValue({
      loading: false,
      error: null,
      embeddingStats: null,
      searchResults: [],
      isCreatingEmbeddings: false,
      isSearching: false,
      createEmbeddings: vi.fn(),
      searchEmbeddings: vi.fn(),
      getEmbeddingStats: vi.fn(),
      clearError: vi.fn(),
      clearSearchResults: vi.fn(),
    })

    // Mock the hook
    const { useEmbeddings } = await import('../../../hooks/useEmbeddings')
    useEmbeddings.mockImplementation(mockUseEmbeddings)
  })

  it('should render the component with store selection', () => {
    renderWithProvider(<KnowledgeBaseTab />)

    expect(screen.getByText('Knowledge Base')).toBeInTheDocument()
    expect(screen.getByText('Select a store to manage embeddings and test semantic search')).toBeInTheDocument()
  })

  it('should show store cards in grid', () => {
    renderWithProvider(<KnowledgeBaseTab />)

    expect(screen.getByText('Test Store 1')).toBeInTheDocument()
    expect(screen.getByText('Test Store 2')).toBeInTheDocument()
    expect(screen.getByText('10 products')).toBeInTheDocument()
    expect(screen.getByText('20 products')).toBeInTheDocument()
  })

  it('should show create embeddings section when store is selected but no embeddings exist', () => {
    mockUseEmbeddings.mockReturnValue({
      loading: false,
      error: null,
      embeddingStats: null,
      searchResults: [],
      isCreatingEmbeddings: false,
      isSearching: false,
      createEmbeddings: vi.fn(),
      searchEmbeddings: vi.fn(),
      getEmbeddingStats: vi.fn(),
      clearError: vi.fn(),
      clearSearchResults: vi.fn(),
    })

    renderWithProvider(<KnowledgeBaseTab />)

    // Click on a store card
    const storeCard = screen.getByText('Test Store 1').closest('div')
    fireEvent.click(storeCard)

    expect(screen.getByText('No Embeddings Found')).toBeInTheDocument()
    expect(screen.getByText('Create Embeddings')).toBeInTheDocument()
  })

  it('should show embedding status when embeddings exist', () => {
    mockUseEmbeddings.mockReturnValue({
      loading: false,
      error: null,
      embeddingStats: {
        vectors_count: 45,
        points_count: 24,
        status: 'green',
        collection_name: 'store_1_products',
      },
      searchResults: [],
      isCreatingEmbeddings: false,
      isSearching: false,
      createEmbeddings: vi.fn(),
      searchEmbeddings: vi.fn(),
      getEmbeddingStats: vi.fn(),
      clearError: vi.fn(),
      clearSearchResults: vi.fn(),
    })

    renderWithProvider(<KnowledgeBaseTab />)

    // Click on a store card
    const storeCard = screen.getByText('Test Store 1').closest('div')
    fireEvent.click(storeCard)

    expect(screen.getByText('24 products embeddings exist')).toBeInTheDocument()
    expect(screen.getByText('Status: Active')).toBeInTheDocument()
  })

  it('should show search functionality when embeddings exist', () => {
    mockUseEmbeddings.mockReturnValue({
      loading: false,
      error: null,
      embeddingStats: {
        vectors_count: 45,
        points_count: 24,
        status: 'green',
        collection_name: 'store_1_products',
      },
      searchResults: [],
      isCreatingEmbeddings: false,
      isSearching: false,
      createEmbeddings: vi.fn(),
      searchEmbeddings: vi.fn(),
      getEmbeddingStats: vi.fn(),
      clearError: vi.fn(),
      clearSearchResults: vi.fn(),
    })

    renderWithProvider(<KnowledgeBaseTab />)

    // Click on a store card
    const storeCard = screen.getByText('Test Store 1').closest('div')
    fireEvent.click(storeCard)

    expect(screen.getByText('Test Semantic Search')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter product name or category to search...')).toBeInTheDocument()
  })

  it('should show error message when there is an error', () => {
    mockUseEmbeddings.mockReturnValue({
      loading: false,
      error: 'Failed to create embeddings',
      embeddingStats: null,
      searchResults: [],
      isCreatingEmbeddings: false,
      isSearching: false,
      createEmbeddings: vi.fn(),
      searchEmbeddings: vi.fn(),
      getEmbeddingStats: vi.fn(),
      clearError: vi.fn(),
      clearSearchResults: vi.fn(),
    })

    renderWithProvider(<KnowledgeBaseTab />)

    expect(screen.getByText('Failed to create embeddings')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    mockUseEmbeddings.mockReturnValue({
      loading: true,
      error: null,
      embeddingStats: null,
      searchResults: [],
      isCreatingEmbeddings: false,
      isSearching: false,
      createEmbeddings: vi.fn(),
      searchEmbeddings: vi.fn(),
      getEmbeddingStats: vi.fn(),
      clearError: vi.fn(),
      clearSearchResults: vi.fn(),
    })

    renderWithProvider(<KnowledgeBaseTab />)

    expect(screen.getByText('Loading embedding statistics...')).toBeInTheDocument()
  })

  it('should show search results when available', () => {
    const mockSearchResults = [
      {
        score: 0.85,
        title: 'Test Product',
        description: 'Test description',
        price: '$99.99',
        rating: 4.5,
        metadata: {
          store_id: 1,
          product_type: 'Shoes',
          vendor: 'Test Vendor',
        },
      },
    ]

    mockUseEmbeddings.mockReturnValue({
      loading: false,
      error: null,
      embeddingStats: null,
      searchResults: mockSearchResults,
      isCreatingEmbeddings: false,
      isSearching: false,
      createEmbeddings: vi.fn(),
      searchEmbeddings: vi.fn(),
      getEmbeddingStats: vi.fn(),
      clearError: vi.fn(),
      clearSearchResults: vi.fn(),
    })

    renderWithProvider(<KnowledgeBaseTab />)

    // Select a store and trigger search results display
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '1' } })

    // Simulate showing search results
    const testSearchButton = screen.getByText('Test Search')
    fireEvent.click(testSearchButton)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('85.0%')).toBeInTheDocument() // score
    expect(screen.getByText('$99.99')).toBeInTheDocument() // price
  })
}) 