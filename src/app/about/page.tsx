import { getAboutData, getResumeData, getPortfolioData } from '@/lib/content';
import AboutContent from '@/components/AboutContent';
import Link from 'next/link';

export default function AboutPage() {
  const aboutData = getAboutData();
  const resumeData = getResumeData();
  const portfolioData = getPortfolioData();

  const aboutPages = [
    {
      id: 'about',
      title: aboutData.title,
      excerpt: '개인 소개 및 연락처 정보',
      lastUpdated: aboutData.lastUpdated,
      href: '#about',
      icon: '👤'
    },
    {
      id: 'portfolio',
      title: portfolioData.title,
      excerpt: '주요 프로젝트 및 기술 스택',
      lastUpdated: portfolioData.lastUpdated,
      href: '#portfolio',
      icon: '💼'
    },
    {
      id: 'resume',
      title: resumeData.title,
      excerpt: '경력 및 학력 사항',
      lastUpdated: resumeData.lastUpdated,
      href: '#resume',
      icon: '📄'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-900">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          About
        </h1>
        <p className="text-white mb-6">
          저에 대한 정보와 경력을 확인할 수 있습니다.
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12">
        {aboutPages.map((page) => (
          <article
            key={page.id}
            className="bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-700"
          >
            <div className="p-5 lg:p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{page.icon}</span>
                <h2 className="text-xl lg:text-xl font-bold text-white">
                  {page.title}
                </h2>
              </div>
              
              <p className="text-base text-white mb-4 line-clamp-3">
                {page.excerpt}
              </p>
              
              {page.lastUpdated && (
                <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                  <span>Last updated: {page.lastUpdated}</span>
                </div>
              )}
              
              <Link
                href={page.href}
                className="inline-flex items-center text-blue-300 hover:text-blue-200 font-medium"
              >
                자세히 보기
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* 상세 내용 섹션 */}
      <div className="space-y-12">
        {/* About Me Section */}
        <div id="about" className="bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{aboutData.title}</h2>
            {aboutData.lastUpdated && (
              <span className="text-sm text-gray-300">
                Last updated: {aboutData.lastUpdated}
              </span>
            )}
          </div>
          <AboutContent content={aboutData.content} />
        </div>

        {/* Portfolio Section */}
        <div id="portfolio" className="bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{portfolioData.title}</h2>
            {portfolioData.lastUpdated && (
              <span className="text-sm text-gray-300">
                Last updated: {portfolioData.lastUpdated}
              </span>
            )}
          </div>
          <AboutContent content={portfolioData.content} />
        </div>

        {/* Resume Section */}
        <div id="resume" className="bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{resumeData.title}</h2>
            {resumeData.lastUpdated && (
              <span className="text-sm text-gray-300">
                Last updated: {resumeData.lastUpdated}
              </span>
            )}
          </div>
          <AboutContent content={resumeData.content} />
        </div>
      </div>
    </div>
  );
} 