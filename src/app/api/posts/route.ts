import { NextResponse } from 'next/server';
import { getSortedPostsData } from '@/lib/posts';

export async function GET() {
  try {
    const posts = await getSortedPostsData();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 