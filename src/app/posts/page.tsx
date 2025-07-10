import { Suspense } from 'react';
import { getSortedPostsData, getFolderStructure } from '@/lib/posts';
import PostsPageClient from './PostsPageClient';

export default async function PostsPage() {
  const posts = await getSortedPostsData();
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