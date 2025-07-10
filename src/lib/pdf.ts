// 정적 임포트로 변경 (청크 로딩 문제 해결)
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
}

// 임시 CSS 스타일을 삽입하여 oklch를 무력화
function addPdfCompatibleStyles(doc: Document): HTMLStyleElement {
  const style = doc.createElement('style');
  style.id = 'pdf-compatibility-styles';
  style.textContent = `
    /* PDF 호환성을 위한 기본 색상 오버라이드 */
    * {
      color: #374151 !important;
      background-color: transparent !important;
      border-color: #d1d5db !important;
    }
    
    body {
      background-color: #ffffff !important;
      color: #111827 !important;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: #111827 !important;
    }
    
    .prose h1, .prose h2, .prose h3 {
      color: #111827 !important;
    }
    
    .prose p, .prose li, .prose td {
      color: #374151 !important;
    }
    
    .prose code {
      background-color: #f3f4f6 !important;
      color: #1f2937 !important;
    }
    
    .prose pre {
      background-color: #1f2937 !important;
      color: #f9fafb !important;
    }
    
    .prose blockquote {
      border-left-color: #3b82f6 !important;
      background-color: #eff6ff !important;
    }
    
    .prose table th {
      background-color: #f9fafb !important;
      color: #374151 !important;
    }
    
    .prose table td {
      color: #374151 !important;
    }
    
    .prose table tr:nth-child(even) {
      background-color: #f8fafc !important;
    }
    
    .bg-blue-100 {
      background-color: #dbeafe !important;
    }
    
    .text-blue-800 {
      color: #1e40af !important;
    }
    
    .bg-gray-100 {
      background-color: #f3f4f6 !important;
    }
    
    .text-gray-700 {
      color: #374151 !important;
    }
    
    .text-gray-600 {
      color: #4b5563 !important;
    }
    
    .text-gray-900 {
      color: #111827 !important;
    }
    
    .bg-white {
      background-color: #ffffff !important;
    }
    
    .shadow-md {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
    }
    
    .rounded-lg {
      border-radius: 0.5rem !important;
    }
    
    .rounded-full {
      border-radius: 9999px !important;
    }
    
    /* 모든 oklch 관련 스타일 무효화 */
    [style*="oklch"] {
      color: #374151 !important;
      background-color: transparent !important;
    }
  `;
  
  doc.head.appendChild(style);
  return style;
}

export async function generatePdfFromElement(
  element: HTMLElement,
  options: PdfOptions = {}
): Promise<void> {
  // 클라이언트 사이드에서만 실행되도록 확인
  if (typeof window === 'undefined') {
    throw new Error('PDF 생성은 브라우저에서만 가능합니다.');
  }

  const {
    filename = 'document.pdf',
    format = 'a4',
    orientation = 'portrait',
    quality = 0.98
  } = options;

  try {
    console.log('PDF 라이브러리 로드 완료 (정적 임포트)');

    // PDF 생성을 위한 임시 스타일 적용
    const originalDisplay = element.style.display;
    const originalPosition = element.style.position;
    const originalLeft = element.style.left;
    const originalTop = element.style.top;
    
    // 요소를 화면에 완전히 표시되도록 설정
    element.style.display = 'block';
    element.style.position = 'static';
    element.style.left = 'auto';
    element.style.top = 'auto';

    console.log('요소 스타일 설정 완료');

    // 잠시 대기하여 레이아웃이 안정화되도록 함
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('캔버스 생성 시작...');

    // HTML 요소를 캔버스로 변환
    const canvas = await html2canvas(element, {
      scale: 1.5, // 스케일을 줄여서 안정성 향상
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      logging: false,
      ignoreElements: (element) => {
        // 문제가 될 수 있는 요소들 무시
        return element.classList.contains('no-print') || 
               element.tagName === 'BUTTON' || 
               element.tagName === 'NAV' ||
               element.hasAttribute('data-nextjs-scroll-focus-boundary');
      },
      onclone: (clonedDoc, _element) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        console.log('문서 클론 생성 완료');
        
        try {
          // PDF 호환 스타일 추가
          addPdfCompatibleStyles(clonedDoc);
          console.log('PDF 호환 스타일 추가 완료');
          
          // 기존 스타일시트에서 oklch 제거 시도
          const styleSheets = Array.from(clonedDoc.styleSheets);
          styleSheets.forEach((sheet, index) => {
            try {
              if (sheet.href && sheet.href.includes('_next')) {
                // Next.js 스타일시트 비활성화
                const linkElement = clonedDoc.querySelector(`link[href="${sheet.href}"]`) as HTMLLinkElement;
                if (linkElement) {
                  linkElement.disabled = true;
                }
              }
            } catch (e) {
               console.log(`스타일시트 ${index} 처리 건너뛰기:`, e instanceof Error ? e.message : '알 수 없는 오류');
             }
          });
          
          // 클론된 문서에서 불필요한 요소들 제거
          const elementsToRemove = clonedDoc.querySelectorAll('.no-print, button, nav, script, [data-nextjs-scroll-focus-boundary]');
          elementsToRemove.forEach(el => {
            el.remove();
          });
          
          // 코드 블록 스타일 개선
          const codeBlocks = clonedDoc.querySelectorAll('pre code');
          codeBlocks.forEach(block => {
            (block as HTMLElement).style.whiteSpace = 'pre-wrap';
            (block as HTMLElement).style.wordBreak = 'break-word';
          });
          
        } catch (e) {
          console.log('클론 문서 처리 중 오류:', e instanceof Error ? e.message : '알 수 없는 오류');
        }
      }
    });

    console.log('캔버스 생성 완료', {
      width: canvas.width,
      height: canvas.height
    });

    // 원래 스타일 복원
    element.style.display = originalDisplay;
    element.style.position = originalPosition;
    element.style.left = originalLeft;
    element.style.top = originalTop;

    // PDF 생성
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: format === 'a4' ? [595, 842] : [612, 792],
      compress: true
    });

    // 페이지 크기 계산
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // 이미지 크기 계산
    const imgWidth = contentWidth;

    // 이미지를 페이지에 맞게 나누기
    let yPosition = 0;
    let pageNumber = 1;

    console.log('PDF 페이지 생성 시작...');

    while (yPosition < canvas.height) {
      // 새 페이지 추가 (첫 페이지 제외)
      if (pageNumber > 1) {
        pdf.addPage();
      }

      // 현재 페이지에 들어갈 이미지 높이 계산
      const sourceY = yPosition;
      const sourceHeight = Math.min(
        (contentHeight * canvas.width) / imgWidth,
        canvas.height - yPosition
      );

      // 캔버스에서 해당 부분 추출
      const pageCanvas = document.createElement('canvas');
      const pageContext = pageCanvas.getContext('2d');
      
      if (pageContext) {
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        pageContext.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        );

        // PDF에 이미지 추가
        const pageImageData = pageCanvas.toDataURL('image/jpeg', quality);
        const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
        
        pdf.addImage(
          pageImageData,
          'JPEG',
          margin,
          margin,
          imgWidth,
          pageImgHeight
        );
      }

      yPosition += sourceHeight;
      pageNumber++;
    }

    console.log(`PDF 생성 완료: ${pageNumber - 1} 페이지`);

    // PDF 다운로드
    pdf.save(filename);
    
  } catch (error) {
    console.error('PDF 생성 중 상세 오류:', error);
    throw new Error(`PDF 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

export async function generatePostPdf(
  postTitle: string,
  postElement: HTMLElement
): Promise<void> {
  const sanitizedTitle = postTitle.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const filename = `${sanitizedTitle}.pdf`;
  
  return generatePdfFromElement(postElement, {
    filename,
    format: 'a4',
    orientation: 'portrait',
    quality: 0.95
  });
} 