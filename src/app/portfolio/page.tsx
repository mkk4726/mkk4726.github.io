import Link from 'next/link';

export default function PortfolioPage() {
  // const portfolioData = getPortfolioData();

  const portfolioPosts = [
    {
      id: 'lenze-size-rec',
      title: '[Visuworks] Lens Size Recommendation System',
      excerpt: '렌즈 삽입술 후 결과 예측을 통한 렌즈 사이즈 추천 시스템',
      technologies: ['Machine Learning'],
      // github: 'https://github.com/mkk4726/lenze-size-rec',
      // demo: 'https://lenze-size-demo.example.com',
      date: '2025.03 ~ 현재 (7개월)',
      icon: '👁️',
      href: '/posts/Self_Development/Career/Portfolio/visuworks_lenze_size_rec'
    },
    {
      id: 'chatbot',
      title: '[Visuworks] AI Chatbot Project',
      excerpt: '고객상담용 챗봇 설계 및 구현, 서비스 운영',
      technologies: ['RAG'],
      view: 'https://pf.kakao.com/_xiHdxeZ',
      date: '2024.11 ~ 2025.02 (4개월)',
      icon: '🤖',
      href: '/posts/Self_Development/Career/Portfolio/visuworks_chatbot'
    },
    {
      id: 'ocr-pipeline',
      title: '[Visuworks] OCR Pipeline System',
      excerpt: '99% 정확도와 1% 미만의 에러율, 안정적인 데이터 수집 파이프라인',
      technologies: ['OCR'],
      // github: 'https://github.com/mkk4726/ocr-pipeline',
      // demo: 'https://ocr-pipeline-demo.example.com',
      date: '2024-07 ~ 2024.10 (4개월)',
      icon: '🔍',
      href: '/posts/Self_Development/Career/Portfolio/visuworks_ocr_pipeline'
    },
    {
      id: 'visuworks_segmentation',
      title: '[Visuworks] Diabetic Retinal Disease Segmentation',
      excerpt: '당뇨망막병증 병변 탐지 모델 개발',
      technologies: ['Segmentation', "Contrastive Learning", 'ModelServing'],
      // github: 'https://github.com/mkk4726/retinal-segmentation',
      // demo: 'https://segmentation-demo.example.com',
      date: '2024.04 ~ 2024.06 (3개월)',
      icon: '🩺',
      href: '/posts/Self_Development/Career/Portfolio/visuworks_segmentation'
    },
    {
      id: 'aiffel_segmentation',
      title: '[Aiffel] Diabetic Retinal Disease Segmentation',
      excerpt: '부트캠프에서 기업 프로젝트를 진행하며 당뇨망막병증 병변 탐지 모델 개발한 내용입니다.',
      technologies: ["Segmentation", "MTL"],
      github: 'https://github.com/mkk4726/DR-GeuAl',
      view: 'https://www.youtube.com/watch?v=ox_jmqZ1V64&t=223s',
      date: '2023.12 ~ 2024.03 (4개월)',
      icon: '🩺',
      href: '/posts/Self_Development/Career/Portfolio/aiffel_segmentation'
    },
    {
      id: 'pnu_cloud_funding_prediction',
      title: '[PNU] Clound Funding Success prediction',
      excerpt: '대학교 졸업 프로젝트로 진행한, 클라우드 펀딩 성공 예측 서비스를 개발한 내용입니다.',
      technologies: ['ML', "Prediction", "Crawling"],
      date: '2022.03 ~ 2022.06 (4개월)',
      icon: '☁️',
      href: '/posts/Self_Development/Career/Portfolio/pnu_cloud_funding_prediction'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-900">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">
          Portfolio
        </h1>
        <p className="text-white mb-6">
          제가 진행했던 프로젝트들에 대한 내용입니다. <br />
          프로젝트를 진행하면서 고민했던 부분들과 문제를 정의하고 해결했던 과정을 담고 있습니다. <br />
          매번 최선의 선택을 하진 못했지만, 선택을 하게 된 논리적 과정과 프로젝트를 진행하며 배운 것들을 중점적으로 기술했습니다. <br />
          <br />
          - Visuworks: 스타트업에서 데이터 과학자로 일하면서 프로젝트를 리드하며 문제정의부터 서비스 운영까지, A-Z까지 모든 과정에 대한 경험을 담고 있습니다. <br />
          - Aiffel : 모두의연구소에서 AI 엔지니어 양성과정 부트캠프을 수료하며 진행했던 프로젝트입니다. <br />
          - PNU : 대학교에서 진행한 프로젝트입니다. <br />
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
                <h2 className="text-lg sm:text-xl font-bold text-white">
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
                  {post.github && (
                    <a
                      href={post.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      title="GitHub"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 4.624-5.479 4.92.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                  {post.view && (
                    <a
                      href={post.view}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      title="View"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
