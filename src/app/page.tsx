import { getSortedPostsData } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export default function Home() {
  const posts = getSortedPostsData().slice(0, 6); // Show only the latest 6 posts

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to My GitBlog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A personal blog where I share my thoughts, experiences, and insights about technology, 
          development, and life.
        </p>
      </div>

      {/* Latest Posts Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Posts</h2>
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No posts yet.</p>
            <p className="text-sm text-gray-500">
              Create your first post by adding a markdown file to the <code className="bg-gray-100 px-2 py-1 rounded">src/content/posts</code> directory.
            </p>
          </div>
        )}
      </div>

      {/* Call to Action */}
      {posts.length > 0 && (
        <div className="text-center">
          <a
            href="/posts"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            View All Posts
          </a>
        </div>
      )}
    </div>
  );
}
