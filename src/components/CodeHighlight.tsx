'use client';

import { useEffect } from 'react';

interface CodeHighlightProps {
  children: React.ReactNode;
}

export default function CodeHighlight({ children }: CodeHighlightProps) {
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
          
          // 모든 코드 블록을 하이라이트
          Prism.highlightAll();
        } catch (error) {
          console.warn('Prism.js loading failed:', error);
        }
      }
    };

    loadPrism();
  }, [children]);

  return <div>{children}</div>;
} 