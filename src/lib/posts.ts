import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { convertNotebookToHtml, extractNotebookMetadata } from './notebook';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface PostData {
  id: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  isNotebook?: boolean;
}

// 폴더 구조를 나타내는 인터페이스
export interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
  postCount: number;
}

// 재귀적으로 모든 .md 및 .ipynb 파일을 찾는 함수
function getAllPostFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllPostFiles(fullPath));
    } else if (item.endsWith('.md') || item.endsWith('.ipynb')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

export async function getSortedPostsData(): Promise<Omit<PostData, 'content'>[]> {
  // Get all post files (markdown and notebook) recursively
  const postFiles = getAllPostFiles(postsDirectory);
  const allPostsData = await Promise.all(postFiles.map(async (filePath: string) => {
    // Get relative path from posts directory and remove extension to get id
    const relativePath = path.relative(postsDirectory, filePath);
    const id = relativePath.replace(/\.(md|ipynb)$/, '');

    // Handle different file types
    if (filePath.endsWith('.ipynb')) {
      // For Jupyter notebooks, extract metadata directly
      const metadata = extractNotebookMetadata(filePath);
      return {
        id,
        title: metadata.title || id,
        date: metadata.date || new Date().toISOString().split('T')[0],
        excerpt: metadata.excerpt,
        category: metadata.category,
        tags: metadata.tags,
      };
    } else {
      // For markdown files, use gray-matter
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const matterResult = matter(fileContents);
      
      return {
        id,
        ...(matterResult.data as { title: string; date: string; excerpt?: string; category?: string; tags?: string[] }),
      };
    }
  }));

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostsByCategory(category: string): Promise<Omit<PostData, 'content'>[]> {
  const allPosts = await getSortedPostsData();
  return allPosts.filter((post) => post.category === category);
}

export async function getAllCategories(): Promise<string[]> {
  const allPosts = await getSortedPostsData();
  const categories = allPosts
    .map((post) => post.category)
    .filter((category): category is string => category !== undefined);
  
  // Remove duplicates and sort
  return [...new Set(categories)].sort();
}

export function getAllPostIds() {
  const postFiles = getAllPostFiles(postsDirectory);
  return postFiles.map((filePath: string) => {
    const relativePath = path.relative(postsDirectory, filePath);
    return {
      id: relativePath.replace(/\.(md|ipynb)$/, ''),
    };
  });
}

export async function getPostData(id: string): Promise<PostData> {
  // Decode URL-encoded characters in the id
  const decodedId = decodeURIComponent(id);
  
  // Check if markdown file exists directly in posts directory first
  let fullPath = path.join(postsDirectory, `${decodedId}.md`);
  let isNotebook = false;
  
  // If markdown not found, check for notebook file
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${decodedId}.ipynb`);
    if (fs.existsSync(fullPath)) {
      isNotebook = true;
    }
  }
  
  // If still not found, search in subdirectories
  if (!fs.existsSync(fullPath)) {
    const postFiles = getAllPostFiles(postsDirectory);
    const targetFile = postFiles.find((filePath: string) => {
      const relativePath = path.relative(postsDirectory, filePath);
      return relativePath.replace(/\.(md|ipynb)$/, '') === decodedId;
    });
    
    if (!targetFile) {
      throw new Error(`Post with id "${id}" not found`);
    }
    
    fullPath = targetFile;
    isNotebook = targetFile.endsWith('.ipynb');
  }
  
  // Handle notebook files
  if (isNotebook) {
    const metadata = extractNotebookMetadata(fullPath);
    const htmlContent = await convertNotebookToHtml(fullPath);
    
    return {
      id,
      content: htmlContent,
      title: metadata.title || id,
      date: metadata.date || new Date().toISOString().split('T')[0],
      excerpt: metadata.excerpt,
      category: metadata.category,
      tags: metadata.tags,
      isNotebook: true,
    };
  } else {
    // Handle markdown files
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      id,
      content: matterResult.content,
      ...(matterResult.data as { title: string; date: string; excerpt?: string; category?: string; tags?: string[] }),
      isNotebook: false,
    };
  }
} 

// 폴더 구조를 재귀적으로 빌드하는 함수
function buildFolderStructure(dir: string, basePath: string = ''): FolderNode[] {
  const items = fs.readdirSync(dir);
  const folders: FolderNode[] = [];
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const relativePath = basePath ? `${basePath}/${item}` : item;
      const children = buildFolderStructure(fullPath, relativePath);
      
      // 해당 폴더와 하위 폴더의 포스트 개수 계산
      const postCount = getPostCountInFolder(fullPath);
      
      folders.push({
        name: item,
        path: relativePath,
        children,
        postCount
      });
    }
  }
  
  return folders;
}

// 특정 폴더 내의 포스트 개수를 계산하는 함수
function getPostCountInFolder(dir: string): number {
  const items = fs.readdirSync(dir);
  let count = 0;
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      count += getPostCountInFolder(fullPath);
    } else if (item.endsWith('.md') || item.endsWith('.ipynb')) {
      count++;
    }
  }
  
  return count;
}

// 폴더 구조 트리를 가져오는 함수
export function getFolderStructure(): FolderNode[] {
  return buildFolderStructure(postsDirectory);
}

// 특정 폴더 경로의 포스트들을 가져오는 함수 (하위 폴더 포함)
export async function getPostsByFolderPath(folderPath: string): Promise<Omit<PostData, 'content'>[]> {
  const allPosts = await getSortedPostsData();
  
  // 폴더 경로가 빈 문자열이면 모든 포스트 반환
  if (!folderPath) {
    return allPosts;
  }
  
  // 해당 폴더 경로로 시작하는 포스트들만 필터링
  return allPosts.filter((post) => {
    const postFolder = post.id.includes('/') ? post.id.substring(0, post.id.lastIndexOf('/')) : '';
    return postFolder === folderPath || postFolder.startsWith(folderPath + '/');
  });
}

// 특정 폴더 경로의 포스트들을 가져오는 함수 (하위 폴더 제외)
export async function getPostsByFolderPathExact(folderPath: string): Promise<Omit<PostData, 'content'>[]> {
  const allPosts = await getSortedPostsData();
  
  // 폴더 경로가 빈 문자열이면 루트 폴더의 포스트들만 반환
  if (!folderPath) {
    return allPosts.filter((post) => !post.id.includes('/'));
  }
  
  // 해당 폴더 경로에 정확히 속하는 포스트들만 필터링
  return allPosts.filter((post) => {
    const postFolder = post.id.includes('/') ? post.id.substring(0, post.id.lastIndexOf('/')) : '';
    return postFolder === folderPath;
  });
}

// 모든 폴더 경로를 평면적으로 가져오는 함수
export function getAllFolderPaths(): string[] {
  const structure = getFolderStructure();
  const paths: string[] = [];
  
  function collectPaths(nodes: FolderNode[]) {
    for (const node of nodes) {
      paths.push(node.path);
      if (node.children.length > 0) {
        collectPaths(node.children);
      }
    }
  }
  
  collectPaths(structure);
  return paths;
} 