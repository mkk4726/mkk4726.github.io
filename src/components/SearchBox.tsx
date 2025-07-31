'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  date: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  content?: string;
}

// 검색된 텍스트를 하이라이트하는 함수
function highlightText(text: string, searchTerm: string, maxLength: number = 150) {
  if (!text || !searchTerm) return text;
  
  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerSearchTerm);
  
  if (index === -1) return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + searchTerm.length + 50);
  let highlighted = text.substring(start, end);
  
  // 검색어를 하이라이트
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  
  if (start > 0) highlighted = '...' + highlighted;
  if (end < text.length) highlighted = highlighted + '...';
  
  return highlighted;
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 검색 인덱스 로드
  useEffect(() => {
    const loadSearchIndex = async () => {
      try {
        const response = await fetch('/search-index.json');
        if (response.ok) {
          const data = await response.json();
          setSearchIndex(data);
        }
      } catch (error) {
        console.error('Failed to load search index:', error);
      }
    };

    loadSearchIndex();
  }, []);

  // 클라이언트 사이드 검색 (useCallback으로 감싸서 dependency 문제 해결)
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim() || searchIndex.length === 0) {
      return [];
    }

    const searchTerm = searchQuery.toLowerCase();
    return searchIndex.filter(post => {
      const title = post.title.toLowerCase();
      const content = (post.content || '').toLowerCase();
      const category = (post.category || '').toLowerCase();
      const tags = (post.tags || []).join(' ').toLowerCase();
      const excerpt = (post.excerpt || '').toLowerCase();

      return title.includes(searchTerm) ||
             content.includes(searchTerm) ||
             category.includes(searchTerm) ||
             tags.includes(searchTerm) ||
             excerpt.includes(searchTerm);
    }).slice(0, 10); // 최대 10개 결과만
  }, [searchIndex]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      const searchResults = performSearch(query);
      setResults(searchResults);
      setIsOpen(true);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/posts?search=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            autoComplete="off"
            spellCheck="false"
            className="search-input w-full sm:w-64 px-4 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              color: '#000000',
              backgroundColor: '#ffffff',
              WebkitTextFillColor: '#000000',
              textShadow: 'none',
              fontSize: '14px',
              fontWeight: 'normal',
              opacity: '1',
              caretColor: '#000000',
              '--tw-text-opacity': '1'
            } as React.CSSProperties}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            ) : (
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {results.length}개의 검색 결과
            </div>
            {results.map((result) => {
              // 검색어가 제목에 있는지 확인
              const titleMatch = result.title.toLowerCase().includes(query.toLowerCase());
              // 검색어가 내용에 있는지 확인
              const contentMatch = result.content?.toLowerCase().includes(query.toLowerCase());
              
              return (
                <Link
                  key={result.id}
                  href={`/posts/${result.id}`}
                  onClick={handleResultClick}
                  className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                    {titleMatch ? (
                      <span dangerouslySetInnerHTML={{ 
                        __html: highlightText(result.title, query, 100) 
                      }} />
                    ) : (
                      result.title
                    )}
                  </div>
                  {result.excerpt && (
                    <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">
                      {result.excerpt}
                    </div>
                  )}
                  {contentMatch && !titleMatch && (
                    <div 
                      className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(result.content || '', query, 150) 
                      }}
                    />
                  )}
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{result.date}</span>
                    {result.category && (
                      <>
                        <span className="mx-1">•</span>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                          {result.category}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim().length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            검색 결과가 없습니다.
          </div>
        </div>
      )}
    </div>
  );
} 