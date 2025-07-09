import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Supabase가 제대로 설정되었는지 확인하는 함수
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
}

// 좋아요 관련 타입 정의
export interface PostLike {
  id: number
  post_slug: string
  user_id: string
  created_at: string
}

export interface PostLikeCount {
  post_slug: string
  like_count: number
}

// 좋아요 추가/제거 함수
export async function toggleLike(postSlug: string, userId: string) {
  // 기존 좋아요 확인
  const { data: existingLike, error: checkError } = await supabase
    .from('post_likes')
    .select()
    .eq('post_slug', postSlug)
    .eq('user_id', userId)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError
  }

  if (existingLike) {
    // 좋아요 제거
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_slug', postSlug)
      .eq('user_id', userId)
    
    if (error) throw error
    return false // 좋아요 제거됨
  } else {
    // 좋아요 추가
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_slug: postSlug, user_id: userId })
    
    if (error) throw error
    return true // 좋아요 추가됨
  }
}

// 포스트별 좋아요 수 조회
export async function getLikeCount(postSlug: string) {
  const { count, error } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact' })
    .eq('post_slug', postSlug)

  if (error) throw error
  return count || 0
}

// 사용자가 해당 포스트에 좋아요를 눌렀는지 확인
export async function checkUserLiked(postSlug: string, userId: string) {
  const { data, error } = await supabase
    .from('post_likes')
    .select()
    .eq('post_slug', postSlug)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return !!data
}

// 간단한 사용자 ID 생성 (로컬 스토리지 기반)
export function getUserId(): string {
  if (typeof window === 'undefined') return ''
  
  let userId = localStorage.getItem('blog_user_id')
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('blog_user_id', userId)
  }
  return userId
} 