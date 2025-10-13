import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

interface UnistNode {
  type: string;
  value?: string;
  children?: UnistNode[];
  [key: string]: unknown;
}

/**
 * Remark plugin to fix emphasis markers followed immediately by letters
 * Converts patterns like **text**Letter to **text** Letter
 * This ensures proper bold/italic rendering in markdown
 */
export const remarkEmphasisFix: Plugin = () => {
  return (tree) => {
    visit(tree, 'text', (node: UnistNode) => {
      if (typeof node.value === 'string') {
        let value = node.value;
        
        // Fix bold markers (** or __) followed by letters
        // Matches: **text**Letter or __text__Letter
        value = value.replace(/(\*\*[^*]+\*\*)([A-Za-z가-힣])/g, '$1 $2');
        value = value.replace(/(__[^_]+__)([A-Za-z가-힣])/g, '$1 $2');
        
        // Fix italic markers (* or _) followed by letters
        // Matches: *text*Letter or _text_Letter
        // Use negative lookbehind/lookahead to avoid matching ** or __
        value = value.replace(/(?<!\*)(\*[^*]+\*)(?!\*)([A-Za-z가-힣])/g, '$1 $2');
        value = value.replace(/(?<!_)(_[^_]+_)(?!_)([A-Za-z가-힣])/g, '$1 $2');
        
        node.value = value;
      }
    });
  };
};

