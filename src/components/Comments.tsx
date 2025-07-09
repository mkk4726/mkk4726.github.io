'use client'

import { useEffect, useRef } from 'react'

interface CommentsProps {
  postSlug: string
}

// 댓글 시스템 활성화 여부를 제어하는 상수
const COMMENTS_ENABLED = false // 내일 활성화할 때 true로 변경

export default function Comments({ postSlug }: CommentsProps) {
  const ref = useRef<HTMLDivElement>(null)

  // 댓글이 비활성화되어 있으면 컴포넌트를 렌더링하지 않음
  if (!COMMENTS_ENABLED) {
    return null
  }

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    
    // Giscus 설정 - 나중에 실제 repository 정보로 업데이트 필요
    script.setAttribute('data-repo', 'mkk4726/mkk4726.github.io')
    script.setAttribute('data-repo-id', 'R_kgDONAOH0w') // 실제 repo ID로 변경 필요
    script.setAttribute('data-category', 'General')
    script.setAttribute('data-category-id', 'DIC_kwDONAOH084ClFb8') // 실제 category ID로 변경 필요
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-term', postSlug)
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', 'light')
    script.setAttribute('data-lang', 'ko')
    script.setAttribute('data-loading', 'lazy')

    ref.current.appendChild(script)
  }, [postSlug])

  // 테마는 라이트 모드로 고정 (필요시 나중에 다크모드 지원 추가 가능)

  return (
    <section className="mt-8 border-t pt-8">
      <h3 className="text-xl font-bold mb-4">댓글</h3>
      <div ref={ref} />
    </section>
  )
} 