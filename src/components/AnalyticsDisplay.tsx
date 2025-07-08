'use client';

import { useEffect, useState } from 'react';
import { AnalyticsData } from '@/lib/analytics';

export default function AnalyticsDisplay() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        📊 블로그 통계
      </h2>
      
      {/* 총 조회수 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">지난 30일 총 조회수</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {analyticsData.totalViews.toLocaleString()}
            </p>
          </div>
          <div className="text-4xl">👀</div>
        </div>
      </div>

      {/* 인기 포스트 */}
      {analyticsData.popularPosts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🔥 인기 포스트
          </h3>
          <div className="space-y-3">
            {analyticsData.popularPosts.map((post, index) => (
              <div key={post.pagePath} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                    {post.pagePath.replace('/posts/', '').replace(/-/g, ' ')}
                  </span>
                </div>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {post.pageViews.toLocaleString()}회
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 페이지별 조회수 */}
      {analyticsData.pageViews.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📈 페이지별 조회수
          </h3>
          <div className="space-y-2">
            {analyticsData.pageViews.slice(0, 10).map((page) => (
              <div key={page.pagePath} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                  {page.pagePath === '/' ? '홈페이지' : page.pagePath}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {page.pageViews.toLocaleString()}회
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 