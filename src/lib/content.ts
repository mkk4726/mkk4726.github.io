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
  const resumePath = path.join(process.cwd(), 'posts', 'Career', 'Resumes', '이력서.md');

  try {
    const fileContents = fs.readFileSync(resumePath, 'utf8');
    const { data, content } = matter(fileContents);

    const rawDate = data.lastUpdated || data.date || '';
    const lastUpdated =
      rawDate instanceof Date ? rawDate.toISOString().split('T')[0] : String(rawDate);

    return {
      title: data.title || 'Resume',
      lastUpdated,
      content: content,
    };
  } catch (error) {
    console.error('Error reading resume file at posts/Career/Resumes/이력서.md', error);
    // Fallback to legacy content location
    return getContentData('resume');
  }
}

export function getPortfolioData(): ContentData {
  return getContentData('portfolio');
}

export function getAboutData(): ContentData {
  return getContentData('about');
} 