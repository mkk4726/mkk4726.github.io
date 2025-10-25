import { getSortedPostsData, getPostsByMonth, getPostsContributionDataByYear, getActiveYears, getPostsByDayOfWeek, ContributionDay } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import ContributionGraph from '@/components/ContributionGraph';
import MyServiceCard from '@/components/MyServiceCard';
import Link from 'next/link';

export default async function Home() {
  const allPosts = await getSortedPostsData(false); // Home page shows only public posts
  const posts = allPosts.slice(0, 6); // Show only the latest 6 posts
  const monthlyData = await getPostsByMonth();
  const dayOfWeekData = await getPostsByDayOfWeek();
  
  // 활동한 연도 목록 가져오기
  const availableYears = await getActiveYears();
  
  // 모든 연도의 contribution 데이터 미리 로드
  const allYearData: { [year: number]: ContributionDay[] } = {};
  for (const year of availableYears) {
    allYearData[year] = await getPostsContributionDataByYear(year);
  }
  
  const currentYear = availableYears[0] || new Date().getFullYear();
  const contributionData = allYearData[currentYear] || [];

  // 통계 계산
  const totalPosts = monthlyData.reduce((sum, item) => sum + item.count, 0);
  const totalDays = contributionData.filter(day => day.count > 0).length;
  const averagePerMonth = monthlyData.length > 0 ? (totalPosts / monthlyData.length).toFixed(1) : '0';
  const mostActiveMonth = monthlyData.reduce((max, month) => month.count > max.count ? month : max, { date: '-', count: 0 });
  const mostActiveDayOfWeek = dayOfWeekData.reduce((max, day) => day.count > max.count ? day : max, { date: '-', count: 0 });
  const longestStreak = calculateStreak(contributionData);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 콘텐츠 (왼쪽) */}
        <div className="lg:col-span-2">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Welcome to my little victories
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A space where I document the small but precious moments 
              I encounter in my journey through technology, development, and life.
            </p>
          </div>

          {/* Latest Posts Section */}
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Latest Posts</h2>
            {posts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} enableSearchHighlight={false} />
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

          {/* Call to Action */}
          {posts.length > 0 && (
            <div className="text-center">
              <Link
                href="/posts"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                View All Posts
              </Link>
            </div>
          )}
        </div>

        {/* 사이드바 (오른쪽) */}
        <div className="lg:col-span-1 space-y-8">
          {/* 내가 만든 서비스 */}
          <MyServiceCard />
          
          {/* GitHub 스타일 잔디밭 */}
          <ContributionGraph 
            allYearData={allYearData}
            availableYears={availableYears}
            title="포스트 활동 잔디밭" 
          />
          
          {/* 상세 블로그 통계 카드 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 블로그 통계</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 dark:text-gray-400">총 포스트</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalPosts}개</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 dark:text-gray-400">활동한 날</span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">{totalDays}일</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 dark:text-gray-400">월평균 포스트</span>
                  <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">{averagePerMonth}개</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 dark:text-gray-400">가장 활발한 월</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{mostActiveMonth.date}</span>
                  <span className="text-xs text-gray-500">({mostActiveMonth.count}개)</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 dark:text-gray-400">선호 요일</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{mostActiveDayOfWeek.date}</span>
                  <span className="text-xs text-gray-500">({mostActiveDayOfWeek.count}개)</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 dark:text-gray-400">최장 연속 기록</span>
                  <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">{longestStreak}일</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 연속 포스팅 기록을 계산하는 함수
function calculateStreak(data: ContributionDay[]): number {
  let maxStreak = 0;
  let currentStreak = 0;
  
  for (const day of data) {
    if (day.count > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
}
