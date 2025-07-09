'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { toggleLike, getLikeCount, checkUserLiked, getUserId, isSupabaseConfigured } from '@/lib/supabase'

interface LikeButtonProps {
  postSlug: string
}

export default function LikeButton({ postSlug }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    setUserId(getUserId())
  }, [])

  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) return

    const fetchLikeData = async () => {
      try {
        const [count, userLiked] = await Promise.all([
          getLikeCount(postSlug),
          checkUserLiked(postSlug, userId)
        ])
        setLikeCount(count)
        setIsLiked(userLiked)
      } catch (error) {
        console.error('좋아요 데이터를 불러오는데 실패했습니다:', error)
      }
    }

    fetchLikeData()
  }, [postSlug, userId])

  const handleLike = async () => {
    if (!userId || isLoading || !isSupabaseConfigured()) return

    setIsLoading(true)
    try {
      const newLikedState = await toggleLike(postSlug, userId)
      setIsLiked(newLikedState)
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1)
    } catch (error) {
      console.error('좋아요 처리에 실패했습니다:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Supabase가 설정되지 않았으면 컴포넌트를 숨김
  if (!isSupabaseConfigured()) {
    return null
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`
          flex items-center gap-1 px-3 py-2 rounded-full border transition-all duration-200
          ${isLiked 
            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        `}
        aria-label={isLiked ? '좋아요 취소' : '좋아요'}
      >
        <Heart 
          size={16} 
          className={`${isLiked ? 'fill-current' : ''} transition-all duration-200`}
        />
        <span className="text-sm font-medium">
          {likeCount > 0 ? likeCount : ''}
        </span>
      </button>
      {likeCount > 0 && (
        <span className="text-sm text-gray-500">
          {likeCount}명이 좋아합니다
        </span>
      )}
    </div>
  )
} 