'use client';

import { useEffect, useRef } from 'react';

interface CodeHighlightProps {
  children: React.ReactNode;
}

export default function CodeHighlight({ children }: CodeHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prism.js를 동적으로 로드
    const loadPrism = async () => {
      if (typeof window !== 'undefined') {
        try {
          const Prism = (await import('prismjs')).default;
          
          // 언어 컴포넌트들을 동적으로 로드
          // @ts-expect-error - prismjs component types not available
          await import('prismjs/components/prism-python');
          // @ts-expect-error - prismjs component types not available
          await import('prismjs/components/prism-javascript');
          // @ts-expect-error - prismjs component types not available
          await import('prismjs/components/prism-typescript');
          // @ts-expect-error - prismjs component types not available
          await import('prismjs/components/prism-json');
          // @ts-expect-error - prismjs component types not available
          await import('prismjs/components/prism-bash');
          // @ts-expect-error - prismjs component types not available
          await import('prismjs/components/prism-yaml');
          
          // 컨테이너 내의 코드 블록만 하이라이트
          if (containerRef.current) {
            const codeBlocks = containerRef.current.querySelectorAll('pre code');
            codeBlocks.forEach((block) => {
              // 언어 클래스가 없으면 추가
              if (!block.className.includes('language-')) {
                block.className += ' language-python';
              }
              Prism.highlightElement(block);
            });
          }
        } catch (error) {
          console.warn('Prism.js loading failed:', error);
        }
      }
    };

    // 약간 지연 후 로드 (DOM이 완전히 준비된 후)
    const timer = setTimeout(loadPrism, 100);
    
    return () => clearTimeout(timer);
  }, [children]);

  return <div ref={containerRef}>{children}</div>;
} 