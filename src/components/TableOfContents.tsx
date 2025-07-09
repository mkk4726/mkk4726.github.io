'use client';

import React, { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

export default function TableOfContents({ className = '' }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  const extractHeadings = () => {
    const article = document.querySelector('article');
    if (!article) {
      console.log('Article not found');
      return;
    }

    const headingElements = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
    console.log('Found headings:', headingElements.length);
    
    const tocItems: TOCItem[] = [];

    headingElements.forEach((heading, index) => {
      let id = heading.id;
      if (!id) {
        // ID가 없으면 텍스트로부터 생성
        id = heading.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9가-힣\s]/g, '')
          .replace(/\s+/g, '-') || `heading-${index}`;
        heading.id = id;
      }
      
      const text = heading.textContent || '';
      console.log(`Heading ${index}: ${text} (id: ${id})`);
      
      tocItems.push({
        id,
        text,
        level: parseInt(heading.tagName.charAt(1))
      });
    });

    console.log('TOC Items:', tocItems);
    setHeadings(tocItems);
  };

  useEffect(() => {
    // 초기 헤딩 추출
    const timer = setTimeout(extractHeadings, 100);
    
    // 콘텐츠 준비 이벤트 리스너
    const handleContentReady = () => {
      console.log('Content ready event received, re-extracting headings');
      setTimeout(extractHeadings, 50);
    };

    window.addEventListener('contentReady', handleContentReady);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('contentReady', handleContentReady);
    };
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    console.log('Setting up intersection observer for headings:', headings.map(h => h.id));

    const observer = new IntersectionObserver(
      (entries) => {
        // 현재 화면에 보이는 헤딩들을 찾기
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // 가장 위에 있는 헤딩을 활성화
          const topEntry = visibleEntries.reduce((top, entry) => {
            return entry.boundingClientRect.top < top.boundingClientRect.top ? entry : top;
          });
          
          setActiveId(topEntry.target.id);
          console.log('Active heading:', topEntry.target.id);
        }
      },
      {
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        console.log('Observing element:', id);
      } else {
        console.log('Element not found:', id);
      }
    });

    return () => {
      console.log('Disconnecting observer');
      observer.disconnect();
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    console.log('Scrolling to:', id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      // 수동으로 활성 상태 설정
      setActiveId(id);
    } else {
      console.log('Element not found for scrolling:', id);
    }
  };

  if (headings.length === 0) {
    return (
      <div className={`toc-container ${className}`}>
        <div className="toc-content">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">목차</h4>
          <p className="text-sm text-gray-500">헤딩을 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`toc-container ${className}`}>
      <div className="toc-content">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">목차</h4>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`text-left w-full px-3 py-2 rounded-md transition-all duration-200 text-sm block ${
                  activeId === heading.id
                    ? 'bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-500 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                style={{ paddingLeft: `${(heading.level - 1) * 16 + 12}px` }}
                title={heading.text}
              >
                <span className="block truncate">{heading.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 