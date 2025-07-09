import { getPostsByCategory, getAllCategories } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    category: category,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const posts = await getPostsByCategory(decodedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/posts" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            ← All Posts
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Category: {decodedCategory}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {posts.length} post{posts.length !== 1 ? 's' : ''} in this category
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
          <p className="text-gray-600 dark:text-gray-300 mb-4">No posts in this category yet.</p>
          <Link 
            href="/posts" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            View all posts
          </Link>
        </div>
      )}
    </div>
  );
} 