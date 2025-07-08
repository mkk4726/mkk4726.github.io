import { NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/analytics';

export async function GET() {
  try {
    const analyticsData = await getAnalyticsData();
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error in analytics API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        totalViews: 0,
        pageViews: [],
        popularPosts: []
      },
      { status: 500 }
    );
  }
} 