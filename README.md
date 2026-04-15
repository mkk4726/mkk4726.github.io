# mkk4726.github.io

Next.js 기반 개인 블로그 저장소입니다.

## 포스트 작성 (Obsidian)

블로그 글은 **Obsidian**으로 관리합니다. 이 저장소를 클론한 뒤 Obsidian에서 **Vault는 반드시 `posts` 폴더만** 연 주세요. (저장소 루트가 아니라 `posts` 디렉터리가 Vault 루트입니다.)

- 새 마크다운 노트를 만들면 [Templater](https://github.com/SilentVoid13/Templater)가 `Templates/post-template.md`를 자동으로 적용합니다. `Templates/` 안에서 만드는 파일은 제외됩니다.
- 파일명은 `YYYY-MM-DD-제목.md` 형식을 권장합니다.
- 이미지는 Vault 기준 `./images`(첨부 설정) 또는 사이트의 `public/`을 사용할 수 있습니다. 본문 규칙은 기존 글을 참고하세요.

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
