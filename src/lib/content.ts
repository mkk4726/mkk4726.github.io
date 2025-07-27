import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ContentData {
  title: string;
  lastUpdated?: string;
  content: string;
}

export function getContentData(filename: string): ContentData {
  const contentDirectory = path.join(process.cwd(), 'src/content');
  const fullPath = path.join(contentDirectory, `${filename}.md`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      title: data.title || '',
      lastUpdated: data.lastUpdated || '',
      content: content,
    };
  } catch (error) {
    console.error(`Error reading content file: ${filename}`, error);
    return {
      title: '',
      content: '',
    };
  }
}

export function getResumeData(): ContentData {
  return getContentData('resume');
}

export function getPortfolioData(): ContentData {
  return getContentData('portfolio');
}

export function getAboutData(): ContentData {
  return getContentData('about');
} 