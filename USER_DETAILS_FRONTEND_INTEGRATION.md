# User Details Frontend Integration

## Overview
This document describes the frontend integration for displaying user details in the dashboard. The system fetches user information from the backend API and displays the username in the sidebar instead of the static "Ryder Partners AI Chatbot Platform" text.

## Implementation Details

### 1. API Service Integration
- **File**: `src/services/api.js`
- **Added**: `getDetails()` method to the user API service
- **Endpoint**: `/api/details/`
- **Authentication**: Required (JWT Bearer Token)

### 2. Redux Store Integration
- **File**: `src/store/login/userThunk.js` (New)
- **Purpose**: Async thunk for fetching user details
- **Error Handling**: Comprehensive error handling with user-friendly messages

- **File**: `src/store/login/loginSlice.js` (Updated)
- **Added**: Reducers for `fetchUserDetails` pending, fulfilled, and rejected states
- **State Management**: Stores user data in Redux store

### 3. Component Updates

#### Dashboard Component
- **File**: `src/components/Dashboard.jsx`
- **Changes**: 
  - Import `fetchUserDetails` thunk
  - Dispatch `fetchUserDetails()` on component mount
  - Automatically fetches user data when dashboard loads

#### Sidebar Component
- **File**: `src/components/Sidebar.jsx`
- **Changes**:
  - Import `useSelector` from Redux
  - Get user data from Redux store
  - Display username in header instead of static text
  - Display email as subtitle
  - Fallback to original text if user data is not available

## User Interface Changes

### Before
```
┌─────────────────────────┐
│ 🤖 Ryder Partners       │
│    AI Chatbot Platform  │
└─────────────────────────┘
```

### After
```
┌─────────────────────────┐
│ 🤖 John Doe             │
│    john@example.com     │
└─────────────────────────┘
```

## Data Flow

1. **Dashboard Mount**: Component dispatches `fetchUserDetails()`
2. **API Call**: Thunk calls `/api/details/` endpoint
3. **Redux Update**: User data stored in Redux store
4. **UI Update**: Sidebar automatically re-renders with user data
5. **Fallback**: If API fails, displays original static text

## Error Handling

### API Errors
- Network errors are logged to console
- User-friendly error messages displayed
- Fallback to static text if user data unavailable

### Authentication Errors
- 401 errors handled by axios interceptor
- Automatic token refresh attempted
- Redirect to login if refresh fails

## Testing

### Test Coverage
- **File**: `src/components/__tests__/UserDetails.test.jsx`
- **Tests**:
  - Sidebar displays username when user data available
  - Sidebar displays fallback text when user data unavailable
  - Dashboard dispatches fetchUserDetails on mount
  - Partial user data handling

### Running Tests
```bash
npm test UserDetails.test.jsx
```

## Configuration

### Environment Variables
No additional environment variables required. Uses existing API configuration.

### API Endpoint
- **URL**: `/api/details/`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

## Security Considerations

- User data only fetched for authenticated users
- JWT token required for API access
- No sensitive data (password) displayed in UI
- Automatic token refresh on expiration

## Performance Considerations

- User data fetched once on dashboard mount
- Cached in Redux store for subsequent renders
- No unnecessary re-fetches
- Optimistic UI updates

## Future Enhancements

1. **User Profile Updates**: Allow users to update their username
2. **Avatar Support**: Display user profile pictures
3. **Real-time Updates**: WebSocket integration for live user data
4. **Caching**: Implement persistent caching for user data
5. **Offline Support**: Cache user data for offline access

## Troubleshooting

### Common Issues

1. **User data not displaying**
   - Check browser console for API errors
   - Verify JWT token is valid
   - Check Redux DevTools for state updates

2. **API calls failing**
   - Verify backend endpoint is running
   - Check network connectivity
   - Validate JWT token format

3. **Fallback text showing**
   - User data may not be loaded yet
   - API may have returned error
   - Check Redux store state

### Debug Commands
```javascript
// Check Redux state
console.log(store.getState().login.user)

// Check API response
console.log(response.data)

// Check component props
console.log(user)
```
