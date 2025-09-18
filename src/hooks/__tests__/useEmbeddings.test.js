import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEmbeddings } from '../useEmbeddings'

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    embeddings: {
      create: vi.fn(),
      search: vi.fn(),
      getStats: vi.fn(),
    },
  },
  handleApiError: vi.fn((error) => error.message || 'API Error'),
  extractApiData: vi.fn((response) => response.data),
}))

// Mock the token manager
vi.mock('../../utils/tokenManager', () => ({
  checkTokenValidity: vi.fn(() => Promise.resolve(true)),
  getAccessToken: vi.fn(() => 'mock-access-token'),
}))

describe('useEmbeddings', () => {
  let mockApiService
  let mockHandleApiError
  let mockExtractApiData

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Get the mocked functions
    const apiModule = await import('../../services/api')
    mockApiService = apiModule.apiService.embeddings
    mockHandleApiError = apiModule.handleApiError
    mockExtractApiData = apiModule.extractApiData
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEmbeddings())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.embeddingStats).toBe(null)
    expect(result.current.searchResults).toEqual([])
    expect(result.current.isCreatingEmbeddings).toBe(false)
    expect(result.current.isSearching).toBe(false)
  })

  it('should create embeddings successfully', async () => {
    const mockResponse = {
      data: {
        success: true,
        store_id: 123,
        products_processed: 45,
        embeddings_created: 45,
      },
    }

    mockApiService.create.mockResolvedValue(mockResponse)
    mockExtractApiData.mockReturnValue(mockResponse.data)
    mockApiService.getStats.mockResolvedValue({
      data: { vectors_count: 45, points_count: 45, status: 'green' },
    })

    const { result } = renderHook(() => useEmbeddings())

    await act(async () => {
      const response = await result.current.createEmbeddings(123)
      expect(response).toEqual(mockResponse.data)
    })

    expect(result.current.isCreatingEmbeddings).toBe(false)
    expect(result.current.error).toBe(null)
    expect(mockApiService.create).toHaveBeenCalledWith(123)
  })

  it('should handle create embeddings error', async () => {
    const mockError = new Error('Failed to create embeddings')
    mockApiService.create.mockRejectedValue(mockError)
    mockHandleApiError.mockReturnValue('Failed to create embeddings')

    const { result } = renderHook(() => useEmbeddings())

    await act(async () => {
      try {
        await result.current.createEmbeddings(123)
      } catch (error) {
        expect(error.message).toBe('Failed to create embeddings')
      }
    })

    expect(result.current.isCreatingEmbeddings).toBe(false)
    expect(result.current.error).toBe('Failed to create embeddings')
  })

  it('should search embeddings successfully', async () => {
    const mockResponse = {
      data: {
        results: [
          {
            score: 0.85,
            title: 'Test Product',
            description: 'Test description',
            price: '$99.99',
          },
        ],
      },
    }

    mockApiService.search.mockResolvedValue(mockResponse)
    mockExtractApiData.mockReturnValue(mockResponse.data)

    const { result } = renderHook(() => useEmbeddings())

    await act(async () => {
      const response = await result.current.searchEmbeddings('test query', 123, 10)
      expect(response).toEqual(mockResponse.data.results)
    })

    expect(result.current.isSearching).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.searchResults).toEqual(mockResponse.data.results)
    expect(mockApiService.search).toHaveBeenCalledWith('test query', 123, 10)
  })

  it('should get embedding stats successfully', async () => {
    const mockResponse = {
      data: {
        vectors_count: 45,
        points_count: 45,
        status: 'green',
        collection_name: 'store_123_products',
      },
    }

    mockApiService.getStats.mockResolvedValue(mockResponse)
    mockExtractApiData.mockReturnValue(mockResponse.data)

    const { result } = renderHook(() => useEmbeddings())

    await act(async () => {
      const response = await result.current.getEmbeddingStats(123)
      expect(response).toEqual(mockResponse.data)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.embeddingStats).toEqual(mockResponse.data)
    expect(mockApiService.getStats).toHaveBeenCalledWith(123, null)
  })

  it('should clear error', () => {
    const { result } = renderHook(() => useEmbeddings())

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBe(null)
  })

  it('should clear search results', () => {
    const { result } = renderHook(() => useEmbeddings())

    act(() => {
      result.current.clearSearchResults()
    })

    expect(result.current.searchResults).toEqual([])
  })
}) 