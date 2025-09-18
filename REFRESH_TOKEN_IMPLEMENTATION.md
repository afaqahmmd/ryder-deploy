# Automatic Refresh Token Implementation

## Overview

This implementation provides automatic token refresh functionality for the Ryder Partners frontend application. When an access token expires (every 10 minutes), the system automatically refreshes it using the refresh token stored in cookies, ensuring users don't have to repeatedly log in.

## Key Features

- ✅ **Automatic Token Refresh**: Handles expired tokens seamlessly
- ✅ **401 Error Interceptor**: Automatically refreshes tokens on API errors
- ✅ **Proactive Refresh**: Refreshes tokens before they expire (2-minute buffer)
- ✅ **Concurrent Request Handling**: Prevents multiple simultaneous refresh requests
- ✅ **Secure Cookie Storage**: Tokens stored in HTTP cookies with appropriate expiration
- ✅ **Graceful Logout**: Clears all tokens and redirects when refresh fails
- ✅ **React Integration**: Seamless integration with React components and hooks

## Architecture

### Core Components

1. **`refreshTokenService.js`** - Centralized token management service
2. **`tokenManager.js`** - React-friendly token utilities and timers
3. **`useTokenManager.js`** - React hook for component integration
4. **Enhanced `axios.js`** - Interceptors for automatic token handling
5. **Updated API service** - Async/await pattern with error handling

### Flow Diagram

```
User Login/Signup
       ↓
Store tokens in cookies
       ↓
Initialize token refresh timer
       ↓
[User makes API request]
       ↓
Token valid? ──No──→ Refresh token automatically
       ↓                    ↓
      Yes               Retry request
       ↓                    ↓
   Continue            Success/Failure
```

## Implementation Details

### 1. Token Storage

Tokens are stored in HTTP cookies with appropriate expiration times:

```javascript
// Access token: 10 minutes (from backend)
setCookie("token", accessToken, { maxAge: expiresIn });

// Refresh token: 7 days
setCookie("refresh_token", refreshToken, { maxAge: 7 * 24 * 60 * 60 });
```

### 2. Automatic Refresh Triggers

The system refreshes tokens in three scenarios:

1. **Proactive Refresh**: 2 minutes before access token expires
2. **API Error Response**: When receiving 401 Unauthorized
3. **Manual Validation**: Before making authenticated requests

### 3. Token Validation

```javascript
// Check if access token is valid
hasValidAccessToken() {
  const token = this.getAccessToken();
  if (!token) return false;
  
  const payload = JSON.parse(atob(token.split('.')[1]));
  const currentTime = Date.now() / 1000;
  return payload.exp > currentTime;
}
```

### 4. Axios Interceptors

**Request Interceptor:**
```javascript
const RequestInterceptor = async (config) => {
  if (!config.skipAuth) {
    const hasValidToken = await refreshTokenService.ensureValidToken();
    if (hasValidToken) {
      const token = getCookie("token");
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
};
```

**Response Error Interceptor:**
```javascript
const ResponseErrorInterceptor = async (error) => {
  const originalRequest = error.config;
  
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    
    await refreshTokenService.refreshToken();
    const newToken = getCookie("token");
    originalRequest.headers.authorization = `Bearer ${newToken}`;
    
    return axiosInstance(originalRequest);
  }
  
  return Promise.reject(error);
};
```

## Usage Examples

### 1. Basic Component Integration

```jsx
import { useTokenManager } from '../hooks/useTokenManager';

const MyComponent = () => {
  const { isAuthenticated, logout } = useTokenManager();
  
  if (!isAuthenticated()) {
    return <LoginPrompt />;
  }
  
  return (
    <div>
      <button onClick={logout}>Logout</button>
      {/* Your component content */}
    </div>
  );
};
```

### 2. API Service Usage

```javascript
// No special handling needed - automatic refresh is built-in
const userData = await apiService.user.getProfile();
const stores = await apiService.stores.getAll();
```

### 3. Manual Token Refresh

```javascript
import { refreshTokenService } from '../services/refreshTokenService';

// Manual refresh if needed
try {
  await refreshTokenService.refreshToken();
  console.log('Token refreshed successfully');
} catch (error) {
  console.error('Refresh failed:', error);
}
```

## Testing

Use the `TokenRefreshTest` component to test the refresh functionality:

```jsx
import TokenRefreshTest from './components/TokenRefreshTest';

// Add to your router for testing
<Route path="/test-tokens" element={<TokenRefreshTest />} />
```

### Test Scenarios

1. **Token Status Check**: Verify current token state
2. **Manual Refresh**: Test manual token refresh
3. **API Call Auto-Refresh**: Test automatic refresh on API calls
4. **Expired Token Handling**: Wait for expiration and test
5. **Logout Flow**: Test token cleanup and redirection

## Configuration

### Environment Variables

```env
VITE_BACKEND_URL=http://localhost:8000
```

### Token Expiration Settings

- **Access Token**: 10 minutes (configured in backend)
- **Refresh Token**: 7 days (configured in backend)
- **Refresh Buffer**: 2 minutes before expiration
- **Cookie Max Age**: Matches token expiration

## Error Handling

### Automatic Logout Scenarios

The system automatically logs out users when:

1. **No Refresh Token**: User has no refresh token available
2. **Refresh Token Expired**: Refresh token is invalid or expired
3. **API Errors**: Persistent authentication failures
4. **Manual Logout**: User clicks logout button

### Error Messages

- Session expired messages via toast notifications
- Automatic redirection to login page
- Console logging for debugging

## Security Considerations

1. **HTTP-Only Cookies**: Consider using `httpOnly` cookies in production
2. **Secure Transmission**: Use HTTPS in production
3. **Token Validation**: JWT signature verification
4. **Refresh Token Rotation**: Backend rotates refresh tokens
5. **XSS Protection**: Tokens not accessible via JavaScript in production

## Backend Integration

The system integrates with these backend endpoints:

```
POST /api/refresh-token/
{
  "refresh_token": "your_refresh_token"
}

Response:
{
  "details": {
    "data": {
      "access_token": "new_access_token",
      "refresh_token": "new_refresh_token", 
      "expires_in": 600
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Token Refresh Loop**: Check backend response format
2. **CORS Errors**: Ensure backend CORS configuration
3. **Cookie Issues**: Verify cookie settings and domain
4. **Network Errors**: Handle offline scenarios

### Debug Mode

Enable detailed logging by checking browser console:

```javascript
// The system logs all refresh operations
console.log("Refreshing access token...");
console.log("Token refreshed successfully");
console.log("Token will be automatically refreshed in X seconds");
```

## Migration from Old System

The new system replaces:

- Manual token checking in components
- Redux-based refresh thunks in components
- Separate timer management
- Manual 401 error handling

Components using the old system should be updated to use the new `useTokenManager` hook and rely on automatic refresh handling.

## Future Enhancements

Potential improvements:

1. **WebSocket Integration**: Extend to WebSocket connections
2. **Background Refresh**: Service worker-based refresh
3. **Multi-Tab Sync**: Synchronize tokens across browser tabs
4. **Offline Support**: Handle token refresh when offline
5. **Biometric Auth**: Integration with biometric authentication 