import React, { useState } from 'react';
import { refreshTokenService } from '../services/refreshTokenService';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const TokenRefreshTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (result) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }]);
  };

  const testTokenRefresh = async () => {
    setIsLoading(true);
    addTestResult({ type: 'info', message: 'Starting token refresh test...' });

    try {
      // Test current token status
      const hasValidToken = refreshTokenService.hasValidAccessToken();
      const hasRefreshToken = !!refreshTokenService.getRefreshToken();
      
      addTestResult({ 
        type: 'info', 
        message: `Current status - Valid Access Token: ${hasValidToken}, Has Refresh Token: ${hasRefreshToken}` 
      });

      if (!hasRefreshToken) {
        addTestResult({ type: 'error', message: 'No refresh token available. Please log in first.' });
        setIsLoading(false);
        return;
      }

      // Try to refresh token manually
      const result = await refreshTokenService.refreshToken();
      addTestResult({ type: 'success', message: 'Token refreshed successfully!', data: result });

    } catch (error) {
      addTestResult({ type: 'error', message: `Token refresh failed: ${error.message}` });
    }

    setIsLoading(false);
  };

  const testAPICallWithExpiredToken = async () => {
    setIsLoading(true);
    addTestResult({ type: 'info', message: 'Testing API call with automatic token refresh...' });

    try {
      // Make an API call that requires authentication
      // The axios interceptor should handle token refresh automatically if needed
      const response = await apiService.user.getProfile();
      addTestResult({ 
        type: 'success', 
        message: 'API call successful! Token refresh handled automatically if needed.',
        data: { profileData: response.data }
      });
    } catch (error) {
      addTestResult({ 
        type: 'error', 
        message: `API call failed: ${error.message || 'Unknown error'}` 
      });
    }

    setIsLoading(false);
  };

  const testTokenValidation = () => {
    const accessToken = refreshTokenService.getAccessToken();
    const refreshToken = refreshTokenService.getRefreshToken();
    const hasValidToken = refreshTokenService.hasValidAccessToken();
    const isExpiringSoon = refreshTokenService.isTokenExpiringSoon();

    addTestResult({
      type: 'info',
      message: 'Token validation results',
      data: {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasValidAccessToken: hasValidToken,
        isTokenExpiringSoon: isExpiringSoon,
        accessTokenLength: accessToken ? accessToken.length : 0
      }
    });
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const clearTokens = () => {
    refreshTokenService.logout();
    addTestResult({ type: 'info', message: 'All tokens cleared. User logged out.' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Token Refresh System Test</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={testTokenValidation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={isLoading}
        >
          Check Token Status
        </button>
        
        <button
          onClick={testTokenRefresh}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          disabled={isLoading}
        >
          Manual Token Refresh
        </button>
        
        <button
          onClick={testAPICallWithExpiredToken}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          disabled={isLoading}
        >
          Test API Call (Auto Refresh)
        </button>
        
        <button
          onClick={clearTokens}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          disabled={isLoading}
        >
          Clear Tokens (Logout)
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={clearTestResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Test Results:</h3>
        <div className="max-h-96 overflow-y-auto border border-gray-300 rounded p-4 bg-gray-50">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Click a test button to start.</p>
          ) : (
            testResults.map((result, index) => (
              <div
                key={index}
                className={`mb-3 p-3 rounded ${
                  result.type === 'success' 
                    ? 'bg-green-100 border-green-300' 
                    : result.type === 'error' 
                      ? 'bg-red-100 border-red-300' 
                      : 'bg-blue-100 border-blue-300'
                } border`}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-semibold ${
                    result.type === 'success' ? 'text-green-800' : 
                    result.type === 'error' ? 'text-red-800' : 'text-blue-800'
                  }`}>
                    [{result.type.toUpperCase()}]
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 text-gray-700">{result.message}</p>
                {result.data && (
                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-semibold text-yellow-800 mb-2">How to Test:</h4>
        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
          <li>First, log in through the normal login flow</li>
          <li>Click "Check Token Status" to see current token state</li>
          <li>Click "Test API Call" to test automatic refresh on API calls</li>
          <li>Click "Manual Token Refresh" to test manual refresh functionality</li>
          <li>Wait for tokens to expire (10 minutes) and test automatic refresh</li>
          <li>Use "Clear Tokens" to test logout functionality</li>
        </ol>
      </div>
    </div>
  );
};

export default TokenRefreshTest; 