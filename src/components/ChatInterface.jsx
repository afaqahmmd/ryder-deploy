import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { comprehensiveChat, startNewConversation, continueConversation } from '../store/agents/comprehensiveChatThunk';
import { addMessage, clearMessages, setCurrentAgent, setCurrentStore } from '../store/agents/comprehensiveChatSlice';
import ChatMessage from './ChatMessage';
import { toast } from 'react-toastify';

/**
 * ChatInterface component for handling agent conversations
 * @param {Object} props - Component props
 * @param {Object} props.agent - The agent object
 * @param {Object} props.store - The store object
 */
const ChatInterface = ({ agent, store }) => {
  const dispatch = useDispatch();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get state from Redux store
  const {
    messages,
    isChatting,
    isStartingConversation,
    isContinuingConversation,
    chatError,
    customerId,
    conversationId
  } = useSelector((state) => state.comprehensiveChat);

  // Set current agent and store on component mount
  useEffect(() => {
    if (agent) {
      dispatch(setCurrentAgent(agent));
    }
    if (store) {
      dispatch(setCurrentStore(store));
    }
  }, [agent, store, dispatch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle chat errors
  useEffect(() => {
    if (chatError) {
      toast.error(chatError);
    }
  }, [chatError]);

  // Handle successful chat responses
  const handleChatSuccess = (response) => {
    // Add agent response to messages
    if (response.response) {
      dispatch(addMessage({
        id: Date.now(),
        content: response.response,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        isHtml: true
      }));
    }
    
    setIsTyping(false);
  };

  // Handle chat errors
  const handleChatError = (error) => {
    setIsTyping(false);
    console.error('Chat error:', error);
  };

  // Send message to agent
  const sendMessage = async (message) => {
    if (!message.trim() || !agent || !store) return;

    const userMessage = {
      id: Date.now(),
      content: message.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      isHtml: false
    };

    // Add user message to chat
    dispatch(addMessage(userMessage));
    setInputMessage('');
    setIsTyping(true);

    try {
      let response;
      
      if (!customerId) {
        // Start new conversation
        response = await dispatch(startNewConversation({
          message: message.trim(),
          agentId: agent.id,
          storeId: store.id
        })).unwrap();
      } else {
        // Continue existing conversation
        response = await dispatch(continueConversation({
          message: message.trim(),
          agentId: agent.id,
          storeId: store.id,
          customerId: customerId
        })).unwrap();
      }

      handleChatSuccess(response);
    } catch (error) {
      handleChatError(error);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  // Clear chat history
  const clearChat = () => {
    dispatch(clearMessages());
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {agent?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {agent?.name || 'Agent'}
              </h3>
              <p className="text-sm text-gray-500">
                {store?.name || 'Store'} • {customerId ? 'Active conversation' : 'New conversation'}
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Start a conversation with {agent?.name || 'the agent'}</p>
            <p className="text-sm mt-2">The agent will respond with formatted markdown content</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.content}
              sender={message.sender}
              timestamp={message.timestamp}
              isHtml={message.isHtml}
            />
          ))
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message ${agent?.name || 'agent'}...`}
            disabled={isChatting || isStartingConversation || isContinuingConversation}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isChatting || isStartingConversation || isContinuingConversation}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface; 