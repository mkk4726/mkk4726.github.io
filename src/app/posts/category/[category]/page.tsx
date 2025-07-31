import { getPostsByCategory, getAllCategories, getPostsContributionDataByCategoryAndYear, getActiveYearsByCategory, ContributionDay } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import ContributionGraph from '@/components/ContributionGraph';
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
  
  // 카테고리별 잔디밭 데이터 준비
  const availableYears = await getActiveYearsByCategory(decodedCategory);
  
  // 모든 연도의 contribution 데이터 미리 로드
  const allYearData: { [year: number]: ContributionDay[] } = {};
  for (const year of availableYears) {
    allYearData[year] = await getPostsContributionDataByCategoryAndYear(decodedCategory, year);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 콘텐츠 (왼쪽) */}
        <div className="lg:col-span-2">
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
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} enableSearchHighlight={false} />
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

        {/* 사이드바 (오른쪽) - 카테고리별 잔디밭 */}
        <div className="lg:col-span-1 space-y-8">
          {availableYears.length > 0 && (
            <ContributionGraph 
              allYearData={allYearData}
              availableYears={availableYears}
              title={`${decodedCategory} 카테고리 활동 잔디밭`}
            />
          )}
          
          {/* 카테고리별 통계 카드 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 카테고리 통계</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">총 포스트 수</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{posts.length}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">활동 기간</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {availableYears.length > 0 ? 
                    availableYears.length > 1 ? 
                      `${availableYears[availableYears.length - 1]} ~ ${availableYears[0]}` : 
                      availableYears[0] 
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">활동 연도</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {availableYears.length}년
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 