import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import loginSlice from '../../store/login/loginSlice'
import Dashboard from '../Dashboard'
import Sidebar from '../Sidebar'

// Mock the API service
jest.mock('../../services/api', () => ({
  apiService: {
    user: {
      getDetails: jest.fn()
    }
  }
}))

// Mock the stores thunk
jest.mock('../../store/stores/storesThunk', () => ({
  fetchStores: jest.fn(() => ({ type: 'mock/fetchStores' })),
  fetchProductCounts: jest.fn(() => ({ type: 'mock/fetchProductCounts' }))
}))

// Mock the user thunk
jest.mock('../../store/login/userThunk', () => ({
  fetchUserDetails: jest.fn(() => ({ type: 'mock/fetchUserDetails' }))
}))

// Mock the theme context
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: jest.fn()
  })
}))

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      login: loginSlice
    },
    preloadedState: {
      login: {
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: true,
        error: null,
        expiresAt: null,
        ...initialState
      }
    }
  })
}

describe('User Details Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Sidebar displays username when user data is available', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'TestUser',
      is_active: true,
      is_authenticated: true
    }

    const store = createTestStore({
      user: mockUser,
      isAuthenticated: true
    })

    render(
      <Provider store={store}>
        <Sidebar 
          activeMainTab="dashboard"
          setActiveMainTab={jest.fn()}
          onLogout={jest.fn()}
        />
      </Provider>
    )

    expect(screen.getByText('TestUser')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  test('Sidebar displays fallback text when user data is not available', () => {
    const store = createTestStore({
      user: null,
      isAuthenticated: true
    })

    render(
      <Provider store={store}>
        <Sidebar 
          activeMainTab="dashboard"
          setActiveMainTab={jest.fn()}
          onLogout={jest.fn()}
        />
      </Provider>
    )

    expect(screen.getByText('Ryder Partners')).toBeInTheDocument()
    expect(screen.getByText('AI Chatbot Platform')).toBeInTheDocument()
  })

  test('Sidebar displays username when only username is available', () => {
    const mockUser = {
      id: 1,
      username: 'TestUser',
      is_active: true,
      is_authenticated: true
    }

    const store = createTestStore({
      user: mockUser,
      isAuthenticated: true
    })

    render(
      <Provider store={store}>
        <Sidebar 
          activeMainTab="dashboard"
          setActiveMainTab={jest.fn()}
          onLogout={jest.fn()}
        />
      </Provider>
    )

    expect(screen.getByText('TestUser')).toBeInTheDocument()
    expect(screen.getByText('AI Chatbot Platform')).toBeInTheDocument()
  })

  test('Dashboard dispatches fetchUserDetails on mount', async () => {
    const store = createTestStore({
      isAuthenticated: true
    })

    const mockDispatch = jest.fn()
    store.dispatch = mockDispatch

    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    )

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'mock/fetchUserDetails' })
    })
  })
})
