import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

interface AudioNode {
  type: 'audio';
  src: string;
  title?: string;
}

interface ParagraphNode {
  type: 'paragraph';
  children: Array<{
    type: string;
    value?: string;
  }>;
}

interface UnistNode {
  type: string;
  [key: string]: unknown;
}

const audioRegex = /^@audio\[([^\]]+)\]\(([^)]+)\)$/;

export const remarkAudio: Plugin = () => {
  return (tree) => {
    visit(tree, 'paragraph', (node: UnistNode) => {
      const paragraphNode = node as unknown as ParagraphNode;
      if (paragraphNode.children && paragraphNode.children.length === 1 && paragraphNode.children[0].type === 'text') {
        const text = paragraphNode.children[0].value as string;
        const match = text.match(audioRegex);
        
        if (match) {
          const [, title, src] = match;
          const audioNode: AudioNode = {
            type: 'audio',
            src: src.trim(),
            title: title.trim()
          };
          
          // Replace the paragraph node with the audio node
          Object.assign(node, audioNode);
        }
      }
    });
  };
}; 