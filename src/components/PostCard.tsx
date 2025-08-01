'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { PostData } from '@/lib/posts';
import { useSearchParams } from 'next/navigation';

interface PostCardProps {
  post: Omit<PostData, 'content'> & { content?: string };
  enableSearchHighlight?: boolean;
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

// 기본 PostCard 컴포넌트 (검색 하이라이트 없음)
function BasePostCard({ post }: { post: Omit<PostData, 'content'> & { content?: string } }) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-5 lg:p-6">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <time dateTime={post.date}>
            {format(new Date(post.date), 'MMMM dd, yyyy')}
          </time>
          {post.category && (
            <Link 
              href={`/posts/category/${encodeURIComponent(post.category)}`}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              {post.category}
            </Link>
          )}
        </div>
        
        <Link href={`/posts/${post.id}`} className="block">
          <h2 className="text-xl lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
          
          {post.excerpt && (
            <p className="text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </Link>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// 검색 하이라이트가 있는 PostCard 컴포넌트
function SearchablePostCard({ post }: { post: Omit<PostData, 'content'> & { content?: string } }) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';
  
  // 검색어가 제목에 있는지 확인
  const titleMatch = searchQuery && post.title.toLowerCase().includes(searchQuery.toLowerCase());
  // 검색어가 내용에 있는지 확인
  const contentMatch = searchQuery && post.content?.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-5 lg:p-6">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <time dateTime={post.date}>
            {format(new Date(post.date), 'MMMM dd, yyyy')}
          </time>
          {post.category && (
            <Link 
              href={`/posts/category/${encodeURIComponent(post.category)}`}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              {post.category}
            </Link>
          )}
        </div>
        
        <Link href={`/posts/${post.id}`} className="block">
          <h2 className="text-xl lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {titleMatch ? (
              <span dangerouslySetInnerHTML={{ 
                __html: highlightText(post.title, searchQuery, 100) 
              }} />
            ) : (
              post.title
            )}
          </h2>
          
          {post.excerpt && (
            <p className="text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {post.excerpt}
            </p>
          )}
          
          {/* 검색어가 내용에 있을 때 내용 일부 표시 */}
          {contentMatch && !titleMatch && post.content && (
            <div 
              className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2"
              dangerouslySetInnerHTML={{ 
                __html: highlightText(post.content, searchQuery, 200) 
              }}
            />
          )}
        </Link>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// 메인 PostCard 컴포넌트
export default function PostCard({ post, enableSearchHighlight = false }: PostCardProps) {
  if (enableSearchHighlight) {
    return <SearchablePostCard post={post} />;
  }
  return <BasePostCard post={post} />;
} 