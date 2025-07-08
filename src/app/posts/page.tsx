import { getSortedPostsData } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export default function PostsPage() {
  const posts = getSortedPostsData();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">All Posts</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Browse through all my blog posts and articles.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No posts yet.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create your first post by adding a markdown file to the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">src/content/posts</code> directory.
          </p>
        </div>
      )}
    </div>
  );
} 