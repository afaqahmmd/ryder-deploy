import { startTokenRefreshTimer } from '../utils/tokenManager';

// Mock dispatch function
const mockDispatch = jest.fn();

describe('startTokenRefreshTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should not throw error when called with valid parameters', () => {
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour from now
    
    expect(() => {
      startTokenRefreshTimer(mockDispatch, expiresAt);
    }).not.toThrow();
  });

  test('should handle undefined expiresAt gracefully', () => {
    expect(() => {
      startTokenRefreshTimer(mockDispatch, undefined);
    }).not.toThrow();
  });

  test('should handle expired token gracefully', () => {
    const expiresAt = Date.now() - (60 * 60 * 1000); // 1 hour ago
    
    expect(() => {
      startTokenRefreshTimer(mockDispatch, expiresAt);
    }).not.toThrow();
  });

  test('should set up timer for valid expiration time', () => {
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes from now
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    startTokenRefreshTimer(mockDispatch, expiresAt);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Setting up token refresh timer')
    );
    
    consoleSpy.mockRestore();
  });
});
