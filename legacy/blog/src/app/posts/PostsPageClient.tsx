'use client';

import PostCard from '@/components/PostCard';
import FolderTree from '@/components/FolderTree';
import { FolderNode, PostData } from '@/lib/posts';
import { useAdminMode } from '@/hooks/useAdminMode';

interface PostsPageClientProps {
  posts: Omit<PostData, 'content'>[];
  folderStructure: FolderNode[];
}

export default function PostsPageClient({ posts, folderStructure }: PostsPageClientProps) {
  const { isAdminMode } = useAdminMode();

  const displayPosts = isAdminMode
    ? posts
    : posts.filter((post) => post.Done === true);

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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              모든 포스트
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Browse through all my blog posts and articles.
              {isAdminMode && (
                <span className="ml-2 text-sm text-red-600 dark:text-red-400">
                  (관리자 모드: Done 미체크 글 포함)
                </span>
              )}
            </p>
          </div>

          {displayPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {displayPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No posts found.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create your first post by adding a markdown file to the{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  src/content/posts
                </code>{' '}
                directory.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
