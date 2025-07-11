import { NextRequest, NextResponse } from 'next/server';
import { getPostsContributionDataByYear } from '@/lib/posts';

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  try {
    const year = parseInt(params.year);
    
    if (isNaN(year)) {
      return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
    }
    
    const data = await getPostsContributionDataByYear(year);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching contribution data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 