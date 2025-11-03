# Session Refresh Implementation Guide

## Overview
Implemented automatic token refresh mechanism to prevent session expiration without user interruption. When a session is about to expire, a modal appears allowing users to refresh their session seamlessly.

## How It Works

### 1. **Session Storage Structure**
```json
{
  "user": { "user": "Rafeh" },
  "tokens": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 900  // 15 minutes in seconds
  },
  "loginTime": "2025-11-03T04:59:43.574Z",
  "sessionId": "user_1762145983574",
  "expiresAt": 1762146883549  // Timestamp in milliseconds
}
```

### 2. **Token Refresh Flow**

#### **Automatic Refresh (Before Expiry)**
1. `useSessionExpiry` hook checks session expiry every 10 seconds
2. When session has 2 minutes remaining → Shows modal
3. User clicks "Retry" → Calls `/api/refresh-token/` API
4. Backend returns new `access_token` and `refresh_token`
5. Tokens updated in localStorage and cookies
6. User continues without interruption

#### **Automatic Refresh (On API Error)**
1. API request fails with 401/403 error
2. `axios` interceptor detects auth error
3. Automatically calls `/api/refresh-token/` with refresh token
4. If successful → Retries original request with new token
5. If failed → Shows session expiration message

### 3. **Key Components**

#### **SessionExpiryModal** (`src/components/SessionExpiryModal.jsx`)
- Beautiful modal with warning icon
- Shows session expiry message
- "Retry" button to refresh session
- "Cancel" button to close
- Loading state during refresh
- Success/error notifications

#### **useSessionExpiry Hook** (`src/hooks/useSessionExpiry.js`)
- Tracks session expiry time
- Shows modal 2 minutes before expiry
- Checks every 10 seconds
- Manages modal state

#### **Updated authUtils** (`src/utils/authUtils.js`)
New functions:
- `getRefreshToken()` - Retrieves refresh token from localStorage
- `updateTokens()` - Updates tokens in localStorage and cookies
- `setSessionExpiryCallback()` - Sets callback for manual modal trigger
- `showSessionExpiryModal()` - Manually triggers modal

#### **Enhanced axios Interceptor** (`src/utils/axios.js`)
- Detects 401/403 errors
- Automatically refreshes token before showing error
- Queues failed requests during refresh
- Retries queued requests with new token
- Prevents multiple simultaneous refresh attempts

#### **API Service** (`src/services/api.js`)
New endpoint:
```javascript
refreshToken: async (refreshToken) => {
  return await axiosInstance.post("/api/refresh-token/", 
    { refresh_token: refreshToken }, 
    { skipAuth: true }
  );
}
```

### 4. **Integration in App**

```jsx
// In App.jsx
const { showModal, onCloseModal, onRetry } = useSessionExpiry();

return (
  <SessionExpiryModal 
    isOpen={showModal} 
    onClose={onCloseModal}
    onRetry={onRetry}
  />
);
```

## User Experience

### **Scenario 1: Proactive Refresh**
1. User is working in dashboard
2. After 13 minutes (2 min before expiry) → Modal appears
3. User clicks "Retry" → Session refreshed
4. User continues working seamlessly

### **Scenario 2: Automatic Refresh on API Error**
1. User makes API request
2. Session expired → 401 error
3. Interceptor automatically refreshes token
4. Original request retried with new token
5. User doesn't notice anything happened

### **Scenario 3: Failed Refresh**
1. Refresh token also expired
2. Modal shows error
3. User redirected to login page

## Configuration

### **Warning Time**
Edit `useSessionExpiry.js` to change when modal appears:
```javascript
const EXPIRY_WARNING_TIME = 2 * 60 * 1000; // 2 minutes (120000ms)
```

### **Check Interval**
Edit `useSessionExpiry.js` to change check frequency:
```javascript
const interval = setInterval(checkSessionExpiry, 10000); // 10 seconds
```

## API Response Format

Backend `/api/refresh-token/` should return:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

## Files Modified/Created

### **Created:**
- `src/components/SessionExpiryModal.jsx` - Modal component
- `src/hooks/useSessionExpiry.js` - Session tracking hook
- `SESSION_REFRESH_IMPLEMENTATION.md` - This file

### **Modified:**
- `src/services/api.js` - Added `refreshToken` endpoint
- `src/utils/authUtils.js` - Added token management functions
- `src/utils/axios.js` - Enhanced interceptors with refresh logic
- `src/App.jsx` - Integrated SessionExpiryModal

## Testing

### **Test 1: Modal Appears Before Expiry**
1. Login to app
2. Wait 13 minutes
3. Modal should appear with "Session Expiring" message

### **Test 2: Refresh Token**
1. Click "Retry" in modal
2. Should show success toast
3. Modal closes
4. Session extended for another 15 minutes

### **Test 3: Automatic Refresh on API Error**
1. Manually expire token in DevTools
2. Make API request
3. Should automatically refresh and retry
4. Request should succeed

### **Test 4: Failed Refresh**
1. Delete refresh token from localStorage
2. Wait for session to expire
3. Make API request
4. Should redirect to login

## Security Notes

✅ **Implemented:**
- Refresh token stored in localStorage (with user session)
- Access token in cookies (HttpOnly recommended)
- Automatic token refresh before expiry
- Queue mechanism for concurrent requests
- Error handling for failed refreshes

⚠️ **Recommendations:**
- Use HttpOnly cookies for tokens (backend setting)
- Implement token rotation on refresh
- Add CSRF protection
- Monitor refresh token usage for suspicious activity
- Implement refresh token expiry (longer than access token)

## Troubleshooting

### **Modal doesn't appear**
- Check if `expiresAt` is set in localStorage
- Verify `useSessionExpiry` hook is initialized
- Check browser console for errors

### **Refresh fails**
- Verify backend `/api/refresh-token/` endpoint exists
- Check refresh token is valid
- Verify response format matches expected structure

### **Session expires immediately**
- Check `expires_in` value from login response
- Verify `expiresAt` calculation is correct
- Check system time sync
