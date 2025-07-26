import { remark } from 'remark';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { remarkAudio } from './remark-audio';
import { rehypeAudio } from './rehype-audio';

export async function parseMarkdown(content: string): Promise<string> {
  const result = await remark()
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkAudio)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex, {
      strict: false,
      throwOnError: false,
      errorColor: '#cc0000'
    })
    .use(rehypeAudio)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return result.toString();
} 