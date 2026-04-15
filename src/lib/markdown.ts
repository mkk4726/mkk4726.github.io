import { remark } from 'remark';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { remarkAudio } from './remark-audio';

function toPostPath(rawTarget: string): string {
  const cleaned = rawTarget.trim().replace(/\\/g, '/').replace(/\.md$/i, '');
  const [pathPart, hashPart] = cleaned.split('#');
  const normalizedPath = pathPart
    .split('/')
    .map((segment) => encodeURIComponent(segment.trim()))
    .filter((segment) => segment.length > 0)
    .join('/');
  const hash = hashPart ? `#${encodeURIComponent(hashPart.trim())}` : '';
  return `/posts/${normalizedPath}${hash}`;
}

function convertObsidianSyntax(content: string): string {
  let converted = content;

  // Obsidian-style inline quote chaining:
  // "> first sentence > second sentence" -> two markdown blockquote lines.
  converted = converted
    .split('\n')
    .map((line) => {
      const match = line.match(/^([ \t]{0,3}> ?)(.*)$/);
      if (!match) return line;

      const [, quotePrefix, quoteBody] = match;
      const chainedQuotes = quoteBody
        .split(/\s+>\s+/)
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);

      if (chainedQuotes.length <= 1) return line;
      return chainedQuotes.map((segment) => `${quotePrefix}${segment}`).join('\n');
    })
    .join('\n');

  // [[note]] or [[note|alias]] -> markdown links for internal post routing.
  converted = converted.replace(/\[\[([^[\]\n]+)\]\]/g, (fullMatch, innerContent: string) => {
    const [targetRaw, aliasRaw] = innerContent.split('|');
    const target = targetRaw?.trim() || '';
    if (!target) return fullMatch;

    const alias = (aliasRaw || target).trim();
    return `[${alias}](${toPostPath(target)})`;
  });

  // ==text== -> mark tag for visual parity with Obsidian highlights.
  converted = converted.replace(/==([^=\n][^=\n]*?)==/g, '<mark>$1</mark>');

  return converted;
}

export async function parseMarkdown(content: string): Promise<string> {
  // content가 유효한지 확인
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // 마크다운 파싱 전에 강조 마커 뒤에 바로 오는 문자 패턴 수정
  // **text**letter → **text** letter
  // 단, 괄호나 구두점은 제외 (예: **text**(text) 또는 **text**. 는 그대로 유지)
  let processedContent = convertObsidianSyntax(content);
  
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