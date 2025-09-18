# Embeddings API Integration

## Overview

The frontend has been updated to integrate with the embeddings API endpoints. This integration allows users to create, manage, and test product embeddings for semantic search functionality.

## Features Implemented

### 1. Store Selection
- Dropdown to select a specific store
- Shows product count for each store
- Automatically loads embedding statistics when a store is selected

### 2. Create Embeddings
- Button to create embeddings for the selected store
- Shows loading state during creation
- Displays success/error messages
- Automatically refreshes statistics after creation

### 3. Embedding Statistics
- Displays vectors count, points count, and status
- Shows collection name and store ID
- Updates automatically when embeddings are created

### 4. Semantic Search Testing
- Search input field for product queries
- Configurable results limit (5, 10, 15, 20)
- Displays search results with similarity scores
- Shows product details including price, rating, and metadata

## API Integration

### Endpoints Used

1. **POST /api/agents/embeddings/create/**
   - Creates embeddings for a store
   - Requires store_id in request body

2. **GET /api/agents/embeddings/search/**
   - Searches products using semantic similarity
   - Query parameters: query, store_id, limit

3. **GET /api/agents/embeddings/stats/**
   - Gets embedding statistics
   - Query parameters: store_id, collection_name

### Error Handling

- Comprehensive error handling for all API calls
- User-friendly error messages
- Automatic error clearing when switching stores
- Loading states for all async operations

## Component Structure

### KnowledgeBaseTab.jsx
- Main component for embeddings management
- Integrates with Redux for store data
- Uses custom `useEmbeddings` hook

### useEmbeddings.js Hook
- Manages all embeddings-related state
- Handles API calls and error states
- Provides loading indicators
- Returns clean interface for component usage

### API Service Integration
- Added embeddings endpoints to existing `api.js`
- Follows existing patterns for consistency
- Uses proper authentication headers
- Handles response data extraction

## User Flow

1. **Select Store**: User chooses a store from the dropdown
2. **View Statistics**: Embedding statistics are automatically loaded
3. **Create Embeddings**: User clicks "Create Embeddings" button
4. **Monitor Progress**: Loading states show during creation
5. **Test Search**: User can test semantic search functionality
6. **View Results**: Search results display with similarity scores

## Testing

### Unit Tests
- `useEmbeddings.test.js`: Tests the custom hook
- `KnowledgeBaseTab.test.js`: Tests the main component
- Covers all major functionality and edge cases

### Test Coverage
- Hook initialization and state management
- API call success and error scenarios
- Component rendering and user interactions
- Loading states and error handling

## Error Scenarios Handled

1. **Network Errors**: Proper error messages for connection issues
2. **Authentication Errors**: Handled by existing token refresh system
3. **API Errors**: User-friendly messages for backend errors
4. **Validation Errors**: Client-side validation for required fields
5. **Empty Results**: Graceful handling of no search results

## Future Enhancements

1. **Bulk Operations**: Create embeddings for multiple stores
2. **Advanced Search**: Filters for price range, product type, etc.
3. **Embedding Health**: Detailed health monitoring
4. **Search Analytics**: Track popular search terms
5. **Real-time Updates**: WebSocket integration for live updates

## Technical Notes

- Uses existing Redux store for store data
- Follows existing authentication patterns
- Maintains consistent UI/UX with other tabs
- Proper TypeScript-like prop validation
- Responsive design for mobile devices
- Accessibility considerations included

## Dependencies

- React 19.1.0
- Redux Toolkit for state management
- Axios for API calls
- React Icons for UI icons
- Tailwind CSS for styling
- Vitest for testing

## Installation

The integration is already included in the codebase. To run tests:

```bash
npm install
npm test
```

To run the development server:

```bash
npm run dev
``` 