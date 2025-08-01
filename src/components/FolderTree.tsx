'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FolderNode } from '@/lib/posts';

interface FolderTreeProps {
  nodes: FolderNode[];
  selectedPath?: string;
}

interface FolderNodeItemProps {
  node: FolderNode;
  selectedPath?: string;
  level?: number;
}

function FolderNodeItem({ node, selectedPath, level = 0 }: FolderNodeItemProps) {
  const [isExpanded, setIsExpanded] = useState(
    selectedPath ? selectedPath.startsWith(node.path) : false
  );
  const hasChildren = node.children.length > 0;
  const isSelected = selectedPath === node.path;

  const toggleExpanded = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren && (
          <button
            onClick={toggleExpanded}
            className="mr-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {!hasChildren && <div className="w-5 mr-1" />}
        
        <div className="flex items-center justify-between flex-1 min-w-0">
          <Link
            href={`/posts/folder/${node.path}`}
            className="flex-1 truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="text-sm font-medium">{node.name}</span>
          </Link>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
            {node.postCount}
          </span>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <FolderNodeItem
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({ nodes, selectedPath }: FolderTreeProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 lg:p-4">
      <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 lg:mb-4">
        📁 폴더 구조
      </h3>
      
      {/* All Posts 링크 */}
      <div className="mb-2">
        <Link
          href="/posts"
          className={`flex items-center justify-between py-1 px-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            !selectedPath ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <span>📄 모든 포스트</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
            {nodes.reduce((total, node) => total + node.postCount, 0)}
          </span>
        </Link>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
        {nodes.map((node) => (
          <FolderNodeItem
            key={node.path}
            node={node}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    </div>
  );
} 