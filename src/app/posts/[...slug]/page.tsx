import { Suspense } from 'react';
import { getAllPostIds, getPostData } from '@/lib/posts';
import PostDetailClient from './PostDetailClient';

export async function generateStaticParams() {
  const posts = getAllPostIds();
  return posts.map((post) => ({
    slug: post.id.split('/'),
  }));
}

export default async function Post({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const id = slug.join('/');
  const post = await getPostData(id);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostDetailClient post={post} postId={id} />
    </Suspense>
  );
} 