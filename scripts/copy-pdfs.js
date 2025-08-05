const fs = require('fs');
const path = require('path');

function copyPdfFiles() {
  const sourceDir = path.join(process.cwd(), 'src/content/posts');
  const targetDir = path.join(process.cwd(), 'public/post');
  
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
        console.log(`Copying PDF: ${sourcePath} -> ${targetPath}`);
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }
  
  try {
    copyDirectory(sourceDir, targetDir);
    console.log('PDF files copied successfully!');
  } catch (error) {
    console.error('Error copying PDF files:', error);
    process.exit(1);
  }
}

copyPdfFiles(); 