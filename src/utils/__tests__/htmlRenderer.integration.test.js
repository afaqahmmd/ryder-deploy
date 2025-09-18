import { describe, it, expect } from 'vitest';
import { convertMarkdownToHtml } from '../htmlRenderer';

describe('HTML Renderer Integration Tests', () => {
  it('should properly handle apostrophes in markdown', () => {
    const markdown = "Welcome to **Rafay's Store**! We specialize in men's clothing and footwear.";
    
    const result = convertMarkdownToHtml(markdown);
    
    // Should contain proper apostrophes, not HTML entities
    expect(result).toContain("Rafay's Store");
    expect(result).toContain("men's clothing");
    expect(result).not.toContain('&#39;');
    expect(result).toContain('<strong>Rafay\'s Store</strong>');
  });

  it('should handle complex markdown with lists and formatting', () => {
    const markdown = `Welcome to **Rafay's Store**! We specialize in men's clothing and footwear, and currently, we have a total of **24 products** available for you to explore. Here's a selection of our featured items:

• **Men's Comfort Fit Jogger Pants** - *1899 PKR* - Stay active and stylish with these ultra-soft joggers, featuring an elastic waistband and tapered fit.
• **Men's Relaxed Fit Linen Shirt** - *2599 PKR* - Beat the heat with this lightweight, breathable shirt that's perfect for summer outings.

If you need more specific information or would like to explore more products, just let me know!`;
    
    const result = convertMarkdownToHtml(markdown);
    
    // Should contain proper apostrophes
    expect(result).toContain("Rafay's Store");
    expect(result).toContain("men's clothing");
    expect(result).toContain("Men's Comfort Fit Jogger Pants");
    expect(result).toContain("Men's Relaxed Fit Linen Shirt");
    
    // Should not contain HTML entities
    expect(result).not.toContain('&#39;');
    
    // Should contain proper HTML formatting
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
    expect(result).toContain('<br>');
  });

  it('should handle quotes and other special characters', () => {
    const markdown = "Here's a \"quoted\" text with **bold** and *italic* formatting.";
    
    const result = convertMarkdownToHtml(markdown);
    
    // Should contain proper quotes and apostrophes
    expect(result).toContain("Here's");
    expect(result).toContain('"quoted"');
    expect(result).not.toContain('&#39;');
    expect(result).not.toContain('&quot;');
  });
}); 