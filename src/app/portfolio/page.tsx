import Link from 'next/link';

export default function PortfolioPage() {
  // const portfolioData = getPortfolioData();

  const portfolioPosts = [
    {
      id: 'ocr-pipeline',
      title: 'OCR Pipeline System',
      excerpt: '99% 정확도와 1% 미만의 에러율, 안정적인 데이터 수집 파이프라인',
      technologies: ['OCR'],
      // github: 'https://github.com/mkk4726/ocr-pipeline',
      // demo: 'https://ocr-pipeline-demo.example.com',
      date: '2024-06 ~ 2024.09 (4개월)',
      icon: '🔍',
      href: '/posts/Self_Development/Career/Portfolio/ocr_pipeline'
    },
    {
      id: 'chatbot',
      title: 'AI Chatbot Project',
      excerpt: '고객상담용 챗봇 설계 및 구현, 서비스 운영',
      technologies: ['RAG'],
      // github: 'https://github.com/mkk4726/chatbot-project',
      // demo: 'https://chatbot-demo.example.com',
      date: '2024.11 ~ 2025.02 (4개월)',
      icon: '🤖',
      href: '/posts/Self_Development/Career/Portfolio/chatbot'
    },
    {
      id: 'lenze-size-rec',
      title: 'Lens Size Recommendation System',
      excerpt: '렌즈 삽입술 후 결과 예측을 통한 렌즈 사이즈 추천 시스템',
      technologies: ['Machine Learning', 'Causal Inference', 'Statistics'],
      // github: 'https://github.com/mkk4726/lenze-size-rec',
      // demo: 'https://lenze-size-demo.example.com',
      date: '2025.03 ~ 현재 (6개월)',
      icon: '👁️',
      href: '/posts/Self_Development/Career/Portfolio/lenze_size_rec'
    },
    {
      id: 'segmentation',
      title: 'Diabetic Retinal Disease Segmentation',
      excerpt: '당뇨망막병증 병변 탐지 모델 개발',
      technologies: ['Python', 'Deep Learning', 'Computer Vision', 'PyTorch', 'Medical AI'],
      // github: 'https://github.com/mkk4726/retinal-segmentation',
      // demo: 'https://segmentation-demo.example.com',
      date: '2024.04 ~ 2024.06 (3개월)',
      icon: '🩺',
      href: '/posts/Self_Development/Career/Portfolio/segmentation'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-900">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Portfolio
        </h1>
        <p className="text-white mb-6">
          제가 진행했던 프로젝트들에 대한 내용입니다. 프로젝트가 진행된 상황과 진행하면서 고민했던 문제들, 
          그리고 이 문제들을 어떻게 해결했는지와 해결한 결과를 담고 있습니다.
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12">
        {portfolioPosts.map((post) => (
          <article
            key={post.id}
            className="bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-700"
          >
            <div className="p-5 lg:p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{post.icon}</span>
                <h2 className="text-xl lg:text-xl font-bold text-white">
                  {post.title}
                </h2>
              </div>
              
              <p className="text-base text-white mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              {/* 기술 스택 */}
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
              
              {/* 날짜 */}
              <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                <span>Date: {post.date}</span>
              </div>
              
              {/* 링크들 */}
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
                
                <div className="flex space-x-2">
                  {/* 향후 GitHub과 Demo 링크를 추가할 수 있습니다 */}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* 상세 내용 섹션 */}
      <div className="space-y-12">
        {/* Portfolio Overview Section */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-white mb-4">
              저의 경험들은 스타트업에서 근무하면서 회사에 안정적인 ML 시스템을 구축하고 서비스를 운영했던 경험들입니다.
            </p>
            <p className="text-white mb-4">
              가장 최적의 판단을 내렸다고는 자신할 수 없지만, 해당 상황에서 제가 할 수 있는 최선을 선택을 해왔다고 생각합니다.
              제가 어떻게 문제를 정의하고, 이를 해결하기 위해 어떤 선택을 했는지 살펴봐주시면 감사하겠습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
