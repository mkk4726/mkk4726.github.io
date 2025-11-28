const fs = require('fs');
const path = require('path');

/**
 * 모든 마크다운 파일의 이미지 경로를 상대 경로로 변환하는 스크립트
 * 
 * 작업 내용:
 * - /post/.../파일명 → ./images/파일명
 * - HTML img 태그와 Markdown 이미지 문법 모두 처리
 */

const rootDir = process.cwd();
const postsDir = path.join(rootDir, 'posts');

// 재귀적으로 모든 마크다운 파일을 찾는 함수
function getAllMarkdownFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 이미지 경로를 상대 경로로 변환하는 함수
function convertImagePaths(content) {
  let converted = content;
  let replacementCount = 0;
  
  // HTML img 태그 처리: <img src="/post/.../파일명" → <img src="./images/파일명"
  converted = converted.replace(
    /(<img[^>]+src=")(\/post\/[^"]+\/([^/"]+))(")/g,
    (match, prefix, fullPath, filename, closingQuote) => {
      // 이미 상대 경로인 경우 건너뛰기
      if (fullPath.startsWith('./images/') || fullPath.startsWith('../')) {
        return match;
      }
      replacementCount++;
      return `${prefix}./images/${filename}${closingQuote}`;
    }
  );
  
  // Markdown 이미지 문법 처리: ![alt](/post/.../파일명) → ![alt](./images/파일명)
  converted = converted.replace(
    /(!\[[^\]]*\]\()(\/post\/[^)]+\/([^/)]+))(\))/g,
    (match, prefix, fullPath, filename, closingParen) => {
      // 이미 상대 경로인 경우 건너뛰기
      if (fullPath.startsWith('./images/') || fullPath.startsWith('../')) {
        return match;
      }
      replacementCount++;
      return `${prefix}./images/${filename}${closingParen}`;
    }
  );
  
  // /post/로 시작하지만 경로에 /가 없는 경우 (직접 파일명인 경우)
  // 예: /post/파일명.png
  converted = converted.replace(
    /(<img[^>]+src=")(\/post\/([^/"]+))(")/g,
    (match, prefix, fullPath, filename, closingQuote) => {
      if (fullPath.startsWith('./images/') || fullPath.startsWith('../')) {
        return match;
      }
      replacementCount++;
      return `${prefix}./images/${filename}${closingQuote}`;
    }
  );
  
  converted = converted.replace(
    /(!\[[^\]]*\]\()(\/post\/([^/)]+))(\))/g,
    (match, prefix, fullPath, filename, closingParen) => {
      if (fullPath.startsWith('./images/') || fullPath.startsWith('../')) {
        return match;
      }
      replacementCount++;
      return `${prefix}./images/${filename}${closingParen}`;
    }
  );
  
  return { converted, replacementCount };
}

// 메인 함수
function convertAllImagePaths() {
  console.log('\n🖼️  Converting image paths to relative paths...\n');
  
  const markdownFiles = getAllMarkdownFiles(postsDir);
  console.log(`Found ${markdownFiles.length} markdown files\n`);
  
  let totalFilesUpdated = 0;
  let totalReplacements = 0;
  const updatedFiles = [];
  
  for (const filePath of markdownFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { converted, replacementCount } = convertImagePaths(content);
      
      if (replacementCount > 0) {
        fs.writeFileSync(filePath, converted, 'utf8');
        totalFilesUpdated++;
        totalReplacements += replacementCount;
        const relativePath = path.relative(postsDir, filePath);
        updatedFiles.push({ path: relativePath, count: replacementCount });
        console.log(`✅ ${relativePath} (${replacementCount} replacements)`);
      }
    } catch (error) {
      const relativePath = path.relative(postsDir, filePath);
      console.error(`❌ Error processing ${relativePath}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   - Files processed: ${markdownFiles.length}`);
  console.log(`   - Files updated: ${totalFilesUpdated}`);
  console.log(`   - Total replacements: ${totalReplacements}`);
  
  if (updatedFiles.length > 0) {
    console.log(`\n📝 Updated files:`);
    updatedFiles.forEach(({ path, count }) => {
      console.log(`   - ${path}: ${count} replacement(s)`);
    });
  }
  
  console.log('\n✅ Conversion completed!\n');
}

// 스크립트 실행
convertAllImagePaths();

