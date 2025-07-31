'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import PostCard from '@/components/PostCard';
import FolderTree from '@/components/FolderTree';
import Link from 'next/link';
import { FolderNode } from '@/lib/posts';

interface PostData {
  id: string;
  title: string;
  date: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  content?: string;
}

interface PostsPageClientProps {
  posts: Omit<PostData, 'content'>[];
  folderStructure: FolderNode[];
}

export default function PostsPageClient({ posts: initialPosts, folderStructure }: PostsPageClientProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';
  
  const [posts, setPosts] = useState<PostData[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);

  // 클라이언트 사이드 검색
  const performSearch = useCallback((searchQuery: string, allPosts: PostData[]) => {
    if (!searchQuery.trim()) {
      return allPosts;
    }

    const searchTerm = searchQuery.toLowerCase();
    return allPosts.filter(post => {
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
    });
  }, []);

  // 검색이 있을 때만 추가 포스트 데이터 로드
  useEffect(() => {
    if (searchQuery) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const response = await fetch('/search-index.json');
          if (response.ok) {
            const postsData = await response.json();
            setPosts(postsData);
          }
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
        setLoading(false);
      };
      fetchData();
    } else {
      setPosts(initialPosts as PostData[]);
      setLoading(false);
    }
  }, [searchQuery, initialPosts]);

  // 검색 결과 필터링
  useEffect(() => {
    if (posts.length > 0) {
      const results = performSearch(searchQuery, posts);
      setFilteredPosts(results);
    }
  }, [searchQuery, posts, performSearch]);

  // 표시할 포스트 결정
  const displayPosts = searchQuery ? filteredPosts : (posts.length > 0 ? posts : initialPosts);

  const displayTitle = searchQuery ? `검색 결과: "${searchQuery}"` : '모든 포스트';
  const displayDescription = searchQuery 
    ? `"${searchQuery}"에 대한 검색 결과입니다.`
    : 'Browse through all my blog posts and articles.';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 flex-shrink-0">
            <FolderTree nodes={folderStructure} />
          </div>
          <div className="flex-1">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 사이드바 - 폴더 구조 */}
        <div className="lg:w-80 flex-shrink-0">
          <FolderTree nodes={folderStructure} />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          <div className="mb-8">
            {searchQuery && (
              <div className="mb-6">
                <Link 
                  href="/posts"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← 모든 포스트 보기
                </Link>
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {displayTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {displayDescription}
            </p>
          </div>

          {displayPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {displayPosts.map((post) => (
                <PostCard key={post.id} post={post} enableSearchHighlight={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchQuery ? '검색 결과가 없습니다.' : 'No posts found.'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create your first post by adding a markdown file to the{' '}
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    src/content/posts
                  </code>{' '}
                  directory.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 