import { Suspense } from 'react';
import { getSortedPostsData, getFolderStructure } from '@/lib/posts';
import PostsPageClient from './PostsPageClient';

export default async function PostsPage() {
  // 모든 포스트를 가져오고 클라이언트에서 관리자 모드에 따라 필터링
  const posts = await getSortedPostsData(true);
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