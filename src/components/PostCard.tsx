import Link from 'next/link';
import { format } from 'date-fns';
import { PostData } from '@/lib/posts';


interface PostCardProps {
  post: Omit<PostData, 'content'>;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-5 lg:p-6">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <time dateTime={post.date}>
            {format(new Date(post.date), 'MMMM dd, yyyy')}
          </time>
          {post.category && (
            <Link 
              href={`/posts/category/${encodeURIComponent(post.category)}`}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              {post.category}
            </Link>
          )}
        </div>
        
        <Link href={`/posts/${post.id.split('/').map(segment => encodeURIComponent(segment)).join('/')}`} className="block">
          <h2 className="text-xl lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
          
          {post.excerpt && (
            <p className="text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </Link>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
} 