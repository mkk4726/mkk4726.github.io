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
        setParsedContent(result);
      } catch (error) {
        console.error('Error processing about markdown:', error);
        setParsedContent(content);
      }
    };

    if (content) {
      processContent();
    }
  }, [content]);

  // 테이블을 responsive wrapper로 감싸기
  useEffect(() => {
    if (parsedContent) {
      const timer = setTimeout(() => {
        const contentDiv = document.querySelector('.about-content-wrapper');
        if (contentDiv) {
          const tables = contentDiv.querySelectorAll('table');
          tables.forEach((table) => {
            const parent = table.parentElement;
            if (!parent) return;
            // 이미 wrapper가 있으면 건너뛰기
            if (parent.classList.contains('table-responsive')) return;
            
            // wrapper 생성 및 클래스만 설정 (스타일은 CSS에서 처리)
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            
            parent.insertBefore(wrapper, table);
            wrapper.appendChild(table);
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [parsedContent]);

  return (
    <div 
      className={`about-content-wrapper prose prose-lg max-w-none about-dark ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
} 