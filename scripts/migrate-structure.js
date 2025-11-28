const fs = require('fs');
const path = require('path');

/**
 * 블로그 구조 리팩토링 마이그레이션 스크립트 (개선 버전)
 * 
 * 작업 내용:
 * 1. src/content/posts/ → posts/ 로 이동
 * 2. public/post/ 이미지들을 posts/[category]/images/ 로 재배치
 * 3. 마크다운 파일의 이미지 경로를 상대 경로로 변경
 * 
 * 전략: 마크다운 파일을 스캔하여 실제로 참조하는 이미지만 이동
 */

const rootDir = process.cwd();
const oldPostsDir = path.join(rootDir, 'src/content/posts');
const newPostsDir = path.join(rootDir, 'posts');
const oldImagesDir = path.join(rootDir, 'public/post');

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

// 디렉토리 복사 함수 (재귀적)
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 이미지 경로 추출 정규식
const IMAGE_PATTERNS = [
  /!\[([^\]]*)\]\((\/post\/[^)]+)\)/g,  // Markdown: ![alt](/post/path)
  /<img[^>]+src="(\/post\/[^"]+)"/g,   // HTML: <img src="/post/path"
  /@audio\[([^\]]*)\]\((\/post\/[^)]+)\)/g,  // Audio: @audio[title](/post/path)
];

// Step 1: posts 폴더를 루트로 복사
function movePosts() {
  console.log('\n📁 Step 1: Moving posts folder to root...');
  
  if (fs.existsSync(newPostsDir)) {
    console.log('⚠️  posts/ folder already exists. Skipping...');
    return;
  }
  
  if (!fs.existsSync(oldPostsDir)) {
    console.error('❌ src/content/posts/ not found!');
    process.exit(1);
  }
  
  copyDirectory(oldPostsDir, newPostsDir);
  console.log('✅ Posts copied to root: posts/');
}

// Step 2: 마크다운 파일 분석 및 이미지 이동
function analyzeAndMigrateImages() {
  console.log('\n🖼️  Step 2: Analyzing markdown files and migrating images...');
  
  const markdownFiles = getAllMarkdownFiles(newPostsDir);
  console.log(`Found ${markdownFiles.length} markdown files`);
  
  const imageMovements = new Map(); // imagePath -> targetPath
  let totalImages = 0;
  
  // 각 마크다운 파일 분석
  for (const mdPath of markdownFiles) {
    const content = fs.readFileSync(mdPath, 'utf8');
    const mdDir = path.dirname(mdPath);
    
    // 모든 이미지 패턴 찾기
    for (const pattern of IMAGE_PATTERNS) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const imagePath = match[match.length - 1]; // 마지막 캡처 그룹이 경로
        
        if (!imagePath.startsWith('/post/')) continue;
        
        totalImages++;
        
        // /post/ 이후의 경로
        const relPath = imagePath.substring('/post/'.length);
        const sourceImagePath = path.join(rootDir, 'public', 'post', relPath);
        
        // 이미지가 실제로 존재하는지 확인
        if (!fs.existsSync(sourceImagePath)) {
          console.warn(`⚠️  Image not found: ${sourceImagePath}`);
          continue;
        }
        
        // 대상 경로: 마크다운 파일과 같은 디렉토리의 images/ 폴더
        const imageFileName = path.basename(relPath);
        const targetDir = path.join(mdDir, 'images');
        const targetPath = path.join(targetDir, imageFileName);
        
        imageMovements.set(sourceImagePath, targetPath);
      }
    }
  }
  
  console.log(`Found ${totalImages} image references in markdown files`);
  console.log(`${imageMovements.size} unique images to move`);
  
  // 이미지 이동
  let movedCount = 0;
  for (const [sourcePath, targetPath] of imageMovements.entries()) {
    const targetDir = path.dirname(targetPath);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
      movedCount++;
    }
  }
  
  console.log(`✅ Moved ${movedCount} images`);
}

// Step 3: 마크다운 파일의 이미지 경로 업데이트
function updateMarkdownPaths() {
  console.log('\n📝 Step 3: Updating markdown image paths to relative paths...');
  
  const markdownFiles = getAllMarkdownFiles(newPostsDir);
  let updatedCount = 0;
  let totalReplacements = 0;
  
  for (const mdPath of markdownFiles) {
    let content = fs.readFileSync(mdPath, 'utf8');
    const originalContent = content;
    
    // Markdown 이미지: ![alt](/post/path/to/image.png) → ![alt](./images/image.png)
    content = content.replace(/!\[([^\]]*)\]\(\/post\/[^)]+\/([^/)]+)\)/g, (match, alt, filename) => {
      totalReplacements++;
      return `![${alt}](./images/${filename})`;
    });
    
    // HTML img 태그: <img src="/post/path/to/image.png" → <img src="./images/image.png"
    content = content.replace(/<img([^>]+)src="\/post\/[^"]+"( \/)*>/g, (match, before, selfClose) => {
      const srcMatch = match.match(/src="\/post\/[^"]+\/([^/"]+)"/);
      if (srcMatch) {
        const filename = srcMatch[1];
        totalReplacements++;
        return `<img${before}src="./images/${filename}"${selfClose || ''}>`;
      }
      return match;
    });
    
    // Audio 태그: @audio[title](/post/path/to/audio.wav) → @audio[title](./images/audio.wav)
    content = content.replace(/@audio\[([^\]]*)\]\(\/post\/[^)]+\/([^/)]+)\)/g, (match, title, filename) => {
      totalReplacements++;
      return `@audio[${title}](./images/${filename})`;
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(mdPath, content, 'utf8');
      updatedCount++;
    }
  }
  
  console.log(`✅ Updated ${updatedCount} markdown files (${totalReplacements} path replacements)`);
}

// Step 4: 코드 파일 업데이트
function updateCodeFiles() {
  console.log('\n💻 Step 4: Updating code files...');
  
  const filesToUpdate = [
    'src/lib/posts.ts',
    'scripts/generate-search-index.js',
    'scripts/copy-pdfs.js',
  ];
  
  for (const file of filesToUpdate) {
    const filePath = path.join(rootDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // src/content/posts → posts 경로 변경
    content = content.replace(/src\/content\/posts/g, 'posts');
    content = content.replace(/src\\content\\posts/g, 'posts');
    
    if (content !== originalContent) {
      // 백업 생성
      fs.writeFileSync(filePath + '.backup', originalContent, 'utf8');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${file} (backup created)`);
    } else {
      console.log(`ℹ️  No changes needed: ${file}`);
    }
  }
}

// 메인 실행
function main() {
  console.log('🚀 Starting blog structure migration...\n');
  console.log('This script will:');
  console.log('  1. Copy src/content/posts/ → posts/');
  console.log('  2. Analyze markdown files to find image references');
  console.log('  3. Copy referenced images to posts/[category]/images/');
  console.log('  4. Update markdown image paths to relative paths');
  console.log('  5. Update code files (lib/posts.ts, scripts, etc.)\n');
  
  console.log('⚠️  Press Ctrl+C within 2 seconds to cancel...');
  
  setTimeout(() => {
    try {
      movePosts();
      analyzeAndMigrateImages();
      updateMarkdownPaths();
      updateCodeFiles();
      
      console.log('\n✨ Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('  1. Test with: npm run dev');
      console.log('  2. Check that all posts and images load correctly');
      console.log('  3. Test search functionality: npm run generate-search');
      console.log('  4. If everything works:');
      console.log('     - Remove src/content/posts/');
      console.log('     - Remove public/post/');
      console.log('     - Delete *.backup files');
      console.log('  5. If something breaks:');
      console.log('     - Restore from *.backup files');
      console.log('     - Remove posts/ folder');
      console.log('     - Report the issue');
    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      console.error(error.stack);
      process.exit(1);
    }
  }, 2000);
}

main();
