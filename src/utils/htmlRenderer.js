import { marked } from 'marked';

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // GitHub Flavored Markdown
  sanitize: false, // Allow HTML tags (we'll sanitize if needed)
  smartLists: true,
  smartypants: false // Disable smartypants to prevent apostrophe conversion to entities
});

/**
 * Decode HTML entities to their corresponding characters
 * @param {string} html - The HTML string with entities
 * @returns {string} - The decoded string
 */
const decodeHtmlEntities = (html) => {
  if (!html || typeof html !== 'string') {
    return html;
  }
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
};

/**
 * Convert markdown text to HTML
 * @param {string} markdownText - The markdown text to convert
 * @returns {string} - The converted HTML string
 */
export const convertMarkdownToHtml = (markdownText) => {
  if (!markdownText || typeof markdownText !== 'string') {
    return markdownText;
  }
  
  try {
    const html = marked(markdownText);
    // Decode HTML entities to fix issues with apostrophes and quotes
    return decodeHtmlEntities(html);
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdownText; // Return original text if conversion fails
  }
};

/**
 * Safely render HTML content in React
 * @param {string} htmlContent - The HTML content to render
 * @returns {object} - Object with __html property for dangerouslySetInnerHTML
 */
export const createHtmlContent = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return { __html: '' };
  }
  
  return { __html: htmlContent };
};

/**
 * Process response data and convert markdown fields to HTML
 * @param {object} data - The response data object
 * @returns {object} - The processed data with HTML content
 */
export const processResponseData = (data) => {
  if (!data) return data;
  
  // Create a copy to avoid mutating the original
  const processedData = { ...data };
  
  // Convert response field if it exists
  if (processedData.response && typeof processedData.response === 'string') {
    processedData.response = convertMarkdownToHtml(processedData.response);
  }
  
  // Convert message field if it exists
  if (processedData.message && typeof processedData.message === 'string') {
    processedData.message = convertMarkdownToHtml(processedData.message);
  }
  
  // Handle nested response objects
  if (processedData.data && typeof processedData.data === 'object') {
    processedData.data = processResponseData(processedData.data);
  }
  
  return processedData;
}; 