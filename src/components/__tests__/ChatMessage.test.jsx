import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessage from '../ChatMessage';

// Mock the htmlRenderer utility
vi.mock('../../utils/htmlRenderer', () => ({
  createHtmlContent: vi.fn((content) => ({ __html: content }))
}));

describe('ChatMessage', () => {
  it('should render user message correctly', () => {
    const message = 'Hello, this is a user message';
    
    render(
      <ChatMessage 
        message={message} 
        sender="user" 
        timestamp="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByText('12:00:00 PM')).toBeInTheDocument();
  });

  it('should render agent message with HTML content', () => {
    const htmlMessage = '<h1>Hello</h1><p>This is <strong>bold</strong> text.</p>';
    
    render(
      <ChatMessage 
        message={htmlMessage} 
        sender="agent" 
        isHtml={true}
      />
    );
    
    // Check that the HTML content is rendered
    const messageContainer = screen.getByText('Hello');
    expect(messageContainer.tagName).toBe('H1');
    
    const boldText = screen.getByText('bold');
    expect(boldText.tagName).toBe('STRONG');
  });

  it('should render plain text when isHtml is false', () => {
    const message = 'This is plain text with **markdown**';
    
    render(
      <ChatMessage 
        message={message} 
        sender="agent" 
        isHtml={false}
      />
    );
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('should handle empty message', () => {
    render(
      <ChatMessage 
        message="" 
        sender="agent"
      />
    );
    
    // Should not crash and should render empty content
    const messageContainer = screen.getByText('');
    expect(messageContainer).toBeInTheDocument();
  });

  it('should handle null message', () => {
    render(
      <ChatMessage 
        message={null} 
        sender="agent"
      />
    );
    
    // Should not crash
    expect(screen.getByText('')).toBeInTheDocument();
  });

  it('should apply correct styling for user messages', () => {
    render(
      <ChatMessage 
        message="User message" 
        sender="user"
      />
    );
    
    const messageDiv = screen.getByText('User message').closest('div');
    expect(messageDiv).toHaveClass('bg-blue-500', 'text-white');
  });

  it('should apply correct styling for agent messages', () => {
    render(
      <ChatMessage 
        message="Agent message" 
        sender="agent"
      />
    );
    
    const messageDiv = screen.getByText('Agent message').closest('div');
    expect(messageDiv).toHaveClass('bg-gray-200', 'text-gray-800');
  });

  it('should not render timestamp when not provided', () => {
    render(
      <ChatMessage 
        message="Test message" 
        sender="agent"
      />
    );
    
    // Should not have any time-related text
    expect(screen.queryByText(/\d{1,2}:\d{2}:\d{2}/)).not.toBeInTheDocument();
  });

  it('should render timestamp when provided', () => {
    render(
      <ChatMessage 
        message="Test message" 
        sender="agent"
        timestamp="2024-01-01T12:00:00Z"
      />
    );
    
    expect(screen.getByText('12:00:00 PM')).toBeInTheDocument();
  });
}); 