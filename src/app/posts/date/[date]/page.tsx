import { getPostsByDate, getSortedPostsData } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

interface DatePageProps {
  params: Promise<{
    date: string;
  }>;
}

export async function generateStaticParams() {
  const allPosts = await getSortedPostsData();
  const uniqueDates = [...new Set(allPosts.map(post => post.date))];
  
  return uniqueDates.map((date) => ({
    date: date,
  }));
}

export default async function DatePage({ params }: DatePageProps) {
  const { date } = await params;
  const posts = await getPostsByDate(date);

  // 날짜 포맷팅
  const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/posts"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-2"
          >
            ← 모든 포스트
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          📅 {formattedDate}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400">
          {posts.length > 0 
            ? `${posts.length}개의 포스트가 작성되었습니다.`
            : '이 날짜에는 작성된 포스트가 없습니다.'
          }
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {formattedDate}에는 작성된 포스트가 없습니다.
          </p>
          <Link 
            href="/posts" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            모든 포스트 보기
          </Link>
        </div>
      )}
    </div>
  );
} 