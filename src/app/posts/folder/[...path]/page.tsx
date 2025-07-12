import { getPostsByFolderPath, getAllFolderPaths, getFolderStructure, getPostsContributionDataByFolderAndYear, getActiveYearsByFolder, ContributionDay } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import FolderTree from '@/components/FolderTree';
import ContributionGraph from '@/components/ContributionGraph';
import Link from 'next/link';

interface FolderPageProps {
  params: Promise<{
    path: string[];
  }>;
}

export async function generateStaticParams() {
  const folderPaths = getAllFolderPaths();
  return folderPaths.map((folderPath) => ({
    path: folderPath.split('/'),
  }));
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { path } = await params;
  const folderPath = path.join('/');
  const decodedFolderPath = decodeURIComponent(folderPath);
  
  const posts = await getPostsByFolderPath(decodedFolderPath);
  const folderStructure = getFolderStructure();

  // 폴더 이름 추출 (마지막 세그먼트)
  const folderName = decodedFolderPath.split('/').pop() || decodedFolderPath;

  // 폴더별 잔디밭 데이터 가져오기
  const activeYears = await getActiveYearsByFolder(decodedFolderPath);
  
  // 모든 연도의 잔디밭 데이터 준비
  const allYearData: { [year: number]: ContributionDay[] } = {};
  for (const year of activeYears) {
    allYearData[year] = await getPostsContributionDataByFolderAndYear(decodedFolderPath, year);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col xl:flex-row gap-8">
        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link 
                href="/posts" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                ← 모든 포스트
              </Link>
            </div>
            
            {/* 브레드크럼 */}
            <nav className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Link 
                  href="/posts"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  📄 Posts
                </Link>
                {decodedFolderPath.split('/').map((segment, index) => {
                  const segmentPath = decodedFolderPath.split('/').slice(0, index + 1).join('/');
                  return (
                    <span key={index} className="flex items-center space-x-2">
                      <span>/</span>
                      <Link
                        href={`/posts/folder/${encodeURIComponent(segmentPath)}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        📁 {segment}
                      </Link>
                    </span>
                  );
                })}
              </div>
            </nav>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              📁 {folderName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {posts.length}개의 포스트 (하위 폴더 포함)
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
                이 폴더에는 아직 포스트가 없습니다.
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

        {/* 사이드바 */}
        <div className="xl:w-80 flex-shrink-0 space-y-6">
          {/* 폴더 구조 */}
          <FolderTree nodes={folderStructure} selectedPath={decodedFolderPath} />

          {/* 폴더별 잔디밭 */}
          {activeYears.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                🌱 {folderName} 폴더 활동 잔디밭
              </h3>
                             <ContributionGraph
                 allYearData={allYearData}
                 availableYears={activeYears}
                 title={`${folderName} 폴더 활동`}
               />
            </div>
          )}

          {/* 폴더별 통계 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              📊 폴더 통계
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">총 포스트 수</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{posts.length}개</span>
              </div>
              {activeYears.length > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">활동 기간</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {activeYears[activeYears.length - 1]} ~ {activeYears[0]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">활동 연도</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {activeYears.length}년
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 