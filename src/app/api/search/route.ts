import { NextRequest, NextResponse } from 'next/server';
import { getSortedPostsData, getPostData } from '@/lib/posts';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    // Get all posts metadata
    const allPosts = await getSortedPostsData();
    const searchResults = [];

    // Search through posts
    for (const post of allPosts) {
      // Get full post data to search in content
      const fullPost = await getPostData(post.id);
      
      const searchTerm = query.toLowerCase();
      const title = fullPost.title.toLowerCase();
      const content = fullPost.content.toLowerCase();
      const category = fullPost.category?.toLowerCase() || '';
      const tags = fullPost.tags?.join(' ').toLowerCase() || '';

      // Check if search term exists in title, content, category, or tags
      if (
        title.includes(searchTerm) ||
        content.includes(searchTerm) ||
        category.includes(searchTerm) ||
        tags.includes(searchTerm)
      ) {
        // Create excerpt around the search term if found in content
        let excerpt = fullPost.excerpt || '';
        if (content.includes(searchTerm) && !excerpt) {
          const index = content.indexOf(searchTerm);
          const start = Math.max(0, index - 100);
          const end = Math.min(content.length, index + 100);
          excerpt = '...' + content.slice(start, end).trim() + '...';
        }

        searchResults.push({
          id: fullPost.id,
          title: fullPost.title,
          date: fullPost.date,
          excerpt,
          category: fullPost.category,
          tags: fullPost.tags,
        });
      }
    }

    return NextResponse.json({
      query,
      results: searchResults,
      total: searchResults.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 