'use client';

import React, { useEffect, useState } from 'react';
import { parseMarkdown } from '../lib/markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const [parsedContent, setParsedContent] = useState<string>('');
  const [isContentReady, setIsContentReady] = useState<boolean>(false);

  useEffect(() => {
    const processContent = async () => {
      try {
        let html = await parseMarkdown(content);
        
        // 헤딩에 ID 추가 (한글과 영문 모두 지원)
        html = html.replace(
          /<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/g,
          (match, level, attributes, text) => {
            // 이미 ID가 있는지 확인
            if (attributes.includes('id=')) {
              return match;
            }
            
            // HTML 태그 제거하고 순수 텍스트만 추출
            const cleanText = text.replace(/<[^>]*>/g, '');
            // ID 생성: 특수문자 제거하고 공백을 하이픈으로 변경
            const id = cleanText
              .toLowerCase()
              .replace(/[^a-z0-9가-힣\s]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            
            console.log(`Generated ID for "${cleanText}": ${id}`);
            
            return `<h${level}${attributes} id="${id}">${text}</h${level}>`;
          }
        );
        
        setParsedContent(html);
        setIsContentReady(true);
      } catch (error) {
        console.error('Error parsing markdown:', error);
        setParsedContent(content);
        setIsContentReady(true);
      }
    };

    processContent();
  }, [content]);

  // 콘텐츠가 렌더링된 후 목차 업데이트를 위한 이벤트 발생
  useEffect(() => {
    if (isContentReady && parsedContent) {
      // DOM 업데이트 후 목차가 헤딩을 다시 감지할 수 있도록 이벤트 발생
      const timer = setTimeout(() => {
        const event = new CustomEvent('contentReady');
        window.dispatchEvent(event);
        console.log('Content ready event dispatched');
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isContentReady, parsedContent]);

  // 외부 링크와 내부 문서 링크가 새 탭에서 열리도록 설정
  useEffect(() => {
    if (isContentReady && parsedContent) {
      const timer = setTimeout(() => {
        const contentDiv = document.querySelector('.prose');
        if (contentDiv) {
          // 모든 링크 선택 (앵커 링크 제외)
          const allLinks = contentDiv.querySelectorAll('a[href]');
          allLinks.forEach((link) => {
            const anchorElement = link as HTMLAnchorElement;
            const href = anchorElement.getAttribute('href') || '';
            
            // 앵커 링크(#으로 시작)가 아닌 모든 링크를 새 탭에서 열기
            if (!href.startsWith('#') && href.trim() !== '') {
              anchorElement.setAttribute('target', '_blank');
              anchorElement.setAttribute('rel', 'noopener noreferrer');
            }
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isContentReady, parsedContent]);

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