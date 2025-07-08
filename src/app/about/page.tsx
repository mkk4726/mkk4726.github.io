import MarkdownContent from '@/components/MarkdownContent';
import { getResumeData, getPortfolioData } from '@/lib/content';

export default function AboutPage() {
  const resumeData = getResumeData();
  const portfolioData = getPortfolioData();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* About Me Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Me</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            안녕하세요! 저는 기술과 데이터에 대한 열정을 가진 개발자입니다. 
            지식을 공유하고 경험을 나누는 것을 좋아하며, 이 블로그는 제가 기술 여정을 기록하고 
            인사이트를 공유하며 동료 개발자들과 연결하는 개인 공간입니다.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What I Write About</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>웹 개발과 현대적인 프레임워크</li>
            <li>프로그래밍 모범 사례와 팁</li>
            <li>기술 트렌드와 인사이트</li>
            <li>개인 프로젝트와 경험</li>
            <li>학습 자료와 튜토리얼</li>
            <li>데이터 분석과 머신러닝</li>
          </ul>
        </div>
      </div>

      {/* Resume Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{resumeData.title}</h2>
          {resumeData.lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {resumeData.lastUpdated}
            </span>
          )}
        </div>
        
        <MarkdownContent content={resumeData.content} />
      </div>

      {/* Portfolio Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{portfolioData.title}</h2>
          {portfolioData.lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {portfolioData.lastUpdated}
            </span>
          )}
        </div>
        
        <MarkdownContent content={portfolioData.content} />
      </div>

      {/* Contact Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
        
        <p className="text-gray-600 mb-6">
          저는 항상 토론, 협업, 피드백에 열려있습니다. 언제든지 연락해 주세요:
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">연락처</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                mkk4726@naver.com
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">소셜 미디어</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/mkk4726" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  github.com/mkk4726
                </a>
              </li>
              <li>
                <a 
                  href="https://www.linkedin.com/in/minku-kim-01aaa5216/m" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                  linkedin.com/in/minku-kim
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 