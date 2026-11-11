import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
}

const CALLOUT_REGEX = /^\[!(\w+)\]([-+])?\s*/;

const CALLOUT_ICONS: Record<string, string> = {
  note: '📝',
  abstract: '📄',
  summary: '📄',
  tldr: '📄',
  info: 'ℹ️',
  todo: '🔲',
  tip: '💡',
  hint: '💡',
  important: '❗',
  success: '✅',
  check: '✅',
  done: '✅',
  question: '❓',
  help: '❓',
  faq: '❓',
  warning: '⚠️',
  caution: '⚠️',
  attention: '⚠️',
  failure: '❌',
  fail: '❌',
  missing: '❌',
  danger: '🔴',
  error: '🔴',
  bug: '🐛',
  example: '📋',
  quote: '💬',
  cite: '💬',
};

function getCalloutIcon(type: string): string {
  return CALLOUT_ICONS[type.toLowerCase()] || '💡';
}

export const rehypeObsidianCallout: Plugin = () => {
  return (tree) => {
    visit(tree, 'element', (node: HastNode, index: number | undefined, parent: HastNode | undefined) => {
      if (node.tagName !== 'blockquote' || !node.children || !parent || index === undefined) return;

      const firstPIndex = node.children.findIndex(
        (child) => child.type === 'element' && child.tagName === 'p'
      );
      if (firstPIndex === -1) return;

      const firstP = node.children[firstPIndex];
      if (!firstP.children || firstP.children.length === 0) return;

      const firstText = firstP.children[0];
      if (firstText.type !== 'text' || !firstText.value) return;

      const match = firstText.value.match(CALLOUT_REGEX);
      if (!match) return;

      const calloutType = match[1].toLowerCase();
      const foldIndicator = match[2];
      const icon = getCalloutIcon(calloutType);
      const isCollapsible = foldIndicator === '-' || foldIndicator === '+';
      const startOpen = foldIndicator === '+';

      firstText.value = firstText.value.slice(match[0].length);

      const brIndex = firstP.children.findIndex(
        (child) => child.type === 'element' && child.tagName === 'br'
      );

      let titleChildren: HastNode[];
      let inlineBodyChildren: HastNode[];

      if (brIndex === -1) {
        titleChildren = [...firstP.children];
        inlineBodyChildren = [];
      } else {
        titleChildren = firstP.children.slice(0, brIndex);
        inlineBodyChildren = firstP.children.slice(brIndex + 1);
      }

      titleChildren = titleChildren.filter(
        (child) => !(child.type === 'text' && !child.value?.trim())
      );

      if (titleChildren.length === 0) {
        titleChildren = [
          { type: 'text', value: calloutType.charAt(0).toUpperCase() + calloutType.slice(1) },
        ];
      }

      const summaryChildren: HastNode[] = [
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['callout-icon'] },
          children: [{ type: 'text', value: icon }],
        },
        { type: 'text', value: ' ' },
        ...titleChildren,
      ];

      const bodyChildren: HastNode[] = [];

      if (inlineBodyChildren.length > 0) {
        bodyChildren.push({
          type: 'element',
          tagName: 'p',
          properties: {},
          children: inlineBodyChildren,
        });
      }

      for (let i = firstPIndex + 1; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === 'text' && !child.value?.trim()) continue;
        bodyChildren.push(child);
      }

      const titleNode: HastNode = isCollapsible
        ? {
            type: 'element',
            tagName: 'summary',
            properties: { className: ['callout-title'] },
            children: summaryChildren,
          }
        : {
            type: 'element',
            tagName: 'div',
            properties: { className: ['callout-title'] },
            children: summaryChildren,
          };

      const contentChildren: HastNode[] = [titleNode];

      if (bodyChildren.length > 0) {
        contentChildren.push({
          type: 'element',
          tagName: 'div',
          properties: { className: ['callout-content'] },
          children: bodyChildren,
        });
      }

      const newNode: HastNode = isCollapsible
        ? {
            type: 'element',
            tagName: 'details',
            properties: {
              className: ['obsidian-callout', `callout-${calloutType}`],
              ...(startOpen ? { open: true } : {}),
            },
            children: contentChildren,
          }
        : {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['obsidian-callout', `callout-${calloutType}`, 'callout-static'],
            },
            children: contentChildren,
          };

      parent.children![index] = newNode;
      return index;
    });
  };
};
