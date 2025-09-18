import React from 'react';
import { convertMarkdownToHtml, createHtmlContent } from '../utils/htmlRenderer';

const MarkdownDemo = () => {
  const originalMarkdown = `Welcome to **Rafay's Store**! We specialize in men's clothing and footwear, and currently, we have a total of **24 products** available for you to explore. Here's a selection of our featured items:

• **Men's Comfort Fit Jogger Pants** - *1899 PKR* - Stay active and stylish with these ultra-soft joggers, featuring an elastic waistband and tapered fit.
• **Men's Relaxed Fit Linen Shirt** - *2599 PKR* - Beat the heat with this lightweight, breathable shirt that's perfect for summer outings.
• **Men's Half Sleeve Printed Cotton Shirt** - *1899 PKR* - Brighten your wardrobe with vibrant prints and a relaxed fit, perfect for casual hanging out.
• **Men's Classic Denim Shirt** - *3000 PKR* - Add a rugged touch to your look with this durable denim shirt, great for layering.
• **2 Pents** - *2323 PKR* - A reliable set of two pents designed for precision and durability.

If you need more specific information or would like to explore more products, just let me know!`;

  const convertedHtml = convertMarkdownToHtml(originalMarkdown);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Markdown to HTML Conversion Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Markdown */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Original Markdown</h2>
          <pre className="text-sm whitespace-pre-wrap bg-white p-3 rounded border">
            {originalMarkdown}
          </pre>
        </div>

        {/* Converted HTML */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Converted HTML</h2>
          <pre className="text-sm whitespace-pre-wrap bg-white p-3 rounded border overflow-auto max-h-96">
            {convertedHtml}
          </pre>
        </div>
      </div>

      {/* Rendered Output */}
      <div className="mt-8 bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-3">Rendered Output</h2>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={createHtmlContent(convertedHtml)}
        />
      </div>
      
      {/* Debug Info */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-2">Debug Information</h3>
        <div className="text-sm space-y-1">
          <p><strong>Contains HTML entities (&#39;):</strong> {convertedHtml.includes('&#39;') ? 'Yes' : 'No'}</p>
          <p><strong>Contains apostrophes ('):</strong> {convertedHtml.includes("'") ? 'Yes' : 'No'}</p>
          <p><strong>Contains &lt;strong&gt; tags:</strong> {convertedHtml.includes('<strong>') ? 'Yes' : 'No'}</p>
          <p><strong>Contains &lt;em&gt; tags:</strong> {convertedHtml.includes('<em>') ? 'Yes' : 'No'}</p>
          <p><strong>Contains &lt;br&gt; tags:</strong> {convertedHtml.includes('<br>') ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default MarkdownDemo; 