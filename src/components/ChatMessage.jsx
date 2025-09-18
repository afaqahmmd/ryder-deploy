import React from 'react';
import { createHtmlContent } from '../utils/htmlRenderer';

/**
 * ChatMessage component for rendering chat messages with HTML content
 * @param {Object} props - Component props
 * @param {string} props.message - The message content (HTML or plain text)
 * @param {string} props.sender - The sender of the message ('user' or 'agent')
 * @param {string} props.timestamp - The timestamp of the message
 * @param {boolean} props.isHtml - Whether the message content is HTML (default: true)
 */
const ChatMessage = ({ 
  message, 
  sender = 'agent', 
  timestamp, 
  isHtml = true 
}) => {
  const isUser = sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}>
        {/* Message content */}
        <div className="message-content">
          {isHtml && message ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={createHtmlContent(message)}
            />
          ) : (
            <p className="whitespace-pre-wrap">{message}</p>
          )}
        </div>
        
        {/* Timestamp */}
        {timestamp && (
          <div className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 