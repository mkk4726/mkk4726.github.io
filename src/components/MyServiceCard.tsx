import Link from 'next/link';

export default function MyServiceCard() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700 p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-lg">🎬</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            내가 만든 서비스
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            사이드 프로젝트 체험해보기
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              🎭 영화 추천 서비스
            </h4>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
              Live
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            AI 기반 개인화 영화 추천 서비스로 나만의 취향에 맞는 영화를 발견해보세요.
          </p>
          <Link
            href="https://movie.mingyuprojects.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center w-full justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <span>서비스 체험하기</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 더 많은 프로젝트는 포트폴리오에서 확인하세요
        </p>
      </div>
    </div>
  );
}
