'use client';

import React, { useEffect, useState } from 'react';
import { parseMarkdown } from '../lib/markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const [parsedContent, setParsedContent] = useState<string>('');

  useEffect(() => {
    const processContent = async () => {
      try {
        const html = await parseMarkdown(content);
        setParsedContent(html);
      } catch (error) {
        console.error('Error parsing markdown:', error);
        setParsedContent(content);
      }
    };

    processContent();
  }, [content]);

  return (
    <div 
      className={`prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-600 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-li:marker:text-gray-700 ${className}`}
      style={{
        '--tw-prose-bullets': '#374151',
        '--tw-prose-counters': '#374151',
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
} 