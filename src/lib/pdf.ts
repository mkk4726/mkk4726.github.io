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
    // 동적으로 라이브러리 import
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);

    console.log('PDF 라이브러리 로드 완료');

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
            try {
              el.remove();
            } catch (e) {
              console.log('요소 제거 실패:', e);
            }
          });
          
          // 인라인 스타일에서 oklch 제거
          const elementsWithStyle = clonedDoc.querySelectorAll('[style*="oklch"]');
          elementsWithStyle.forEach(el => {
            try {
              const htmlEl = el as HTMLElement;
              htmlEl.style.cssText = htmlEl.style.cssText.replace(/oklch\([^)]*\)/g, '#6b7280');
            } catch (e) {
              console.log('인라인 스타일 처리 실패:', e);
            }
          });
          
          console.log('문서 정리 완료');
        } catch (error) {
          console.warn('클론 문서 처리 중 오류:', error);
        }
      }
    });

    console.log('캔버스 생성 완료, 크기:', canvas.width, 'x', canvas.height);

    // 원래 스타일 복원
    element.style.display = originalDisplay;
    element.style.position = originalPosition;
    element.style.left = originalLeft;
    element.style.top = originalTop;

    const imgData = canvas.toDataURL('image/png', quality);
    console.log('이미지 데이터 생성 완료');
    
    // PDF 생성
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    console.log('PDF 객체 생성 완료');

    // PDF 페이지 크기 계산
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // 캔버스 크기에 맞춰 이미지 크기 조정
    const imgWidth = pageWidth - 20; // 10mm 마진
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 10; // 상단 마진
    
    // 첫 페이지에 이미지 추가
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20; // 상하 마진 제외
    
    // 여러 페이지가 필요한 경우 페이지 추가
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10; // 다음 페이지 시작 위치
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }
    
    console.log('PDF 페이지 구성 완료');
    
    // PDF 다운로드
    pdf.save(filename);
    console.log('PDF 다운로드 시작:', filename);
    
  } catch (error) {
    console.error('PDF 생성 중 상세 오류:', error);
    if (error instanceof Error) {
      throw new Error(`PDF 생성에 실패했습니다: ${error.message}`);
    } else {
      throw new Error('PDF 생성에 실패했습니다: 알 수 없는 오류');
    }
  }
}

export async function generatePostPdf(
  postTitle: string,
  postElement: HTMLElement
): Promise<void> {
  const sanitizedTitle = postTitle
    .replace(/[^a-zA-Z0-9가-힣\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
    
  const filename = `${sanitizedTitle}.pdf`;
  
  await generatePdfFromElement(postElement, {
    filename,
    format: 'a4',
    orientation: 'portrait',
  });
} 