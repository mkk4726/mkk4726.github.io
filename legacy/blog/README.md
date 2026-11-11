# Legacy: Next.js 블로그

예전 GitHub Pages 블로그 코드. **지금은 쓰지 않는다.** 나중에 다시 배포할 때만 참고.

## 복구 방법

1. 이 폴더(`legacy/blog/`) 안의 파일·폴더를 빌드할 저장소 루트로 옮긴다  
   (`src/`, `public/`, `scripts/`, `package.json`, Next/Tailwind 설정, `.github/workflows/deploy.yml` 등).
2. 루트에서 `npm ci` → `npm run build`로 확인.
3. `posts/`는 Obsidian vault이므로 그대로 둔다. 빌드 스크립트는 cwd 기준 `posts/`를 읽는다.

## 포함 내용

| 경로 | 역할 |
|------|------|
| `src/` | App Router, 컴포넌트, posts 파이프라인 |
| `public/` | 정적 에셋 |
| `scripts/` | copy-assets, frontmatter 정규화 |
| `.github/workflows/deploy.yml` | Pages 배포 (수동 `workflow_dispatch`만) |
| `package.json` 등 | Next 15 + 의존성 |

Next.js 15 App Router + 정적 export. `Done: true` 포스트만 퍼블리싱. Obsidian `![[image]]` / `[[링크]]` 변환. 빌드 스크립트는 cwd 기준 `posts/`를 읽으므로, 복구하려면 비공개 `obsidian-vault`의 `posts/`를 옆에 두어야 한다.
