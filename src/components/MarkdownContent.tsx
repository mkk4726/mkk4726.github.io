import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  // 간단한 마크다운 파싱 (실제 프로젝트에서는 remark나 marked 같은 라이브러리 사용 권장)
  const parseMarkdown = (text: string) => {
    return text
      // 헤더 처리
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')
      
      // 굵은 글씨
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      
      // 링크 처리
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
      
      // 리스트 처리
      .replace(/^- (.*$)/gim, '<li class="text-gray-600 mb-1">• $1</li>')
      .replace(/(<li.*<\/li>)/gim, '<ul class="list-disc list-inside text-gray-600 mb-4 space-y-1">$1</ul>')
      
      // 구분선
      .replace(/^---$/gim, '<hr class="my-8 border-gray-200">')
      
      // 단락 처리
      .replace(/\n\n/g, '</p><p class="text-gray-600 mb-4">')
      .replace(/^(?!<[h|u|l|a|s|h])(.*$)/gim, '<p class="text-gray-600 mb-4">$1</p>')
      
      // 빈 태그 제거
      .replace(/<p class="text-gray-600 mb-4"><\/p>/g, '')
      .replace(/<ul class="list-disc list-inside text-gray-600 mb-4 space-y-1"><\/ul>/g, '');
  };

  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
} 