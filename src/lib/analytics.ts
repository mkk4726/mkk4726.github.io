import jwt from 'jsonwebtoken';
// Google Analytics API를 사용하여 조회수를 가져오는 유틸리티

export interface PageViews {
  pagePath: string;
  pageViews: number;
}

export interface AnalyticsData {
  totalViews: number;
  pageViews: PageViews[];
  popularPosts: PageViews[];
}

// 환경 변수에서 GA 설정 가져오기
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_PRIVATE_KEY = process.env.GA_PRIVATE_KEY;
const GA_CLIENT_EMAIL = process.env.GA_CLIENT_EMAIL;
const GA_VIEW_ID = process.env.GA_VIEW_ID;

// Google Analytics API를 사용하여 조회수 데이터 가져오기
export async function getAnalyticsData(): Promise<AnalyticsData> {
  if (!GA_MEASUREMENT_ID || !GA_PRIVATE_KEY || !GA_CLIENT_EMAIL || !GA_VIEW_ID) {
    console.warn('Google Analytics credentials not configured');
    return {
      totalViews: 0,
      pageViews: [],
      popularPosts: []
    };
  }

  try {
    // Google Analytics Data API v1을 사용
    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA_VIEW_ID}:runReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [
          {
            startDate: '30daysAgo',
            endDate: 'today',
          },
        ],
        dimensions: [
          {
            name: 'pagePath',
          },
        ],
        metrics: [
          {
            name: 'screenPageViews',
          },
        ],
        limit: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GA API error response:', errorText);
      throw new Error(`GA API error: ${response.status}`);
    }

    const data: {
      rows?: {
        dimensionValues: { value: string }[];
        metricValues: { value: string }[];
      }[];
    } = await response.json();
    
    const pageViews: PageViews[] = data.rows?.map((row) => ({
      pagePath: row.dimensionValues[0].value,
      pageViews: parseInt(row.metricValues[0].value),
    })) || [];

    const totalViews = pageViews.reduce((sum, page) => sum + page.pageViews, 0);
    
    // 인기 포스트 (홈페이지 제외)
    const popularPosts = pageViews
      .filter(page => page.pagePath.startsWith('/posts/'))
      .sort((a, b) => b.pageViews - a.pageViews)
      .slice(0, 5);

    return {
      totalViews,
      pageViews,
      popularPosts,
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      totalViews: 0,
      pageViews: [],
      popularPosts: []
    };
  }
}

// Google OAuth2 액세스 토큰 가져오기
async function getAccessToken(): Promise<string> {
  if (!GA_PRIVATE_KEY || !GA_CLIENT_EMAIL) {
    throw new Error('GA credentials not configured');
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: await createJWT(),
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth error: ${response.status}`);
    }

    const data: { access_token: string } = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// JWT 토큰 생성
async function createJWT(): Promise<string> {
  if (!GA_PRIVATE_KEY || !GA_CLIENT_EMAIL) {
    throw new Error('GA credentials not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: GA_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  return jwt.sign(payload, GA_PRIVATE_KEY, { 
    algorithm: 'RS256',
    header: {
      alg: 'RS256',
      typ: 'JWT',
    }
  });
}

// 클라이언트 사이드에서 페이지뷰 이벤트 전송
export function trackPageView(pagePath: string) {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
    });
  }
}

// 클라이언트 사이드에서 커스텀 이벤트 전송
export function trackEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

// TypeScript를 위한 gtag 타입 선언
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
} 