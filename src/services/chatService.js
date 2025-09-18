import { axiosInstance } from '../utils/axios';

class ChatService {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async sendMessage(message, agentId, storeId, customerId = null, customerName = null, newConvo = false) {
    const requestBody = {
      message,
      agent_id: agentId,
      store_id: storeId
    };

    // Add optional fields if provided
    if (customerId) requestBody.customer_id = customerId;
    if (customerName) requestBody.customer_name = customerName;
    if (newConvo) requestBody.new_convo = newConvo;

    try {
      const response = await axiosInstance.post('/api/agents/chat/comprehensive/', requestBody);
      
      if (response.data && response.data.details && response.data.details.data) {
        return response.data.details.data;
      } else {
        throw new Error('Invalid response format from chat API');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timed out. The server is taking longer than expected to respond. Please try again.');
      }
      
      // Handle other errors
      if (error.response && error.response.data && error.response.data.details) {
        throw new Error(error.response.data.details.message || 'Chat request failed');
      }
      
      throw error;
    }
  }

  // Start new conversation
  async startNewConversation(message, agentId, storeId, customerName) {
    return this.sendMessage(message, agentId, storeId, null, customerName, true);
  }

  // Continue existing conversation
  async continueConversation(message, agentId, storeId, customerId) {
    return this.sendMessage(message, agentId, storeId, customerId);
  }

  // Get conversation history (if needed)
  async getConversationHistory(customerId, agentId, storeId) {
    try {
      const response = await axiosInstance.post('/api/agents/conversation_history/', {
        customer_id: customerId,
        agent_id: agentId,
        store_id: storeId
      });
      
      if (response.data && response.data.details && response.data.details.data) {
        return response.data.details.data;
      } else {
        throw new Error('Invalid response format from conversation history API');
      }
    } catch (error) {
      console.error('Conversation history error:', error);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timed out. The server is taking longer than expected to respond. Please try again.');
      }
      
      // Handle other errors
      if (error.response && error.response.data && error.response.data.details) {
        throw new Error(error.response.data.details.message || 'Failed to fetch conversation history');
      }
      
      throw error;
    }
  }
}

export default ChatService; 