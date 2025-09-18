import { logout, isAuthenticated, getAccessToken } from '../utils/authUtils';

// Mock cookies-next
jest.mock('cookies-next', () => ({
  deleteCookie: jest.fn(),
  getCookie: jest.fn(),
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '/dashboard',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
    mockLocation.pathname = '/dashboard';
  });

  describe('logout', () => {
    it('should clear all tokens and session data', () => {
      const { deleteCookie } = require('cookies-next');
      const { toast } = require('react-toastify');

      logout();

      // Check that cookies are deleted
      expect(deleteCookie).toHaveBeenCalledWith('token');

      // Check that localStorage is cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_session');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('shopify_session');

      // Check that success message is shown
      expect(toast.success).toHaveBeenCalledWith('Successfully logged out');

      // Check that redirect happens
      expect(mockLocation.href).toBe('/login');
    });

    it('should not redirect if already on login page', () => {
      mockLocation.pathname = '/login';
      const { toast } = require('react-toastify');

      logout();

      expect(toast.success).toHaveBeenCalledWith('Successfully logged out');
      expect(mockLocation.href).toBe(''); // Should not redirect
    });

    it('should not redirect if already on root page', () => {
      mockLocation.pathname = '/';
      const { toast } = require('react-toastify');

      logout();

      expect(toast.success).toHaveBeenCalledWith('Successfully logged out');
      expect(mockLocation.href).toBe(''); // Should not redirect
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      const { getCookie } = require('cookies-next');
      getCookie.mockImplementation((key) => {
        if (key === 'token') return 'valid-token';
        return null;
      });

      const result = isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false when tokens are missing', () => {
      const { getCookie } = require('cookies-next');
      getCookie.mockReturnValue(null);

      const result = isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('should return the access token from cookies', () => {
      const { getCookie } = require('cookies-next');
      getCookie.mockReturnValue('test-access-token');

      const result = getAccessToken();
      expect(result).toBe('test-access-token');
      expect(getCookie).toHaveBeenCalledWith('token');
    });
  });


}); 