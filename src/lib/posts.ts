import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import breaks from 'remark-breaks';
import gfm from 'remark-gfm';

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

// 재귀적으로 모든 .md 파일을 찾는 함수
function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

export function getSortedPostsData(): Omit<PostData, 'content'>[] {
  // Get all markdown files recursively
  const markdownFiles = getAllMarkdownFiles(postsDirectory);
  const allPostsData = markdownFiles.map((filePath) => {
    // Get relative path from posts directory and remove ".md" to get id
    const relativePath = path.relative(postsDirectory, filePath);
    const id = relativePath.replace(/\.md$/, '');

    // Read markdown file as string
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...(matterResult.data as { title: string; date: string; excerpt?: string; category?: string; tags?: string[] }),
    };
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostsByCategory(category: string): Omit<PostData, 'content'>[] {
  const allPosts = getSortedPostsData();
  return allPosts.filter(post => post.category === category);
}

export function getAllCategories(): string[] {
  const allPosts = getSortedPostsData();
  const categories = allPosts
    .map(post => post.category)
    .filter((category): category is string => category !== undefined);
  
  // Remove duplicates and sort
  return [...new Set(categories)].sort();
}

export function getAllPostIds() {
  const markdownFiles = getAllMarkdownFiles(postsDirectory);
  return markdownFiles.map((filePath) => {
    const relativePath = path.relative(postsDirectory, filePath);
    return {
      id: relativePath.replace(/\.md$/, ''),
    };
  });
}

export async function getPostData(id: string): Promise<PostData> {
  // Check if the file exists directly in posts directory first
  let fullPath = path.join(postsDirectory, `${id}.md`);
  
  // If not found, search in subdirectories
  if (!fs.existsSync(fullPath)) {
    const markdownFiles = getAllMarkdownFiles(postsDirectory);
    const targetFile = markdownFiles.find(filePath => {
      const relativePath = path.relative(postsDirectory, filePath);
      return relativePath.replace(/\.md$/, '') === id;
    });
    
    if (!targetFile) {
      throw new Error(`Post with id "${id}" not found`);
    }
    
    fullPath = targetFile;
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(breaks)
    .use(gfm)
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id,
    content: contentHtml,
    ...(matterResult.data as { title: string; date: string; excerpt?: string; category?: string; tags?: string[] }),
  };
} 