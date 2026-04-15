import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

const PORTFOLIO_DONE_PATH = 'Career/Portfolio/Done/';

function toDateLabel(date: string): string {
  if (!date) return '날짜 없음';
  return date.replace(/-/g, '.');
}

export default async function PortfolioPage() {
  const allPosts = await getSortedPostsData(true);
  const portfolioPosts = allPosts
    .filter((post) => post.id.startsWith(PORTFOLIO_DONE_PATH) && post.Done === true)
    .map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || '요약이 아직 없습니다.',
      technologies: post.tags && post.tags.length > 0 ? post.tags : ['Portfolio'],
      date: toDateLabel(post.date),
      icon: '📁',
      href: `/posts/${post.id.split('/').map((segment) => encodeURIComponent(segment)).join('/')}`,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-900">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">
          Portfolio
        </h1>
      </div>

      {/* 카드 그리드 */}
      {portfolioPosts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-600 bg-gray-800 p-6 text-gray-300">
          아직 공개된 포트폴리오가 없습니다. `posts/Career/Portfolio/Done`에 `Done: true` 글을 추가하면 자동으로 표시됩니다.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12">
          {portfolioPosts.map((post) => (
            <article
              key={post.id}
              className="bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-700"
            >
              <div className="p-5 lg:p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{post.icon}</span>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {post.title}
                  </h2>
                </div>

                <p className="text-base text-white mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {post.technologies.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                    {post.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
                        +{post.technologies.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                  <span>Date: {post.date}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href={post.href}
                    className="inline-flex items-center text-blue-300 hover:text-blue-200 font-medium"
                  >
                    자세히 보기
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
