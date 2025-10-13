import { remark } from 'remark';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { remarkAudio } from './remark-audio';
import { remarkEmphasisFix } from './remark-emphasis-fix';

export async function parseMarkdown(content: string): Promise<string> {
  const result = await remark()
    .use(remarkEmphasisFix)  // 강조 마커 뒤 문자 패턴 수정
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
    .process(content);

  return result.toString();
} 