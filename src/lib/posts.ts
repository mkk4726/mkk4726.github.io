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
    };
  } else {
    // Handle markdown files
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      id,
      content: matterResult.content,
      ...(matterResult.data as { title: string; date: string; excerpt?: string; category?: string; tags?: string[] }),
    };
  }
} 