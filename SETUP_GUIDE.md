# 댓글 및 좋아요 시스템 설정 가이드

블로그에 댓글과 좋아요 기능이 성공적으로 추가되었습니다! 아래 단계를 따라 설정을 완료하세요.

## 1. Giscus 댓글 시스템 설정

### 1.1 GitHub Repository 설정
1. GitHub repository에서 **Settings** → **Features** → **Discussions** 활성화
2. [GitHub Apps - giscus](https://github.com/apps/giscus)에서 giscus app 설치

### 1.2 Giscus 설정값 확인
1. [giscus.app](https://giscus.app/) 방문
2. Repository 입력: `mkk4726/mkk4726.github.io`
3. 생성된 설정값을 `src/components/Comments.tsx`에 적용:
   - `data-repo-id`
   - `data-category-id`

### 1.3 Comments.tsx 업데이트 필요 사항
```typescript
// src/components/Comments.tsx에서 다음 값들을 실제 값으로 변경
script.setAttribute('data-repo-id', 'YOUR_ACTUAL_REPO_ID')
script.setAttribute('data-category-id', 'YOUR_ACTUAL_CATEGORY_ID')
```

## 2. Supabase 좋아요 시스템 설정

### 2.1 Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com/) 방문
2. 새 프로젝트 생성
3. Project URL과 anon key 복사

### 2.2 환경 변수 설정
`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용 추가:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2.3 Supabase 데이터베이스 테이블 생성
Supabase SQL Editor에서 다음 쿼리 실행:

```sql
-- 좋아요 테이블 생성
create table if not exists public.post_likes (
  id bigint primary key generated always as identity,
  post_slug text not null,
  user_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_slug, user_id)
);

-- RLS (Row Level Security) 활성화
alter table public.post_likes enable row level security;

-- 모든 사용자가 읽기 가능
create policy "Anyone can view likes" on public.post_likes
  for select using (true);

-- 모든 사용자가 자신의 좋아요 추가/삭제 가능
create policy "Users can insert their own likes" on public.post_likes
  for insert with check (true);

create policy "Users can delete their own likes" on public.post_likes
  for delete using (true);
```

## 3. 기능 확인

설정 완료 후 다음 기능들이 정상 작동하는지 확인하세요:

### 댓글 시스템
- [ ] 포스트 하단에 댓글 섹션이 표시됨
- [ ] GitHub 로그인으로 댓글 작성 가능
- [ ] 댓글 반응(좋아요 등) 기능 작동

### 좋아요 시스템
- [ ] 하트 버튼 클릭으로 좋아요 추가/제거
- [ ] 좋아요 수 실시간 업데이트
- [ ] 새로고침 후에도 좋아요 상태 유지

## 4. 배포 시 주의사항

- `.env.local` 파일은 git에 커밋하지 마세요
- GitHub Pages나 Vercel 등에 배포할 때 환경 변수를 별도로 설정해야 합니다
- Supabase는 무료 티어로도 충분히 사용 가능합니다

## 5. 추가 커스터마이징

### 댓글 테마 변경
`src/components/Comments.tsx`에서 `data-theme` 속성을 수정하여 테마를 변경할 수 있습니다.

### 좋아요 버튼 스타일링
`src/components/LikeButton.tsx`에서 Tailwind CSS 클래스를 수정하여 스타일을 변경할 수 있습니다.

## 문제 해결

### 댓글이 로드되지 않는 경우
- GitHub Discussions가 활성화되어 있는지 확인
- giscus app이 올바르게 설치되어 있는지 확인
- Comments.tsx의 repository 정보가 정확한지 확인

### 좋아요 기능이 작동하지 않는 경우
- 환경 변수가 올바르게 설정되어 있는지 확인
- Supabase 테이블이 생성되어 있는지 확인
- 브라우저 개발자 도구에서 네트워크 오류 확인 