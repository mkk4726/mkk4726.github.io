'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

interface PostData {
  id: string;
  title: string;
  date: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  content?: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  // 클라이언트 사이드 검색
  const performSearch = (searchQuery: string, allPosts: PostData[]) => {
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
  };

  // Fetch posts and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 정적 JSON 파일에서 포스트 데이터 로드
        const response = await fetch('/search-index.json');
        if (response.ok) {
          const postsData = await response.json();
          setPosts(postsData);
          
          // Extract categories
          const uniqueCategories = [...new Set(
            postsData
              .map((post: PostData) => post.category)
              .filter((category: string | undefined): category is string => category !== undefined)
          )].sort() as string[];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Filter posts based on search query
  useEffect(() => {
    if (posts.length > 0) {
      const results = performSearch(searchQuery || '', posts);
      setFilteredPosts(results);
    }
  }, [searchQuery, posts]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayTitle = searchQuery ? `검색 결과: "${searchQuery}"` : 'All Posts';
  const displayDescription = searchQuery 
    ? `"${searchQuery}"에 대한 검색 결과입니다.`
    : 'Browse through all my blog posts and articles.';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{displayTitle}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {displayDescription}
        </p>

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

        {/* Category Links - hide when searching */}
        {!searchQuery && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              <Link 
                href="/posts"
                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                All ({posts.length})
              </Link>
              {categories.map((category) => {
                const categoryPostCount = posts.filter(post => post.category === category).length;
                return (
                  <Link
                    key={category}
                    href={`/posts/category/${encodeURIComponent(category)}`}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {category} ({categoryPostCount})
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {searchQuery ? '검색 결과가 없습니다.' : 'No posts found.'}
          </p>
          {!searchQuery && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your first post by adding a markdown file to the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">src/content/posts</code> directory.
            </p>
          )}
        </div>
      )}
    </div>
  );
} 