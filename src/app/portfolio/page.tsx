import { getPortfolioData } from '@/lib/content';
import MarkdownContent from '@/components/MarkdownContent';
import CodeHighlight from '@/components/CodeHighlight';
import TableOfContents from '@/components/TableOfContents';

export default async function PortfolioPage() {
  const portfolio = await getPortfolioData();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <article className="bg-white rounded-lg shadow-md p-8">
            {/* Portfolio header */}
            <header className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 flex-1">Portfolio</h1>
              </div>
            </header>

            {/* Portfolio content */}
            <div id="post-content">
              <CodeHighlight>
                <MarkdownContent 
                  content={portfolio.content}
                  className="prose prose-xl max-w-none text-gray-900 leading-loose font-sans"
                />
              </CodeHighlight>
            </div>
          </article>
        </div>

        {/* Table of Contents - 데스크톱에서만 표시 */}
        <div className="hidden lg:block w-64 flex-shrink-0 no-print">
          <TableOfContents />
        </div>
      </div>
    </div>
  );
}
