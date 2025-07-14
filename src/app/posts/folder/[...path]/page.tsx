import { getPostsByFolderPath, getAllFolderPaths, getFolderStructure, getPostsContributionDataByFolderAndYear, getActiveYearsByFolder, ContributionDay, getPostsByFolderAndDate, getSortedPostsData } from '@/lib/posts';
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
  const folderPaths = await getAllFolderPaths();
  const allPosts = await getSortedPostsData();
  
  const params: { path: string[] }[] = [];
  
  // 폴더 경로 생성
  folderPaths.forEach((folderPath) => {
    params.push({
      path: folderPath.split('/'),
    });
  });
  
  // 폴더별 날짜 페이지 경로 생성
  const folderDateMap = new Map<string, Set<string>>();
  
  for (const post of allPosts) {
    const postFolder = post.id.includes('/') ? post.id.substring(0, post.id.lastIndexOf('/')) : '';
    
    if (postFolder) {
      if (!folderDateMap.has(postFolder)) {
        folderDateMap.set(postFolder, new Set());
      }
      folderDateMap.get(postFolder)!.add(post.date);
    }
  }
  
  // 각 폴더와 날짜 조합에 대해 파라미터 생성
  for (const [folderPath, dates] of folderDateMap) {
    for (const date of dates) {
      params.push({
        path: [...folderPath.split('/'), 'date', date],
      });
    }
  }
  
  return params;
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { path } = await params;
  
  // URL 세그먼트 파싱: 마지막 두 세그먼트가 'date/YYYY-MM-DD' 형태인지 확인
  const isDatePage = path.length >= 2 && 
                     path[path.length - 2] === 'date' && 
                     /^\d{4}-\d{2}-\d{2}$/.test(path[path.length - 1]);
  
  if (isDatePage) {
    // 날짜 페이지 처리
    const date = path[path.length - 1];
    const folderPath = path.slice(0, -2).join('/');
    const decodedFolderPath = decodeURIComponent(folderPath);
    
    return <FolderDatePageContent folderPath={decodedFolderPath} date={date} />;
  } else {
    // 폴더 페이지 처리
    const folderPath = path.join('/');
    const decodedFolderPath = decodeURIComponent(folderPath);
    
    return <FolderPageContent folderPath={decodedFolderPath} />;
  }
}

// 폴더 페이지 컴포넌트
async function FolderPageContent({ folderPath }: { folderPath: string }) {
  const posts = await getPostsByFolderPath(folderPath);
  const folderStructure = getFolderStructure();

  // 폴더 이름 추출 (마지막 세그먼트)
  const folderName = folderPath.split('/').pop() || folderPath;

  // 폴더별 잔디밭 데이터 가져오기
  const activeYears = await getActiveYearsByFolder(folderPath);
  
  // 모든 연도의 잔디밭 데이터 준비
  const allYearData: { [year: number]: ContributionDay[] } = {};
  for (const year of activeYears) {
    allYearData[year] = await getPostsContributionDataByFolderAndYear(folderPath, year);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* 브레드크럼 - 모바일에서 줄바꿈 처리 */}
      <div className="flex flex-wrap items-center gap-1 lg:gap-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-4">
        <Link href="/posts" className="hover:text-blue-600 dark:hover:text-blue-400">
          모든 포스트
        </Link>
        <span className="hidden sm:inline">{'>'}</span>
        <span className="font-medium">폴더</span>
        {folderPath.split('/').map((segment, index, array) => (
          <span key={index} className="flex items-center gap-1 lg:gap-2">
            <span className="hidden sm:inline">{'>'}</span>
            <Link 
              href={`/posts/folder/${array.slice(0, index + 1).map(s => encodeURIComponent(s)).join('/')}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 break-words"
            >
              {segment}
            </Link>
          </span>
        ))}
      </div>
      
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        📁 {folderName}
      </h1>
      
      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-6">
        {posts.length > 0 
          ? `${posts.length}개의 포스트가 있습니다.`
          : '이 폴더에는 아직 포스트가 없습니다.'
        }
      </p>

      {/* 모바일: 세로 레이아웃, 데스크톱: 가로 레이아웃 */}
      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        {/* 메인 콘텐츠 - 포스트 리스트 */}
        <div className="flex-1">
          {posts.length > 0 ? (
            <div className="grid gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 lg:py-12">
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

        {/* 사이드바 - 모바일에서 상단에, 데스크톱에서 우측에 */}
        <div className="xl:w-80 xl:flex-shrink-0 space-y-3 xl:space-y-4">
          {/* 폴더별 잔디밭 */}
          {activeYears.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 lg:mb-3">
                🌱 {folderName} 폴더 활동 잔디밭
              </h3>
              <ContributionGraph
                allYearData={allYearData}
                availableYears={activeYears}
                title={`${folderName} 폴더 활동`}
                folderPath={folderPath}
              />
            </div>
          )}

          {/* 폴더별 통계 */}
          {posts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 lg:mb-3">📊 폴더 통계</h3>
              <div className="space-y-2 lg:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">포스트 수</span>
                  <span className="text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">{posts.length}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">활동 기간</span>
                  <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activeYears.length > 0 ? 
                      activeYears.length > 1 ? 
                        `${activeYears[activeYears.length - 1]} ~ ${activeYears[0]}` : 
                        activeYears[0] 
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">활동 연도</span>
                  <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activeYears.length}년
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 폴더 구조 */}
          <FolderTree nodes={folderStructure} selectedPath={folderPath} />
        </div>
      </div>
    </div>
  );
}

// 폴더별 날짜 페이지 컴포넌트
async function FolderDatePageContent({ folderPath, date }: { folderPath: string; date: string }) {
  const posts = await getPostsByFolderAndDate(folderPath, date);
  
  // 폴더 이름 추출 (마지막 세그먼트)
  const folderName = folderPath.split('/').pop() || folderPath;

  // 날짜 포맷팅
  const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
        <Link 
          href={`/posts/folder/${folderPath.split('/').map(s => encodeURIComponent(s)).join('/')}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-2 text-sm lg:text-base"
        >
          ← {folderName} 폴더로 돌아가기
        </Link>
        <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
        <Link 
          href="/posts"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-2 text-sm lg:text-base"
        >
          모든 포스트
        </Link>
      </div>
      
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        📅 {formattedDate}
      </h1>
      
      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2">
        <span className="font-medium text-blue-600 dark:text-blue-400">{folderName}</span> 폴더에서
      </p>
      
      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-6">
        {posts.length > 0 
          ? `${posts.length}개의 포스트가 작성되었습니다.`
          : '이 날짜에는 작성된 포스트가 없습니다.'
        }
      </p>

      {posts.length > 0 ? (
        <div className="grid gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 lg:py-12">
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 mb-4">
            {formattedDate}에는 <span className="font-medium text-blue-600 dark:text-blue-400">{folderName}</span> 폴더에서 작성된 포스트가 없습니다.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Link 
              href={`/posts/folder/${folderPath.split('/').map(s => encodeURIComponent(s)).join('/')}`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm lg:text-base"
            >
              {folderName} 폴더의 다른 포스트 보기
            </Link>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
            <Link 
              href="/posts" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm lg:text-base"
            >
              모든 포스트 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 