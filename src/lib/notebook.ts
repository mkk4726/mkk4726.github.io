import fs from 'fs';
import path from 'path';

export interface NotebookData {
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
}

interface NotebookCell {
  cell_type: string;
  source?: string | string[];
  outputs?: NotebookOutput[];
}

interface NotebookOutput {
  output_type: string;
  text?: string[];
  data?: Record<string, string | string[]>;
  traceback?: string[];
}

/**
 * 주피터 노트북 파일을 HTML로 변환합니다
 */
export async function convertNotebookToHtml(notebookPath: string): Promise<string> {
  try {
    // 노트북 파일 읽기
    const notebookContent = fs.readFileSync(notebookPath, 'utf8');
    const notebook = JSON.parse(notebookContent);
    
    let html = '<div class="jupyter-notebook">\n';
    
    let cellIndex = 1; // 실제 실행된 셀만 카운트
    for (let i = 0; i < notebook.cells.length; i++) {
      const cell = notebook.cells[i];
      if (cell.cell_type === 'code') {
        html += convertCellToHtml(cell, cellIndex, 'code');
        cellIndex++;
      } else if (cell.cell_type === 'markdown' || cell.cell_type === 'raw') {
        html += convertCellToHtml(cell, i, 'markdown');
      }
    }
    
    html += '</div>';
    return html;
  } catch (error) {
    console.error('Error converting notebook to HTML:', error);
    throw new Error(`Failed to convert notebook: ${error}`);
  }
}

/**
 * 개별 셀을 HTML로 변환합니다
 */
function convertCellToHtml(cell: NotebookCell, index: number, cellType?: string): string {
  const source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');
  
  if (cell.cell_type === 'markdown' || cell.cell_type === 'raw') {
    // 첫 번째 셀에서 YAML 메타데이터 제거
    let content = source;
    if (index === 0) {
      content = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '');
    }
    
    // 빈 내용이면 스킵
    if (!content.trim()) {
      return '';
    }
    
    // 마크다운 셀
    const markdownHtml = convertMarkdownToHtml(content);
    return `<div class="jupyter-cell jupyter-markdown-cell">\n${markdownHtml}\n</div>\n\n`;
  } else if (cell.cell_type === 'code') {
    // 빈 코드 셀은 스킵
    if (!source.trim()) {
      return '';
    }
    
    // 코드 셀
    let html = '<div class="jupyter-cell jupyter-code-cell">\n';
    
    // Input 영역
    html += `  <div class="jupyter-input">\n`;
    html += `    <div class="jupyter-input-prompt"></div>\n`;
    html += `    <div class="jupyter-input-area">\n`;
    html += `      <pre><code class="language-python">${escapeHtml(source)}</code></pre>\n`;
    html += `    </div>\n`;
    html += `  </div>\n`;
    
    // Output 영역 (있는 경우)
    if (cell.outputs && cell.outputs.length > 0) {
      html += `  <div class="jupyter-output">\n`;
      html += `    <div class="jupyter-output-prompt"></div>\n`;
      html += `    <div class="jupyter-output-area">\n`;
      
      for (const output of cell.outputs) {
        if (output.output_type === 'stream') {
          const text = output.text?.join('') || '';
          html += `      <div class="jupyter-output-stream">${escapeHtml(text)}</div>\n`;
        } else if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
          if (output.data) {
            if (output.data['text/html']) {
              const htmlData = Array.isArray(output.data['text/html']) 
                ? output.data['text/html'].join('') 
                : output.data['text/html'];
              html += `      <div class="jupyter-output-html">${htmlData}</div>\n`;
            } else if (output.data['text/plain']) {
              const text = Array.isArray(output.data['text/plain']) 
                ? output.data['text/plain'].join('') 
                : output.data['text/plain'];
              html += `      <div class="jupyter-output-text">${escapeHtml(text)}</div>\n`;
            } else if (output.data['image/png']) {
              const imageData = Array.isArray(output.data['image/png']) 
                ? output.data['image/png'].join('') 
                : output.data['image/png'];
              html += `      <img src="data:image/png;base64,${imageData}" alt="Output image" />\n`;
            }
          }
        } else if (output.output_type === 'error') {
          const errorText = output.traceback?.join('\n') || '';
          html += `      <div class="jupyter-output-error">${escapeHtml(errorText)}</div>\n`;
        }
      }
      
      html += `    </div>\n`;
      html += `  </div>\n`;
    }
    
    html += `</div>\n\n`;
    return html;
  }
  
  return '';
}

/**
 * 간단한 마크다운을 HTML로 변환합니다
 */
function convertMarkdownToHtml(markdown: string): string {
  return markdown
    // 코드 블록 (먼저 처리)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `<pre class="language-${language}"><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
    })
    // 헤딩
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // 굵은 글씨
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 기울임
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 인라인 코드
    .replace(/`(.*?)`/g, '<code class="language-text">$1</code>')
    // 리스트
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    // 문단
    .replace(/\n\n/g, '</p><p>')
    // 줄바꿈
    .replace(/\n/g, '<br>')
    // 문단 태그 추가
    .replace(/^(.+)/, '<p>$1')
    .replace(/(.+)$/, '$1</p>');
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text: string): string {
  const div = { innerHTML: '', textContent: text };
  return div.innerHTML || text.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m] || m;
  });
}

/**
 * 주피터 노트북에서 메타데이터를 추출합니다
 */
export function extractNotebookMetadata(notebookPath: string): Partial<NotebookData> {
  try {
    const notebookContent = fs.readFileSync(notebookPath, 'utf8');
    const notebook = JSON.parse(notebookContent);
    
    // 노트북 메타데이터에서 정보 추출
    const metadata = notebook.metadata || {};
    const fileName = path.basename(notebookPath, '.ipynb');
    
    // 첫 번째 마크다운 셀에서 메타데이터 추출 시도
    let title = metadata.title || fileName;
    let excerpt = '';
    let category = metadata.category || 'Data Science';
    let tags = metadata.tags || ['jupyter', 'notebook'];
    
    // 첫 번째 텍스트 셀(markdown 또는 raw)에서 메타데이터 추출
    const firstTextCell = notebook.cells?.find((cell: NotebookCell) => 
      (cell.cell_type === 'markdown' || cell.cell_type === 'raw') && cell.source
    );
    
    if (firstTextCell && firstTextCell.source) {
      const source = Array.isArray(firstTextCell.source) 
        ? firstTextCell.source.join('') 
        : firstTextCell.source;
      
      // YAML-style 메타데이터 추출 (셀 시작 부분에 --- 로 둘러싸인)
      const yamlMatch = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
      if (yamlMatch) {
        const yamlContent = yamlMatch[1];
        
        // 간단한 YAML 파싱
        const titleMatch = yamlContent.match(/^title:\s*"?([^"\n]+)"?$/m);
        if (titleMatch) title = titleMatch[1].trim();
        
        const categoryMatch = yamlContent.match(/^category:\s*"?([^"\n]+)"?$/m);
        if (categoryMatch) category = categoryMatch[1].trim();
        
        const tagsMatch = yamlContent.match(/^tags:\s*\[(.*?)\]$/m);
        if (tagsMatch) {
          tags = tagsMatch[1].split(',').map((tag: string) => tag.trim().replace(/['"]/g, ''));
        }
        
        const excerptMatch = yamlContent.match(/^excerpt:\s*"?([^"\n]+)"?$/m);
        if (excerptMatch) excerpt = excerptMatch[1].trim();
        
        // YAML 메타데이터 이후의 내용에서 excerpt 추출
        if (!excerpt) {
          const remainingContent = source.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '');
          const lines = remainingContent.split('\n').filter((line: string) => 
            line.trim() && !line.startsWith('#')
          );
          if (lines.length > 0) {
            excerpt = lines[0].trim().substring(0, 150);
            if (excerpt.length >= 150) {
              excerpt += '...';
            }
          }
        }
      } else {
        // YAML 메타데이터가 없으면 기존 방식 사용
        const titleMatch = source.match(/^#+\s*(.+?)$/m);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
        
        // 첫 번째 문단을 excerpt로 사용
        const lines = source.split('\n').filter((line: string) => 
          line.trim() && !line.startsWith('#')
        );
        if (lines.length > 0) {
          excerpt = lines[0].trim().substring(0, 150);
          if (excerpt.length >= 150) {
            excerpt += '...';
          }
        }
      }
    }
    
    // 파일명에서 날짜 추출 (YYYY-MM-DD 형식)
    const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    
    return {
      title,
      date,
      excerpt,
      category,
      tags
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw new Error(`Failed to extract metadata: ${error}`);
  }
}

/**
 * 주피터 노트북을 마크다운으로 변환합니다 (frontmatter 포함)
 */
export async function convertNotebookToMarkdown(notebookPath: string): Promise<string> {
  try {
    // 메타데이터 추출
    const metadata = extractNotebookMetadata(notebookPath);
    
    // HTML로 변환
    const htmlContent = await convertNotebookToHtml(notebookPath);
    
    // frontmatter 생성
    const frontmatter = [
      '---',
      `title: "${metadata.title || 'Untitled'}"`,
      `date: "${metadata.date || new Date().toISOString().split('T')[0]}"`,
      metadata.excerpt ? `excerpt: "${metadata.excerpt.replace(/"/g, '\\"')}"` : '',
      `category: "${metadata.category || 'Data Science'}"`,
      `tags: [${metadata.tags?.map(tag => `"${tag}"`).join(', ') || '"jupyter", "notebook"'}]`,
      '---',
      ''
    ].filter(line => line !== '').join('\n');
    
    // HTML을 간단한 마크다운으로 변환 (기본적인 변환만)
    const markdownContent = htmlContent
      .replace(/<h([1-6])>/g, (match, level) => '#'.repeat(parseInt(level)) + ' ')
      .replace(/<\/h[1-6]>/g, '\n\n')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<strong>/g, '**')
      .replace(/<\/strong>/g, '**')
      .replace(/<em>/g, '*')
      .replace(/<\/em>/g, '*')
      .replace(/<code>/g, '`')
      .replace(/<\/code>/g, '`')
      .replace(/<pre><code class="language-(\w+)">/g, '```$1\n')
      .replace(/<\/code><\/pre>/g, '\n```\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '') // 나머지 HTML 태그 제거
      .replace(/\n{3,}/g, '\n\n'); // 연속된 빈 줄 정리
    
    return frontmatter + markdownContent;
  } catch (error) {
    console.error('Error converting notebook to markdown:', error);
    throw new Error(`Failed to convert notebook to markdown: ${error}`);
  }
} 