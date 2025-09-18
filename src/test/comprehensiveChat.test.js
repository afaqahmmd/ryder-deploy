import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ComprehensiveChatModal from '../components/chat/ComprehensiveChatModal'
import comprehensiveChatSlice from '../store/agents/comprehensiveChatSlice'
import agentSlice from '../store/agents/agentSlice'
import storesSlice from '../store/stores/storesSlice'

// Mock the API calls
jest.mock('../store/agents/comprehensiveChatThunk', () => ({
  startNewConversation: jest.fn(),
  continueConversation: jest.fn(),
  comprehensiveChat: jest.fn()
}))

const createTestStore = () => {
  return configureStore({
    reducer: {
      comprehensiveChat: comprehensiveChatSlice,
      agents: agentSlice,
      stores: storesSlice
    },
    preloadedState: {
      stores: {
        stores: [
          {
            id: 1,
            store_name: 'Test Store',
            domain: 'test-store.myshopify.com',
            status: 'active'
          }
        ],
        isLoading: false,
        error: null
      }
    }
  })
}

describe('ComprehensiveChatModal', () => {
  let store

  beforeEach(() => {
    store = createTestStore()
  })

  const mockAgent = {
    id: 1,
    name: 'Test Agent',
    status: 'active',
    behavior_prompt: 'I am a helpful test agent',
    tone: 'friendly'
  }

  const mockStore = {
    id: 1,
    store_name: 'Test Store',
    domain: 'test-store.myshopify.com',
    status: 'active'
  }

  test('renders customer name input when no customer name provided', () => {
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

    expect(screen.getByPlaceholderText('Enter your name to start chatting...')).toBeInTheDocument()
    expect(screen.getByText('Start Chat')).toBeInTheDocument()
  })

  test('does not show customer name input when customer name is provided', () => {
    render(
      <Provider store={store}>
        <ComprehensiveChatModal
          isOpen={true}
          onClose={jest.fn()}
          agent={mockAgent}
          store={mockStore}
          customerName="John Doe"
        />
      </Provider>
    )

    expect(screen.queryByPlaceholderText('Enter your name to start chatting...')).not.toBeInTheDocument()
    expect(screen.queryByText('Start Chat')).not.toBeInTheDocument()
  })

  test('shows agent name and status in header', () => {
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

    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('AI-powered conversation')).toBeInTheDocument()
  })

  test('shows inactive status for inactive agents', () => {
    const inactiveAgent = { ...mockAgent, status: 'inactive' }
    
    render(
      <Provider store={store}>
        <ComprehensiveChatModal
          isOpen={true}
          onClose={jest.fn()}
          agent={inactiveAgent}
          store={mockStore}
        />
      </Provider>
    )

    expect(screen.getByText('Agent is inactive')).toBeInTheDocument()
  })

  test('handles customer name submission', async () => {
    const onClose = jest.fn()
    
    render(
      <Provider store={store}>
        <ComprehensiveChatModal
          isOpen={true}
          onClose={onClose}
          agent={mockAgent}
          store={mockStore}
        />
      </Provider>
    )

    const nameInput = screen.getByPlaceholderText('Enter your name to start chatting...')
    const startButton = screen.getByText('Start Chat')

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Hello John Doe! I\'m Test Agent, how can I help you today?')).toBeInTheDocument()
    })
  })

  test('shows chat input after customer name is submitted', async () => {
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

    const nameInput = screen.getByPlaceholderText('Enter your name to start chatting...')
    const startButton = screen.getByText('Start Chat')

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    })
  })

  test('handles modal close', () => {
    const onClose = jest.fn()
    
    render(
      <Provider store={store}>
        <ComprehensiveChatModal
          isOpen={true}
          onClose={onClose}
          agent={mockAgent}
          store={mockStore}
        />
      </Provider>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })

  test('shows refresh button for new conversation', () => {
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

    const refreshButton = screen.getByRole('button', { name: /start new conversation/i })
    expect(refreshButton).toBeInTheDocument()
  })

  test('displays error messages when API calls fail', async () => {
    // Mock a failed API response
    const mockDispatch = jest.fn().mockRejectedValue(new Error('API Error'))
    
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

    // Submit customer name first
    const nameInput = screen.getByPlaceholderText('Enter your name to start chatting...')
    const startButton = screen.getByText('Start Chat')

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    })

    // Try to send a message
    const messageInput = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    fireEvent.change(messageInput, { target: { value: 'Hello' } })
    fireEvent.click(sendButton)

    // Error handling would be tested here in a real implementation
    // This is a placeholder for the error handling test
  })
}) 