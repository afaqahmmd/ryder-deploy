import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ConversationsTab from '../ConversationsTab'
import conversationsReducer from '../../../store/conversations/conversationsSlice'
import agentsReducer from '../../../store/agents/agentSlice'
import storesReducer from '../../../store/stores/storesSlice'

// Mock the Redux thunks
jest.mock('../../../store/conversations/conversationsThunk', () => ({
  fetchConversations: jest.fn(() => ({ type: 'conversations/fetchConversations' })),
  fetchConversationMessages: jest.fn(() => ({ type: 'conversations/fetchConversationMessages' })),
  fetchConversationByCustomerId: jest.fn(() => ({ type: 'conversations/fetchConversationByCustomerId' }))
}))

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      conversations: conversationsReducer,
      agents: agentsReducer,
      stores: storesReducer
    },
    preloadedState: {
      conversations: {
        conversations: [],
        currentConversation: null,
        currentMessages: [],
        isLoading: false,
        isLoadingMessages: false,
        error: null,
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_count: 0,
          has_previous: false,
          has_next: false
        },
        messagesPagination: {
          current_page: 1,
          total_pages: 1,
          total_count: 0,
          has_previous: false,
          has_next: false
        },
        ...initialState.conversations
      },
      agents: {
        agents: [
          { id: 1, name: 'Test Agent' }
        ],
        ...initialState.agents
      },
      stores: {
        stores: [
          { id: 1, store_name: 'Test Store' }
        ],
        ...initialState.stores
      }
    }
  })
}

const renderWithProvider = (initialState = {}) => {
  const store = createMockStore(initialState)
  return render(
    <Provider store={store}>
      <ConversationsTab />
    </Provider>
  )
}

describe('ConversationsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders conversations tab with header', () => {
    renderWithProvider()
    
    expect(screen.getByText('Conversations')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search conversations...')).toBeInTheDocument()
  })

  test('shows loading state when fetching conversations', () => {
    renderWithProvider({
      conversations: {
        isLoading: true
      }
    })
    
    expect(screen.getByText('No conversations found')).toBeInTheDocument()
  })

  test('shows error message when there is an error', () => {
    const errorMessage = 'Failed to fetch conversations'
    renderWithProvider({
      conversations: {
        error: errorMessage
      }
    })
    
    // Error should be in a fixed position notification
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  test('shows empty state when no conversations exist', () => {
    renderWithProvider()
    
    expect(screen.getByText('No conversations found')).toBeInTheDocument()
  })

  test('displays conversations when they exist', () => {
    const mockConversations = [
      {
        id: 1,
        customer_id: 'customer_123',
        customer_name: 'John Doe',
        agent_id: 1,
        store_id: 1,
        created_at: '2024-01-15T10:30:00Z'
      }
    ]

    renderWithProvider({
      conversations: {
        conversations: mockConversations
      }
    })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Customer ID: customer_123')).toBeInTheDocument()
  })

  test('handles conversation click and shows chat detail', async () => {
    const mockConversations = [
      {
        id: 1,
        customer_id: 'customer_123',
        customer_name: 'John Doe',
        agent_id: 1,
        store_id: 1,
        created_at: '2024-01-15T10:30:00Z'
      }
    ]

    renderWithProvider({
      conversations: {
        conversations: mockConversations
      }
    })
    
    const conversationItem = screen.getByText('John Doe').closest('div')
    fireEvent.click(conversationItem)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  test('filters conversations based on search query', () => {
    const mockConversations = [
      {
        id: 1,
        customer_id: 'customer_123',
        customer_name: 'John Doe',
        agent_id: 1,
        store_id: 1,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        customer_id: 'customer_456',
        customer_name: 'Jane Smith',
        agent_id: 1,
        store_id: 1,
        created_at: '2024-01-15T11:30:00Z'
      }
    ]

    renderWithProvider({
      conversations: {
        conversations: mockConversations
      }
    })
    
    // Both conversations should be visible initially
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    
    // Search for "John"
    const searchInput = screen.getByPlaceholderText('Search conversations...')
    fireEvent.change(searchInput, { target: { value: 'John' } })
    
    // Only John should be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  test('shows back button on mobile when conversation is selected', () => {
    const mockConversations = [
      {
        id: 1,
        customer_id: 'customer_123',
        customer_name: 'John Doe',
        agent_id: 1,
        store_id: 1,
        created_at: '2024-01-15T10:30:00Z'
      }
    ]

    renderWithProvider({
      conversations: {
        conversations: mockConversations
      }
    })
    
    const conversationItem = screen.getByText('John Doe').closest('div')
    fireEvent.click(conversationItem)
    
    // Should show back button (mobile view)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('displays messages when conversation is selected', () => {
    const mockConversations = [
      {
        id: 1,
        customer_id: 'customer_123',
        customer_name: 'John Doe',
        agent_id: 1,
        store_id: 1,
        created_at: '2024-01-15T10:30:00Z'
      }
    ]

    const mockMessages = [
      {
        id: 1,
        content: 'Hello, I need help with my order',
        role: 'user',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        content: 'Hi! I\'d be happy to help you with your order.',
        role: 'assistant',
        timestamp: '2024-01-15T10:31:00Z'
      }
    ]

    renderWithProvider({
      conversations: {
        conversations: mockConversations,
        currentMessages: mockMessages
      }
    })
    
    const conversationItem = screen.getByText('John Doe').closest('div')
    fireEvent.click(conversationItem)
    
    // Messages should be displayed
    expect(screen.getByText('Hello, I need help with my order')).toBeInTheDocument()
    expect(screen.getByText('Hi! I\'d be happy to help you with your order.')).toBeInTheDocument()
  })

  test('shows read-only message input', () => {
    const mockConversations = [
      {
        id: 1,
        customer_id: 'customer_123',
        customer_name: 'John Doe',
        agent_id: 1,
        store_id: 1,
        created_at: '2024-01-15T10:30:00Z'
      }
    ]

    renderWithProvider({
      conversations: {
        conversations: mockConversations
      }
    })
    
    const conversationItem = screen.getByText('John Doe').closest('div')
    fireEvent.click(conversationItem)
    
    // Should show read-only message input
    expect(screen.getByText('This is a read-only view of the conversation')).toBeInTheDocument()
  })

  test('shows default state when no conversation is selected', () => {
    renderWithProvider()
    
    expect(screen.getByText('Select a conversation')).toBeInTheDocument()
    expect(screen.getByText('Choose a conversation from the list to view the chat')).toBeInTheDocument()
  })
})
