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

// 이력서는 "YY.MM - ..." 파일명으로 작성 시기별로 쌓이므로, 파일명이 가장 최근인 것을 보여준다.
export function getResumeData(): ContentData {
  const resumeDirectory = path.join(process.cwd(), 'posts', 'Career', '이력서');

  try {
    const latest = fs
      .readdirSync(resumeDirectory)
      .filter((name) => /^\d{2}\.\d{2} - .*\.md$/.test(name))
      .sort()
      .pop();
    if (!latest) throw new Error('No resume file found');

    const fileContents = fs.readFileSync(path.join(resumeDirectory, latest), 'utf8');
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
    console.error('Error reading resume file in posts/Career/이력서/', error);
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