const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'posts');
const outputPath = path.join(process.cwd(), 'public/search-index.json');

// 재귀적으로 모든 .md 및 .ipynb 파일을 찾는 함수
function getAllPostFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllPostFiles(fullPath));
    } else if (item.endsWith('.md') || item.endsWith('.ipynb')) {
      // README 파일은 일반 포스트로 처리하지 않음
      if (item.toLowerCase() === 'readme.md') {
        continue;
      }
      files.push(fullPath);
    }
  }
  
  return files;
}

// Jupyter notebook 메타데이터 추출 (간단 버전)
function extractNotebookMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const notebook = JSON.parse(content);
    
    // 첫 번째 마크다운 셀에서 메타데이터 찾기
    const firstMarkdownCell = notebook.cells?.find(cell => cell.cell_type === 'markdown');
    if (firstMarkdownCell && firstMarkdownCell.source) {
      const source = Array.isArray(firstMarkdownCell.source) 
        ? firstMarkdownCell.source.join('') 
        : firstMarkdownCell.source;
      
      // YAML front matter 파싱 시도
      if (source.startsWith('---')) {
        try {
          const matterResult = matter(source);
          return matterResult.data;
        } catch (e) {
          console.warn('Failed to parse notebook metadata:', e.message);
        }
      }
    }
    
    return {};
  } catch (e) {
    console.warn('Failed to read notebook:', e.message);
    return {};
  }
}

// 노트북 내용 추출
function extractNotebookContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const notebook = JSON.parse(content);
    
    let textContent = '';
    notebook.cells?.forEach(cell => {
      if (cell.cell_type === 'markdown' || cell.cell_type === 'code') {
        const source = Array.isArray(cell.source) 
          ? cell.source.join('') 
          : cell.source;
        textContent += source + ' ';
      }
    });
    
    return textContent.trim();
  } catch (e) {
    console.warn('Failed to extract notebook content:', e.message);
    return '';
  }
}

// 마크다운 태그를 제거하는 함수
function cleanMarkdown(text) {
  if (!text) return '';
  
  // 마크다운 헤더 제거
  text = text.replace(/^#{1,6}\s+/gm, '');
  
  // 마크다운 링크 제거 (텍스트만 유지)
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // 마크다운 강조 제거
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');
  
  // 마크다운 리스트 제거
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');
  
  // 마크다운 테이블 제거 (테이블 내용은 유지)
  text = text.replace(/\|/g, ' ');
  
  // 여러 공백을 하나로
  text = text.replace(/\s+/g, ' ');
  
  return text.trim();
}

async function generateSearchIndex() {
  const postFiles = getAllPostFiles(postsDirectory);
  const searchIndex = [];

  for (const filePath of postFiles) {
    try {
      const relativePath = path.relative(postsDirectory, filePath);
      const id = relativePath.replace(/\.(md|ipynb)$/, '');

      let metadata = {};
      let content = '';

      if (filePath.endsWith('.ipynb')) {
        // Jupyter notebook 처리
        metadata = extractNotebookMetadata(filePath);
        content = extractNotebookContent(filePath);
      } else {
        // 마크다운 파일 처리
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const matterResult = matter(fileContents);
        metadata = matterResult.data;
        content = matterResult.content;
      }

      // 마크다운 태그 제거
      const cleanContent = cleanMarkdown(content);

      // 검색 인덱스에 추가
      searchIndex.push({
        id,
        title: metadata.title || id,
        date: metadata.date || new Date().toISOString().split('T')[0],
        excerpt: metadata.excerpt || '',
        category: metadata.category || '',
        tags: metadata.tags || [],
        content: cleanContent, // 전체 내용 저장 (마크다운 태그 제거됨)
        public: metadata.public !== false, // public 필드 추가
      });
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  // 날짜순 정렬
  searchIndex.sort((a, b) => {
    if (a.date < b.date) return 1;
    return -1;
  });

  // JSON 파일로 저장
  fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2));
  console.log(`✅ Search index generated: ${searchIndex.length} posts`);
  console.log(`📁 Saved to: ${outputPath}`);
}

generateSearchIndex().catch(console.error); 