# Logout Implementation

## Overview

This implementation provides a centralized logout functionality that clears all authentication tokens and redirects users to the login page. The logout process is consistent across all components and handles both manual logout and session expiration scenarios.

## Key Features

- ✅ **Centralized Logout**: Single utility function handles all logout scenarios
- ✅ **Token Cleanup**: Removes all tokens from cookies and localStorage
- ✅ **Automatic Redirect**: Redirects to login page after logout
- ✅ **Success Message**: Shows confirmation message to user
- ✅ **Session Expiration**: Handles automatic logout on token expiration
- ✅ **Redux Integration**: Updates Redux state on logout
- ✅ **Consistent Behavior**: Same logout behavior across all components

## Architecture

### Core Components

1. **`authUtils.js`** - Centralized authentication utilities
2. **`loginSlice.js`** - Redux slice for login state management
3. **`signupSlice.js`** - Redux slice for signup state management
4. **`refreshTokenService.js`** - Token refresh and session management
5. **`Dashboard.jsx`** - Main component with logout button

### Flow Diagram

```
User clicks logout
       ↓
Dispatch Redux action
       ↓
Clear Redux state
       ↓
Call centralized logout utility
       ↓
Clear cookies and localStorage
       ↓
Show success message
       ↓
Redirect to login page
```

## Implementation Details

### 1. Centralized Logout Utility (`authUtils.js`)

The main logout function handles all cleanup and redirection:

```javascript
export const logout = () => {
  // Clear all tokens and session data
  deleteCookie("token");
  deleteCookie("refresh_token");
  localStorage.removeItem("user_session");
  localStorage.removeItem("shopify_session");
  
  // Show logout message
  toast.success("Successfully logged out");
  
  // Redirect to login page
  if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
    window.location.href = "/login";
  }
};
```

### 2. Session Expiration Handler

For automatic logout on token expiration:

```javascript
export const handleSessionExpiration = (message = "Session expired. Please log in again.") => {
  // Clear all tokens and session data
  deleteCookie("token");
  deleteCookie("refresh_token");
  localStorage.removeItem("user_session");
  localStorage.removeItem("shopify_session");
  
  // Show error message
  toast.error(message);
  
  // Redirect to login page
  if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
    window.location.href = "/login";
  }
};
```

### 3. Redux Integration

Both login and signup slices have logout actions that:
- Clear the Redux state
- Call the centralized logout utility
- Handle state cleanup

```javascript
logoutUser: (state) => {
  state.user = null;
  state.tokens = null;
  state.isAuthenticated = false;
  state.expiresAt = null;
  state.error = null;
  
  // Use the centralized logout utility
  logout();
}
```

### 4. Component Integration

The Dashboard component determines which logout action to use based on authentication state:

```javascript
const handleLogout = () => {
  // Determine which logout action to use based on authentication state
  const isLoginUser = loginState.isAuthenticated;
  
  if (isLoginUser) {
    dispatch(logoutLoginUser());
  } else {
    dispatch(logoutSignupUser());
  }
};
```

## Usage Examples

### Manual Logout from Component

```javascript
import { logout } from '../utils/authUtils';

const handleLogout = () => {
  logout();
};
```

### Redux Action Logout

```javascript
import { logoutUser } from '../store/login/loginSlice';

const handleLogout = () => {
  dispatch(logoutUser());
};
```

### Session Expiration

```javascript
import { handleSessionExpiration } from '../utils/authUtils';

// When token refresh fails
handleSessionExpiration("Session expired. Please log in again.");
```

## Token Storage

### Cookies
- `token` - Access token (10 minutes expiration)
- `refresh_token` - Refresh token (7 days expiration)

### localStorage
- `user_session` - User session data
- `shopify_session` - Shopify session data

## Security Considerations

1. **Token Cleanup**: All tokens are properly removed from cookies and localStorage
2. **Session Data**: All session-related data is cleared
3. **Redirect Safety**: Only redirects if not already on login/root page
4. **User Feedback**: Shows appropriate success/error messages

## Testing

The implementation includes comprehensive tests in `test/logout.test.js` that verify:

- Token cleanup from cookies and localStorage
- Success message display
- Proper redirection behavior
- Authentication state checking
- Token retrieval functions

## Error Handling

- **Session Expiration**: Automatic logout with error message
- **Token Refresh Failure**: Handles failed token refresh gracefully
- **Network Issues**: Graceful handling of network-related logout scenarios

## Future Enhancements

1. **Logout API Call**: Option to call backend logout endpoint
2. **Analytics**: Track logout events for user behavior analysis
3. **Remember Me**: Handle "remember me" functionality on logout
4. **Multi-tab Support**: Ensure logout works across all browser tabs 