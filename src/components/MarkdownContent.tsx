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
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
} 