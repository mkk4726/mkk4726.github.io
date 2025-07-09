'use client';

import { useEffect, useRef } from 'react';
import '../styles/notebook.css';

interface JupyterNotebookProps {
  content: string;
}

export default function JupyterNotebook({ content }: JupyterNotebookProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPrismAndHighlight = async () => {
      if (typeof window !== 'undefined' && containerRef.current) {
        try {
          // Prism.js 동적 로드
          const Prism = (await import('prismjs')).default;
          
          // Python 언어 지원 로드
          // @ts-expect-error - prismjs component types not available
          await import('prismjs/components/prism-python');
          
          // 노트북 내의 모든 코드 블록 하이라이팅
          const codeBlocks = containerRef.current.querySelectorAll('pre code[class*="language-"]');
          codeBlocks.forEach((block) => {
            // 이미 하이라이팅된 경우 스킵
            if (!block.classList.contains('language-highlighted')) {
              Prism.highlightElement(block);
              block.classList.add('language-highlighted');
            }
          });
          
          // 언어 클래스가 없는 코드 블록에 Python 추가
          const plainCodeBlocks = containerRef.current.querySelectorAll('pre code:not([class*="language-"])');
          plainCodeBlocks.forEach((block) => {
            block.classList.add('language-python');
            Prism.highlightElement(block);
            block.classList.add('language-highlighted');
          });
          
        } catch (error) {
          console.warn('Prism.js loading failed:', error);
        }
      }
    };

    // DOM이 완전히 렌더링된 후 하이라이팅 적용
    const timer = setTimeout(loadPrismAndHighlight, 100);
    
    return () => clearTimeout(timer);
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className="jupyter-notebook-wrapper"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
} 