import { describe, it, expect, vi } from 'vitest';
import { convertMarkdownToHtml, createHtmlContent, processResponseData } from '../htmlRenderer';

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
    // Simulate HTML entity conversion that marked might do
    if (text.includes("'")) {
      return text.replace(/'/g, '&#39;');
    }
    return text;
  }),
  setOptions: vi.fn()
}));

// Mock document.createElement for decodeHtmlEntities function
const mockTextarea = {
  innerHTML: '',
  value: ''
};

vi.stubGlobal('document', {
  createElement: vi.fn(() => mockTextarea)
});

describe('HTML Renderer Utilities', () => {
  describe('convertMarkdownToHtml', () => {
    it('should convert markdown to HTML', () => {
      const markdown = '# Hello World\n\nThis is **bold** text and *italic* text.';
      const result = convertMarkdownToHtml(markdown);
      
      expect(result).toContain('<h1>Hello World</h1>');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });

    it('should handle null input', () => {
      const result = convertMarkdownToHtml(null);
      expect(result).toBeNull();
    });

    it('should handle undefined input', () => {
      const result = convertMarkdownToHtml(undefined);
      expect(result).toBeUndefined();
    });

    it('should handle non-string input', () => {
      const result = convertMarkdownToHtml(123);
      expect(result).toBe(123);
    });

    it('should handle empty string', () => {
      const result = convertMarkdownToHtml('');
      expect(result).toBe('');
    });

    it('should handle code blocks', () => {
      const markdown = '```javascript\nconsole.log("Hello");\n```';
      const result = convertMarkdownToHtml(markdown);
      
      expect(result).toContain('<pre><code>console.log("Hello");</code></pre>');
    });

    it('should decode HTML entities properly', () => {
      const markdown = "Welcome to **Rafay's Store**! We specialize in men's clothing.";
      
      // Mock the textarea behavior for HTML entity decoding
      mockTextarea.innerHTML = '<strong>Rafay&#39;s Store</strong>! We specialize in men&#39;s clothing.';
      mockTextarea.value = '<strong>Rafay\'s Store</strong>! We specialize in men\'s clothing.';
      
      const result = convertMarkdownToHtml(markdown);
      
      // Should contain decoded apostrophes, not HTML entities
      expect(result).toContain("Rafay's Store");
      expect(result).toContain("men's clothing");
      expect(result).not.toContain('&#39;');
    });
  });

  describe('createHtmlContent', () => {
    it('should create HTML content object', () => {
      const html = '<h1>Hello</h1><p>World</p>';
      const result = createHtmlContent(html);
      
      expect(result).toEqual({ __html: html });
    });

    it('should handle null input', () => {
      const result = createHtmlContent(null);
      expect(result).toEqual({ __html: '' });
    });

    it('should handle undefined input', () => {
      const result = createHtmlContent(undefined);
      expect(result).toEqual({ __html: '' });
    });

    it('should handle non-string input', () => {
      const result = createHtmlContent(123);
      expect(result).toEqual({ __html: '' });
    });

    it('should handle empty string', () => {
      const result = createHtmlContent('');
      expect(result).toEqual({ __html: '' });
    });
  });

  describe('processResponseData', () => {
    it('should process response data and convert markdown', () => {
      const data = {
        customer_id: '123',
        conversation_id: '456',
        response: '# Hello\n\nThis is **bold** text.',
        message: 'This is a *test* message.'
      };
      
      const result = processResponseData(data);
      
      expect(result.customer_id).toBe('123');
      expect(result.conversation_id).toBe('456');
      expect(result.response).toContain('<h1>Hello</h1>');
      expect(result.response).toContain('<strong>bold</strong>');
      expect(result.message).toContain('<em>test</em>');
    });

    it('should handle null input', () => {
      const result = processResponseData(null);
      expect(result).toBeNull();
    });

    it('should handle data without response or message fields', () => {
      const data = {
        customer_id: '123',
        conversation_id: '456'
      };
      
      const result = processResponseData(data);
      
      expect(result).toEqual(data);
    });

    it('should handle nested data objects', () => {
      const data = {
        customer_id: '123',
        data: {
          response: 'This is **nested** content'
        }
      };
      
      const result = processResponseData(data);
      
      expect(result.data.response).toContain('<strong>nested</strong>');
    });

    it('should handle non-string response fields', () => {
      const data = {
        customer_id: '123',
        response: null,
        message: 123
      };
      
      const result = processResponseData(data);
      
      expect(result.response).toBeNull();
      expect(result.message).toBe(123);
    });

    it('should not mutate the original data', () => {
      const originalData = {
        customer_id: '123',
        response: '# Hello\n\nThis is **bold** text.'
      };
      
      const dataCopy = { ...originalData };
      processResponseData(dataCopy);
      
      expect(originalData.response).toBe('# Hello\n\nThis is **bold** text.');
    });

    it('should decode HTML entities in response data', () => {
      const data = {
        customer_id: '123',
        response: "Welcome to **Rafay's Store**! We specialize in men's clothing."
      };
      
      // Mock the textarea behavior for HTML entity decoding
      mockTextarea.innerHTML = '<strong>Rafay&#39;s Store</strong>! We specialize in men&#39;s clothing.';
      mockTextarea.value = '<strong>Rafay\'s Store</strong>! We specialize in men\'s clothing.';
      
      const result = processResponseData(data);
      
      expect(result.response).toContain("Rafay's Store");
      expect(result.response).toContain("men's clothing");
      expect(result.response).not.toContain('&#39;');
    });
  });
}); 