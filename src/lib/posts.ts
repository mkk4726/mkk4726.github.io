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

// 날짜별 포스트 개수를 집계하는 인터페이스
export interface PostsByDate {
  date: string;
  count: number;
}

// 월별 포스트 개수를 집계하는 함수
export async function getPostsByMonth(): Promise<PostsByDate[]> {
  const allPosts = await getSortedPostsData();
  const monthlyData: { [key: string]: number } = {};
  
  for (const post of allPosts) {
    // YYYY-MM 형태로 월별 그룹화
    const month = post.date.substring(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  }
  
  // 배열로 변환하고 날짜순 정렬
  return Object.entries(monthlyData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// 연도별 포스트 개수를 집계하는 함수
export async function getPostsByYear(): Promise<PostsByDate[]> {
  const allPosts = await getSortedPostsData();
  const yearlyData: { [key: string]: number } = {};
  
  for (const post of allPosts) {
    // YYYY 형태로 연도별 그룹화
    const year = post.date.substring(0, 4);
    yearlyData[year] = (yearlyData[year] || 0) + 1;
  }
  
  // 배열로 변환하고 날짜순 정렬
  return Object.entries(yearlyData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// 주별 포스트 개수를 집계하는 함수
export async function getPostsByWeek(): Promise<PostsByDate[]> {
  const allPosts = await getSortedPostsData();
  const weeklyData: { [key: string]: number } = {};
  
  for (const post of allPosts) {
    const postDate = new Date(post.date);
    
    // 해당 주의 월요일을 구하기
    const monday = new Date(postDate);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // 일요일인 경우 조정
    monday.setDate(diff);
    
    // YYYY-MM-DD 형태로 주의 시작일 표시
    const weekStart = monday.toISOString().split('T')[0];
    weeklyData[weekStart] = (weeklyData[weekStart] || 0) + 1;
  }
  
  // 배열로 변환하고 날짜순 정렬
  return Object.entries(weeklyData)
    .map(([date, count]) => ({ 
      date: `${date} 주`, // 더 읽기 쉽게 표시
      count 
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12); // 최근 12주만 표시 (너무 많으면 차트가 복잡해짐)
}

// GitHub 잔디밭을 위한 날짜별 포스트 데이터 인터페이스
export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4 (강도 레벨)
}

// 날짜별 포스트 개수를 집계하는 함수 (GitHub 잔디밭용)
export async function getPostsContributionData(): Promise<ContributionDay[]> {
  const allPosts = await getSortedPostsData();
  const dailyData: { [key: string]: number } = {};
  
  // 모든 포스트의 날짜별 개수 계산
  for (const post of allPosts) {
    const date = post.date;
    dailyData[date] = (dailyData[date] || 0) + 1;
  }
  
  // 최대값 계산 (레벨 계산용) - 데이터가 없으면 0
  const counts = Object.values(dailyData);
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
  
  // 지난 1년간의 모든 날짜 생성
  const result: ContributionDay[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const count = dailyData[dateStr] || 0;
    
    // GitHub 스타일 레벨 계산 (0-4)
    let level = 0;
    if (count > 0 && maxCount > 0) {
      if (maxCount <= 1) {
        level = count > 0 ? 4 : 0;
      } else {
        level = Math.min(Math.ceil((count / maxCount) * 4), 4);
      }
    }
    
    result.push({
      date: dateStr,
      count,
      level
    });
  }
  
  return result;
}

// 특정 연도의 contribution 데이터를 가져오는 함수
export async function getPostsContributionDataByYear(year: number): Promise<ContributionDay[]> {
  const allPosts = await getSortedPostsData();
  const dailyData: { [key: string]: number } = {};
  
  // 해당 연도의 포스트만 필터링하여 날짜별 개수 계산
  for (const post of allPosts) {
    const postYear = parseInt(post.date.substring(0, 4));
    if (postYear === year) {
      const date = post.date;
      dailyData[date] = (dailyData[date] || 0) + 1;
    }
  }
  
  // 최대값 계산 (레벨 계산용) - 데이터가 없으면 0
  const counts = Object.values(dailyData);
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
  
  // 해당 연도의 모든 날짜 생성
  const result: ContributionDay[] = [];
  const startDate = new Date(year, 0, 1); // 1월 1일
  const endDate = new Date(year, 11, 31); // 12월 31일
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const count = dailyData[dateStr] || 0;
    
    // GitHub 스타일 레벨 계산 (0-4)
    let level = 0;
    if (count > 0 && maxCount > 0) {
      if (maxCount <= 1) {
        level = count > 0 ? 4 : 0;
      } else {
        level = Math.min(Math.ceil((count / maxCount) * 4), 4);
      }
    }
    
    result.push({
      date: dateStr,
      count,
      level
    });
  }
  
  return result;
}

// 포스트가 있는 연도 목록을 가져오는 함수
export async function getActiveYears(): Promise<number[]> {
  const allPosts = await getSortedPostsData();
  const years = new Set<number>();
  
  for (const post of allPosts) {
    try {
      const year = parseInt(post.date.substring(0, 4));
      if (!isNaN(year)) {
        years.add(year);
      }
    } catch (error) {
      console.warn('Invalid date format:', post.date);
    }
  }
  
  // 연도를 내림차순으로 정렬 (최신 연도부터)
  return Array.from(years).sort((a, b) => b - a);
}

// 요일별 포스트 개수를 집계하는 함수
export async function getPostsByDayOfWeek(): Promise<PostsByDate[]> {
  const allPosts = await getSortedPostsData();
  const dayOfWeekData: { [key: string]: number } = {};
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  
  // 요일별 초기화
  dayNames.forEach(day => {
    dayOfWeekData[day] = 0;
  });
  
  // 모든 포스트의 요일별 개수 계산
  for (const post of allPosts) {
    try {
      const date = new Date(post.date);
      const dayOfWeek = date.getDay(); // 0 (일요일) ~ 6 (토요일)
      const dayName = dayNames[dayOfWeek];
      dayOfWeekData[dayName]++;
    } catch (error) {
      console.warn('Invalid date format:', post.date);
    }
  }
  
  // 배열로 변환 (일요일부터 토요일 순서)
  return dayNames.map(dayName => ({
    date: dayName,
    count: dayOfWeekData[dayName]
  }));
} 