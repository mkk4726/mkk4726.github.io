'use client';

import React, { useEffect, useState } from 'react';
import { parseMarkdown } from '../lib/markdown';

interface AboutContentProps {
  content: string;
  className?: string;
}

export default function AboutContent({ content, className = '' }: AboutContentProps) {
  const [parsedContent, setParsedContent] = useState<string>('');

  useEffect(() => {
    const processContent = async () => {
      try {
        console.log('Processing about markdown content...');
        const result = await parseMarkdown(content);
        console.log('Parsed about content:', result);
        
        // HTML에 직접 스타일 적용 - 검은색 배경에 흰색 글씨
        const processedContent = result
          .replace(/<h1/g, '<h1 style="color: white; font-size: 2rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;"')
          .replace(/<h2/g, '<h2 style="color: white; font-size: 1.5rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;"')
          .replace(/<h3/g, '<h3 style="color: white; font-size: 1.25rem; font-weight: bold; margin-top: 1.25rem; margin-bottom: 0.5rem;"')
          .replace(/<p/g, '<p style="color: white; margin-bottom: 1rem; line-height: 1.75;"')
          .replace(/<ul/g, '<ul style="color: white; margin-bottom: 1rem; padding-left: 1.5rem; list-style-type: disc; list-style-color: white;"')
          .replace(/<ol/g, '<ol style="color: white; margin-bottom: 1rem; padding-left: 1.5rem; list-style-type: decimal; list-style-color: white;"')
          .replace(/<li/g, '<li style="color: white; margin-bottom: 0.5rem; list-style-color: white;"')
          .replace(/<strong/g, '<strong style="color: white; font-weight: bold;"')
          .replace(/<em/g, '<em style="color: #e5e7eb; font-style: italic;"')
          .replace(/<a/g, '<a style="color: #93c5fd; text-decoration: underline;"')
          .replace(/<blockquote/g, '<blockquote style="color: #e5e7eb; border-left: 4px solid #6b7280; padding-left: 1rem; margin: 1rem 0;"')
          .replace(/<code/g, '<code style="color: #f3f4f6; background-color: #374151; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-family: monospace;"')
          .replace(/<pre/g, '<pre style="color: #f3f4f6; background-color: #374151; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0;"');
        
        setParsedContent(processedContent);
      } catch (error) {
        console.error('Error processing about markdown:', error);
        setParsedContent(content);
      }
    };

    if (content) {
      processContent();
    }
  }, [content]);

  return (
    <div 
      className={`max-w-none text-white leading-loose font-sans ${className}`}
      style={{
        color: 'white',
        fontSize: '1.125rem',
        lineHeight: '1.75',
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
} 