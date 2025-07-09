import { getAllPostIds, getPostData } from '@/lib/posts';
import { format } from 'date-fns';
import Link from 'next/link';
import MarkdownContent from '@/components/MarkdownContent';
import TableOfContents from '@/components/TableOfContents';
import CodeHighlight from '@/components/CodeHighlight';
import JupyterNotebook from '@/components/JupyterNotebook';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
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
            {post.isNotebook ? (
              <JupyterNotebook content={post.content} />
            ) : (
              <CodeHighlight>
                <MarkdownContent 
                  content={post.content}
                  className="prose prose-xl max-w-none text-gray-900 leading-loose font-sans"
                />
              </CodeHighlight>
            )}
          </article>
        </div>

        {/* Table of Contents - 데스크톱에서만 표시 */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <TableOfContents />
        </div>
      </div>
    </div>
  );
} 