# mkk4726.github.io

Next.js 기반 개인 블로그 저장소입니다.

## 포스트 작성 (Obsidian)

블로그 글은 **Obsidian**으로 관리합니다. 이 저장소를 클론한 뒤 Obsidian에서 **Vault는 반드시 `posts` 폴더만** 연 주세요. (저장소 루트가 아니라 `posts` 디렉터리가 Vault 루트입니다.)

- 새 마크다운 노트를 만들면 [Templater](https://github.com/SilentVoid13/Templater)가 `Templates/post-template.md`를 자동으로 적용합니다. `Templates/` 안에서 만드는 파일은 제외됩니다.
- 파일명은 `YYYY-MM-DD-제목.md` 형식을 권장합니다.
- frontmatter의 `Done: true`인 글만 블로그에 게시됩니다. 작업 중인 글은 `Done: false`로 두고, 공개 시 `Done: true`로 변경하세요.
- 이미지는 Vault 기준 `./images`(첨부 설정) 또는 사이트의 `public/`을 사용할 수 있습니다. 본문 규칙은 기존 글을 참고하세요.

## Portfolio 페이지 규칙

- `/portfolio` 페이지는 `posts/Career/Portfolio/Done` 폴더의 글을 자동으로 보여줍니다.
- 글의 frontmatter에 `Done: true`가 있어야 링크가 정상 생성되고 페이지에 노출됩니다.
- 즉, 새 포트폴리오를 추가할 때는 `posts/Career/Portfolio/Done/*.md`에 작성하고 `Done: true`로 두면 됩니다.
- 이 규칙을 기준으로 이후 포트폴리오 페이지 수정 작업을 요청하면 됩니다.

## Resume 페이지 규칙

- `/about` 페이지의 Resume 섹션은 `posts/Career/Resumes/Final.md`를 기준으로 렌더링됩니다.
- `Final.md` frontmatter의 `title`, `lastUpdated`(또는 `date`)를 상단 정보로 사용합니다.
- 즉, 이력서 내용을 바꿀 때는 `posts/Career/Resumes/Final.md`만 수정하면 됩니다.

## 자주 쓰는 명령어

| 명령 | 설명 |
|------|------|
| `npm install` | 의존성 설치 (최초 1회) |
| `npm run dev` | 로컬 개발 서버 |
| `npm run build` | **프로덕션 빌드** (`NODE_ENV=production`일 때 정적 `out/` 생성). **배포(푸시) 전에 로컬에서 한 번 돌려서 오류가 없는지 확인하는 것을 권장합니다.** |
| `npm run lint` | ESLint |
| `npm run generate-search` | 검색 인덱스만 재생성 |
| `npm run copy-assets` | 에셋 복사 스크립트만 실행 |
| `npm run normalize-frontmatter` | 프론트매터 정규화 |

배포는 `main` 브랜치 푸시 시 GitHub Actions(`.github/workflows/deploy.yml`)에서 `npm run build` 후 `out/`을 GitHub Pages에 올립니다.

## 선택: GA·환경 변수

방문 통계 등을 쓰려면 `env.example`을 참고해 `.env.local`을 채웁니다.

## 라이선스

[MIT License](LICENSE)
