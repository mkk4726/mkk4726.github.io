import { Suspense } from 'react';
import { getSortedPostsData, getFolderStructure } from '@/lib/posts';
import PostsPageClient from './PostsPageClient';

export default async function PostsPage() {
  // 기본적으로는 public 포스트만 로드 (관리자 모드는 클라이언트에서 처리)
  const posts = await getSortedPostsData(false);
  const folderStructure = getFolderStructure();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostsPageClient 
        posts={posts}
        folderStructure={folderStructure}
      />
    </Suspense>
  );
} 