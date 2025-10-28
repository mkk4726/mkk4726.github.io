const fs = require('fs');
const path = require('path');

function copyPdfFiles() {
  const sourceDir = path.join(process.cwd(), 'src/content/posts');
  const targetDir = path.join(process.cwd(), 'public/post');
  
  let successCount = 0;
  let failCount = 0;
  const failedFiles = [];
  
  function copyDirectory(source, target) {
    // 타겟 디렉토리가 없으면 생성
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }
    
    const items = fs.readdirSync(source);
    
    for (const item of items) {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        // 디렉토리인 경우 재귀적으로 복사
        copyDirectory(sourcePath, targetPath);
      } else if (item.toLowerCase().endsWith('.pdf')) {
        // PDF 파일인 경우 복사
        try {
          fs.copyFileSync(sourcePath, targetPath);
          successCount++;
        } catch (error) {
          failCount++;
          failedFiles.push({ source: sourcePath, error: error.message });
        }
      }
    }
  }
  
  try {
    copyDirectory(sourceDir, targetDir);
    
    // 결과 요약 출력
    console.log(`📄 PDF 복사 완료: ${successCount}개 성공`);
    
    if (failCount > 0) {
      console.log(`❌ PDF 복사 실패: ${failCount}개 실패`);
      failedFiles.forEach(({ source, error }) => {
        console.log(`   - ${path.basename(source)}: ${error}`);
      });
    }
    
    if (successCount === 0 && failCount === 0) {
      console.log('📄 복사할 PDF 파일이 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ PDF 복사 중 오류 발생:', error);
    process.exit(1);
  }
}

copyPdfFiles(); 