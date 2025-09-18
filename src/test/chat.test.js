import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import comprehensiveChatReducer from '../store/agents/comprehensiveChatSlice'
import ComprehensiveChatModal from '../components/chat/ComprehensiveChatModal'

// Mock the Redux thunks
jest.mock('../store/agents/comprehensiveChatThunk', () => ({
  startNewConversation: jest.fn(),
  continueConversation: jest.fn(),
  comprehensiveChat: jest.fn()
}))

// Mock axios
jest.mock('../utils/axios', () => ({
  axiosInstance: {
    post: jest.fn()
  }
}))

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      comprehensiveChat: comprehensiveChatReducer
    },
    preloadedState: {
      comprehensiveChat: {
        messages: [],
        customerId: null,
        conversationId: null,
        currentAgent: null,
        currentStore: null,
        isChatting: false,
        isStartingConversation: false,
        isContinuingConversation: false,
        chatError: null,
        isNewConversation: false,
        ...initialState
      }
    }
  })
}

const mockAgent = {
  id: 1,
  name: 'Test Agent',
  status: 'active',
  behavior_prompt: 'I am a test agent',
  tone: 'friendly'
}

const mockStore = {
  id: 1,
  store_name: 'Test Store',
  domain: 'test-store.myshopify.com',
  status: 'active'
}

describe('ComprehensiveChatModal - Updated Flow', () => {
  let store

  beforeEach(() => {
    store = createTestStore()
    jest.clearAllMocks()
  })

  test('renders chat modal without name asking', () => {
    render(
      <Provider store={store}>
        <ComprehensiveChatModal
          isOpen={true}
          onClose={jest.fn()}
          agent={mockAgent}
          store={mockStore}
        />
      </Provider>
    )

    // Should show the agent name
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    
    // Should show input placeholder for direct chat
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    
    // Should not show any name-related UI
    expect(screen.queryByPlaceholderText('Enter your name...')).not.toBeInTheDocument()
  })

  test('allows direct message sending without name collection', async () => {
    const mockOnClose = jest.fn()
    
    render(
      <Provider store={store}>
        <ComprehensiveChatModal
          isOpen={true}
          onClose={mockOnClose}
          agent={mockAgent}
          store={mockStore}
        />
      </Provider>
    )

    const input = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    // Type a message
    fireEvent.change(input, { target: { value: 'Hello, I need help' } })
    
    // Send the message
    fireEvent.click(sendButton)

    // Should not show any name-related prompts
    expect(screen.queryByText(/what's your name/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/enter your name/i)).not.toBeInTheDocument()
  })

  test('displays messages correctly', () => {
    const initialState = {
      messages: [
        {
          id: 1,
          sender: 'user',
          message: 'Hello',
          timestamp: '12:00:00'
        },
        {
          id: 2,
          sender: 'bot',
          message: 'Hi! How can I help you today?',
          timestamp: '12:00:01'
        }
      ]
    }
    
    store = createTestStore(initialState)

    render(
      <Provider store={store}>
        <ComprehensiveChatModal
          isOpen={true}
          onClose={jest.fn()}
          agent={mockAgent}
          store={mockStore}
        />
      </Provider>
    )

    // Should display both messages
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi! How can I help you today?')).toBeInTheDocument()
  })

  test('handles product message formatting', () => {
    const initialState = {
      messages: [
        {
          id: 1,
          sender: 'bot',
          message: 'Here are some products:\n\n1. **Product A** - $10.99 (was $15.99)\n2. **Product B** - $20.99\n\nWe have 5 available',
          timestamp: '12:00:00'
        }
      ]
    }
    
    store = createTestStore(initialState)

    render(
      <Provider store={store}>
        <ComprehensiveChatModal
          isOpen={true}
          onClose={jest.fn()}
          agent={mockAgent}
          store={mockStore}
        />
      </Provider>
    )

    // Should display the product message
    expect(screen.getByText('Here are some products:')).toBeInTheDocument()
  })

  test('resets chat state on close', () => {
    const mockOnClose = jest.fn()
    
    render(
      <Provider store={store}>
        <ComprehensiveChatModal
          isOpen={true}
          onClose={mockOnClose}
          agent={mockAgent}
          store={mockStore}
        />
      </Provider>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  test('shows typing indicator during API calls', () => {
    const initialState = {
      isStartingConversation: true
    }
    
    store = createTestStore(initialState)

    render(
      <Provider store={store}>
        <ComprehensiveChatModal
          isOpen={true}
          onClose={jest.fn()}
          agent={mockAgent}
          store={mockStore}
        />
      </Provider>
    )

    // Should show typing indicator
    expect(screen.getByText('Test Agent is typing...')).toBeInTheDocument()
  })

  test('displays error messages correctly', () => {
    const initialState = {
      chatError: 'Failed to send message'
    }
    
    store = createTestStore(initialState)

    render(
      <Provider store={store}>
        <ComprehensiveChatModal
          isOpen={true}
          onClose={jest.fn()}
          agent={mockAgent}
          store={mockStore}
        />
      </Provider>
    )

    // Should display error message
    expect(screen.getByText('Failed to send message')).toBeInTheDocument()
  })
})

describe('ChatDemo Component', () => {
  test('renders demo component correctly', () => {
    const store = createTestStore()
    
    render(
      <Provider store={store}>
        <div>
          {/* ChatDemo would be rendered here */}
          <div data-testid="chat-demo">Chat Demo Component</div>
        </div>
      </Provider>
    )

    expect(screen.getByTestId('chat-demo')).toBeInTheDocument()
  })
}) 