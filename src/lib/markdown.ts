import { remark } from 'remark';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { remarkAudio } from './remark-audio';

export async function parseMarkdown(content: string): Promise<string> {
  // 마크다운 파싱 전에 강조 마커 뒤에 바로 오는 문자 패턴 수정
  // **text**letter → **text** letter
  let processedContent = content;
  
  // Bold markers (** or __) followed immediately by non-whitespace characters
  processedContent = processedContent.replace(/(\*\*[^*\n]+?\*\*)([^\s*])/g, '$1 $2');
  processedContent = processedContent.replace(/(__[^_\n]+?__)([^\s_])/g, '$1 $2');
  
  // Italic markers (* or _) followed immediately by non-whitespace characters
  // Negative lookbehind/lookahead to avoid matching ** or __
  processedContent = processedContent.replace(/(?<!\*)(\*[^*\n]+?\*)(?!\*)([^\s*])/g, '$1 $2');
  processedContent = processedContent.replace(/(?<!_)(_[^_\n]+?_)(?!_)([^\s_])/g, '$1 $2');
  
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