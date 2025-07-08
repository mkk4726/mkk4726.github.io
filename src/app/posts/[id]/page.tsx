import { getAllPostIds, getPostData } from '@/lib/posts';
import { format } from 'date-fns';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = getAllPostIds();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostData(id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="bg-white rounded-lg shadow-md p-8">
        {/* Back to posts link */}
        <div className="mb-6">
          <Link 
            href="/posts" 
            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Posts
          </Link>
        </div>

        {/* Post header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <time dateTime={post.date}>
              {format(new Date(post.date), 'MMMM dd, yyyy')}
            </time>
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Post content */}
        <div 
          className="prose prose-xl max-w-none text-gray-900 leading-loose font-sans"
          style={{ 
            fontFamily: "'Noto Sans KR', Arial, Helvetica, sans-serif",
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
} 