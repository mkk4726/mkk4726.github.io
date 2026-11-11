import { getResumeData } from '@/lib/content';
import AboutContent from '@/components/AboutContent';

export default function AboutPage() {
  const resumeData = getResumeData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-900">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">
          About
        </h1>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{resumeData.title}</h2>
          {resumeData.lastUpdated && (
            <span className="text-sm text-gray-300">
              Last updated: {resumeData.lastUpdated}
            </span>
          )}
        </div>
        <AboutContent content={resumeData.content} />
      </div>
    </div>
  );
} 