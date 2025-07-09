'use client';

import React, { useState } from 'react';
import { generatePostPdf } from '@/lib/pdf';

interface PdfDownloadButtonProps {
  postTitle: string;
  contentElementId: string;
  className?: string;
}

export default function PdfDownloadButton({ 
  postTitle, 
  contentElementId,
  className = '' 
}: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    console.log('PDF 다운로드 시작:', { postTitle, contentElementId });
    setIsGenerating(true);
    
    try {
      const contentElement = document.getElementById(contentElementId);
      console.log('콘텐츠 요소 찾기:', contentElement ? '성공' : '실패');
      
      if (!contentElement) {
        throw new Error(`콘텐츠 요소를 찾을 수 없습니다. ID: ${contentElementId}`);
      }

      console.log('콘텐츠 요소 크기:', {
        width: contentElement.offsetWidth,
        height: contentElement.offsetHeight,
        scrollWidth: contentElement.scrollWidth,
        scrollHeight: contentElement.scrollHeight
      });

      await generatePostPdf(postTitle, contentElement);
      console.log('PDF 생성 완료');
      
    } catch (error) {
      console.error('PDF 다운로드 오류:', error);
      
      let errorMessage = 'PDF 생성 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // 특정 오류 메시지에 따른 사용자 친화적 안내
        if (error.message.includes('브라우저에서만')) {
          errorMessage = '이 기능은 브라우저에서만 사용할 수 있습니다.';
        } else if (error.message.includes('콘텐츠 요소를 찾을 수 없습니다')) {
          errorMessage = '페이지 콘텐츠를 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.';
        } else if (error.message.includes('html2canvas')) {
          errorMessage = '화면 캡처 중 오류가 발생했습니다. 페이지가 완전히 로드된 후 다시 시도해주세요.';
        } else if (error.message.includes('jsPDF')) {
          errorMessage = 'PDF 생성 중 오류가 발생했습니다. 브라우저가 PDF 생성을 지원하는지 확인해주세요.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPdf}
      disabled={isGenerating}
      className={`
        no-print inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white 
        rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors duration-200 font-medium text-sm
        ${className}
      `}
      title="포스트를 PDF로 다운로드"
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          PDF 생성 중...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF 다운로드
        </>
      )}
    </button>
  );
} 