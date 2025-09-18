import { describe, it, expect, vi, beforeEach } from 'vitest';
import { comprehensiveChat, startNewConversation, continueConversation } from '../comprehensiveChatThunk';
import { axiosInstance } from '../../../utils/axios';

// Mock axios instance
vi.mock('../../../utils/axios', () => ({
  axiosInstance: {
    post: vi.fn()
  }
}));

describe('comprehensiveChatThunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('comprehensiveChat', () => {
    it('should handle successful markdown response', async () => {
      const mockResponse = {
        data: {
          details: {
            data: {
              customer_id: '123',
              conversation_id: '456',
              response: '# Hello World\n\nThis is **bold** text and *italic* text.\n\n- List item 1\n- List item 2'
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

      expect(result).toEqual(mockResponse.data.details.data);
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/api/agents/chat/comprehensive/',
        {
          message: 'Hello',
          agent_id: 'agent1',
          store_id: 'store1',
          new_convo: false
        }
      );
    });

    it('should handle error responses', async () => {
      const mockError = {
        response: {
          data: {
            details: {
              message: 'Invalid request'
            }
          }
        }
      };

      axiosInstance.post.mockRejectedValue(mockError);

      const result = await comprehensiveChat({
        message: 'Hello',
        agentId: 'agent1',
        storeId: 'store1'
      })(vi.fn(), vi.fn(), vi.fn());

      expect(result.payload.message).toBe('Invalid request');
    });

    it('should handle timeout errors', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout'
      };

      axiosInstance.post.mockRejectedValue(mockError);

      const result = await comprehensiveChat({
        message: 'Hello',
        agentId: 'agent1',
        storeId: 'store1'
      })(vi.fn(), vi.fn(), vi.fn());

      expect(result.payload.message).toContain('Request timed out');
    });
  });

  describe('startNewConversation', () => {
    it('should start new conversation with markdown response', async () => {
      const mockResponse = {
        data: {
          details: {
            data: {
              customer_id: '123',
              conversation_id: '456',
              response: '## Welcome!\n\nThis is a **new conversation**.\n\n```javascript\nconsole.log("Hello");\n```'
            }
          }
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await startNewConversation({
        message: 'Start new chat',
        agentId: 'agent1',
        storeId: 'store1'
      })(vi.fn(), vi.fn(), vi.fn());

      expect(result).toEqual(mockResponse.data.details.data);
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/api/agents/chat/comprehensive/',
        {
          message: 'Start new chat',
          agent_id: 'agent1',
          store_id: 'store1',
          new_convo: true
        }
      );
    });
  });

  describe('continueConversation', () => {
    it('should continue conversation with customer ID', async () => {
      const mockResponse = {
        data: {
          details: {
            data: {
              customer_id: '123',
              conversation_id: '456',
              response: '### Continuing...\n\nHere is some `code` and a [link](https://example.com).'
            }
          }
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await continueConversation({
        message: 'Continue chat',
        agentId: 'agent1',
        storeId: 'store1',
        customerId: '123'
      })(vi.fn(), vi.fn(), vi.fn());

      expect(result).toEqual(mockResponse.data.details.data);
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/api/agents/chat/comprehensive/',
        {
          message: 'Continue chat',
          agent_id: 'agent1',
          store_id: 'store1',
          customer_id: '123'
        }
      );
    });
  });
}); 