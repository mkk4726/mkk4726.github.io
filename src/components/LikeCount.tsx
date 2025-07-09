'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { getLikeCount, isSupabaseConfigured } from '@/lib/supabase'

interface LikeCountProps {
  postSlug: string
}

export default function LikeCount({ postSlug }: LikeCountProps) {
  const [likeCount, setLikeCount] = useState<number | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    
    const fetchLikeCount = async () => {
      try {
        const count = await getLikeCount(postSlug)
        setLikeCount(count)
      } catch (error) {
        console.error('좋아요 수를 불러오는데 실패했습니다:', error)
        setLikeCount(0)
      }
    }

    fetchLikeCount()
  }, [postSlug])

  // Supabase가 설정되지 않았으면 숨김
  if (!isSupabaseConfigured()) {
    return null
  }

  if (likeCount === null) {
    return null // 로딩 중에는 표시하지 않음
  }

  if (likeCount === 0) {
    return null // 좋아요가 0개면 표시하지 않음
  }

  return (
    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
      <Heart size={14} className="fill-current text-red-500" />
      <span className="text-xs">{likeCount}</span>
    </div>
  )
} 