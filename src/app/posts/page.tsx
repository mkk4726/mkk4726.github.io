import { getSortedPostsData, getAllCategories } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

export default function PostsPage() {
  const posts = getSortedPostsData();
  const categories = getAllCategories();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">All Posts</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Browse through all my blog posts and articles.
        </p>

        {/* Category Links */}
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
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No posts found.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create your first post by adding a markdown file to the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">src/content/posts</code> directory.
          </p>
        </div>
      )}
    </div>
  );
} 