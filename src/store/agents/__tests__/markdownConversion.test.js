import { describe, it, expect, vi } from 'vitest';
import { comprehensiveChat } from '../comprehensiveChatThunk';
import { axiosInstance } from '../../../utils/axios';

// Mock axios instance
vi.mock('../../../utils/axios', () => ({
  axiosInstance: {
    post: vi.fn()
  }
}));

// Mock marked library
vi.mock('marked', () => ({
  marked: vi.fn((text) => {
    // Simple mock implementation for testing
    if (text.includes('**bold**')) {
      return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }
    if (text.includes('*italic*')) {
      return text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    if (text.includes('#')) {
      return text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    }
    if (text.includes('```')) {
      return text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    }
    return text;
  }),
  setOptions: vi.fn()
}));

describe('Markdown Conversion', () => {
  it('should convert markdown response to HTML', async () => {
    const mockResponse = {
      data: {
        details: {
          data: {
            customer_id: '123',
            conversation_id: '456',
            response: '# Hello World\n\nThis is **bold** text and *italic* text.\n\n```javascript\nconsole.log("Hello");\n```'
          }
        }
      }
    };

    axiosInstance.post.mockResolvedValue(mockResponse);

    const result = await comprehensiveChat({
      message: 'Hello',
      agentId: 'agent1',
      storeId: 'store1'
    })(vi.fn(), vi.fn(), vi.fn());

    expect(result.response).toContain('<h1>Hello World</h1>');
    expect(result.response).toContain('<strong>bold</strong>');
    expect(result.response).toContain('<em>italic</em>');
    expect(result.response).toContain('<pre><code>console.log("Hello");</code></pre>');
  });

  it('should handle non-string responses gracefully', async () => {
    const mockResponse = {
      data: {
        details: {
          data: {
            customer_id: '123',
            conversation_id: '456',
            response: null
          }
        }
      }
    };

    axiosInstance.post.mockResolvedValue(mockResponse);

    const result = await comprehensiveChat({
      message: 'Hello',
      agentId: 'agent1',
      storeId: 'store1'
    })(vi.fn(), vi.fn(), vi.fn());

    expect(result.response).toBeNull();
  });

  it('should handle empty string responses', async () => {
    const mockResponse = {
      data: {
        details: {
          data: {
            customer_id: '123',
            conversation_id: '456',
            response: ''
          }
        }
      }
    };

    axiosInstance.post.mockResolvedValue(mockResponse);

    const result = await comprehensiveChat({
      message: 'Hello',
      agentId: 'agent1',
      storeId: 'store1'
    })(vi.fn(), vi.fn(), vi.fn());

    expect(result.response).toBe('');
  });

  it('should convert message field if present', async () => {
    const mockResponse = {
      data: {
        details: {
          data: {
            customer_id: '123',
            conversation_id: '456',
            message: 'This is a **test** message'
          }
        }
      }
    };

    axiosInstance.post.mockResolvedValue(mockResponse);

    const result = await comprehensiveChat({
      message: 'Hello',
      agentId: 'agent1',
      storeId: 'store1'
    })(vi.fn(), vi.fn(), vi.fn());

    expect(result.message).toContain('<strong>test</strong>');
  });

  it('should handle nested data objects', async () => {
    const mockResponse = {
      data: {
        details: {
          data: {
            customer_id: '123',
            conversation_id: '456',
            data: {
              response: 'This is **nested** content'
            }
          }
        }
      }
    };

    axiosInstance.post.mockResolvedValue(mockResponse);

    const result = await comprehensiveChat({
      message: 'Hello',
      agentId: 'agent1',
      storeId: 'store1'
    })(vi.fn(), vi.fn(), vi.fn());

    expect(result.data.response).toContain('<strong>nested</strong>');
  });
}); 