import { remark } from 'remark';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { remarkAudio } from './remark-audio';

export async function parseMarkdown(content: string): Promise<string> {
  // content가 유효한지 확인
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // 마크다운 파싱 전에 강조 마커 뒤에 바로 오는 문자 패턴 수정
  // **text**letter → **text** letter
  // 단, 괄호나 구두점은 제외 (예: **text**(text) 또는 **text**. 는 그대로 유지)
  let processedContent = content;
  
  // Bold markers (**) followed immediately by non-whitespace characters
  // 괄호, 구두점, 특수문자는 제외하여 볼드 처리가 깨지지 않도록 함
  processedContent = processedContent.replace(/(\*\*[^*\n]+?\*\*)([^\s*()[\].,;:!?\-])/g, '$1 $2');
  
  // Italic markers (*) followed immediately by non-whitespace characters
  // Negative lookbehind/lookahead to avoid matching **
  // 괄호, 구두점, 특수문자는 제외
  processedContent = processedContent.replace(/(?<!\*)(\*[^*\n]+?\*)(?!\*)([^\s*()[\].,;:!?\-])/g, '$1 $2');
  
  const result = await remark()
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkAudio)  // remark-rehype 전에 실행
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex, {
      strict: false,
      throwOnError: false,
      errorColor: '#cc0000'
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(processedContent);

  return result.toString();
} 