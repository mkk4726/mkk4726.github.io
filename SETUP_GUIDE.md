# 댓글 시스템 설정 가이드

블로그에 댓글 기능이 성공적으로 추가되었습니다! 아래 단계를 따라 설정을 완료하세요.

## Giscus 댓글 시스템 설정

### 1. GitHub Repository 설정
1. GitHub repository에서 **Settings** → **Features** → **Discussions** 활성화
2. [GitHub Apps - giscus](https://github.com/apps/giscus)에서 giscus app 설치

### 2. Giscus 설정값 확인
1. [giscus.app](https://giscus.app/) 방문
2. Repository 입력: `mkk4726/mkk4726.github.io`
3. 생성된 설정값을 `src/components/Comments.tsx`에 적용:
   - `data-repo-id`
   - `data-category-id`

### 3. Comments.tsx 업데이트 필요 사항
```typescript
// src/components/Comments.tsx에서 다음 값들을 실제 값으로 변경
script.setAttribute('data-repo-id', 'YOUR_ACTUAL_REPO_ID')
script.setAttribute('data-category-id', 'YOUR_ACTUAL_CATEGORY_ID')
```

## 기능 확인

설정 완료 후 다음 기능들이 정상 작동하는지 확인하세요:

### 댓글 시스템
- [ ] 포스트 하단에 댓글 섹션이 표시됨
- [ ] GitHub 로그인으로 댓글 작성 가능
- [ ] 댓글 반응(좋아요 등) 기능 작동

## 배포 시 주의사항

- GitHub Pages나 Vercel 등에 배포할 때 환경이 올바르게 설정되어 있는지 확인하세요
- GitHub Discussions가 활성화되어 있어야 댓글 기능이 작동합니다

## 추가 커스터마이징

### 댓글 테마 변경
`src/components/Comments.tsx`에서 `data-theme` 속성을 수정하여 테마를 변경할 수 있습니다.

## 문제 해결

### 댓글이 로드되지 않는 경우
- GitHub Discussions가 활성화되어 있는지 확인
- giscus app이 올바르게 설치되어 있는지 확인
- Comments.tsx의 repository 정보가 정확한지 확인 