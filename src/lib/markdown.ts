import { remark } from 'remark';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkHtml from 'remark-html';
import { rehype } from 'rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

export async function parseMarkdown(content: string): Promise<string> {
  const result = await remark()
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkHtml)
    .process(content);

  const html = await rehype()
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(result.toString());

  return html.toString();
} 