'use client';

import { useEffect, useState } from 'react';
import { useAdminMode } from '@/hooks/useAdminMode';
import { PostData } from '@/lib/posts';
import { format } from 'date-fns';
import Link from 'next/link';
import MarkdownContent from '@/components/MarkdownContent';
import TableOfContents from '@/components/TableOfContents';
import CodeHighlight from '@/components/CodeHighlight';
import JupyterNotebook from '@/components/JupyterNotebook';
import Comments from '@/components/Comments';


interface PostDetailClientProps {
  post: PostData;
  postId: string;
}

export default function PostDetailClient({ post: initialPost, postId }: PostDetailClientProps) {
  const { isAdminMode, getAdminUrl } = useAdminMode();
  const [accessDenied, setAccessDenied] = useState(false);
  
  const post = initialPost;

  useEffect(() => {
    // Done 포스트가 아닌데 관리자 모드가 아닌 경우
    if (post.Done !== true && !isAdminMode) {
      setAccessDenied(true);
    } else {
      setAccessDenied(false);
    }
  }, [post.Done, isAdminMode]);

  if (accessDenied) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mb-8">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 필요합니다</h2>
          <p className="text-gray-600 mb-8">
            이 포스트는 아직 Done 체크가 되지 않았습니다. 관리자 모드에서만 확인할 수 있습니다.
          </p>
          <div className="space-y-4">
            <div>
              <Link 
                href="/posts"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                ← 포스트 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDone = post.Done === true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <article className={`bg-white rounded-lg shadow-md p-8 ${!isDone ? 'ring-2 ring-amber-200' : ''}`} id="post-content">
            {/* Back to posts link */}
            <div className="mb-6 no-print">
              <Link 
                href={getAdminUrl("/posts")}
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Posts
              </Link>
            </div>

            {/* Post header */}
            <header className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex-1">
                  {post.title}
                  {!isDone && (
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Draft
                    </span>
                  )}
                </h1>
              </div>
              {post.date && (
                <div className="flex items-center text-gray-600 mb-4">
                  <time dateTime={post.date}>
                    {format(new Date(post.date), 'MMMM dd, yyyy')}
                  </time>
                </div>
              )}
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Post content */}
            {post.isNotebook ? (
              <JupyterNotebook content={post.content} />
            ) : (
              <CodeHighlight>
                <MarkdownContent 
                  content={post.content}
                  className="prose prose-xl max-w-none text-gray-900 leading-loose font-sans"
                />
              </CodeHighlight>
            )}

            {/* Comments section */}
            <Comments postSlug={postId} />
          </article>
        </div>

        {/* Table of Contents - 데스크톱에서만 표시 */}
        <div className="hidden lg:block w-64 flex-shrink-0 no-print">
          <TableOfContents />
        </div>
      </div>
    </div>
  );
}
