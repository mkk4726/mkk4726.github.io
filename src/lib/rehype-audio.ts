import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

interface AudioNode {
  type: 'audio';
  src: string;
  title?: string;
}

interface UnistNode {
  type: string;
  [key: string]: unknown;
}

export const rehypeAudio: Plugin = () => {
  return (tree) => {
    visit(tree, 'audio', (node: UnistNode) => {
      const audioNode = node as unknown as AudioNode;
      const { src, title } = audioNode;
      
      // Create a div wrapper for the audio player
      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: 'audio-player-wrapper',
          'data-audio-src': src,
          'data-audio-title': title || ''
        },
        children: []
      };
      
      // Replace the audio node with the wrapper
      Object.assign(node, wrapper);
    });
  };
}; 