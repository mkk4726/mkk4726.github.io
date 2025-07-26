import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

interface UnistNode {
  type: string;
  children?: UnistNode[];
  properties?: Record<string, unknown>;
  tagName?: string;
  value?: string;
  [key: string]: unknown;
}

interface LinkNode extends UnistNode {
  url: string;
  children: Array<{
    type: string;
    value: string;
  }>;
}

export const remarkAudio: Plugin = () => {
  return (tree) => {
    console.log('=== remarkAudio plugin running ===');
    
    visit(tree, 'paragraph', (node: UnistNode) => {
      const children = node.children as UnistNode[];
      if (children && children.length >= 2) {
        // Check if the paragraph starts with @audio and contains a link
        const firstChild = children[0];
        const secondChild = children[1];
        
        if (firstChild.type === 'text' && 
            firstChild.value === '@audio' && 
            secondChild.type === 'link') {
          
          console.log('Found @audio + link pattern:', children);
          
          const linkNode = secondChild as LinkNode;
          const title = linkNode.children?.[0]?.value || '';
          const src = linkNode.url || '';
          
          console.log('Extracted title:', title, 'src:', src);
          
          // Create HTML text node directly
          const htmlString = `<div class="audio-player-wrapper" data-audio-src="${src}" data-audio-title="${title}"></div>`;
          
          const htmlNode: UnistNode = {
            type: 'html',
            value: htmlString
          };
          
          // Replace the paragraph node with the HTML node
          Object.assign(node, htmlNode);
          console.log('✅ Paragraph replaced with HTML node:', node);
          console.log('HTML string:', htmlString);
        }
      }
    });
    
    console.log('=== remarkAudio plugin finished ===');
  };
}; 