# mkk4726.github.io

공개 배포용 정적 페이지 저장소. https://mkk4726.github.io

- 노트·원본은 비공개 레포 `obsidian-vault`에 있다. 여기엔 **남에게 보여줘도 되는 HTML만** 올린다.
- 빌드 없음. `main` 브랜치 루트를 GitHub Pages가 그대로 배포한다 (`.nojekyll`).
- 배포 = HTML 파일을 만들어 넣고 push. 1분 안에 반영된다.
- 페이지 하나 = 폴더 하나: `<분류>/<이름>/index.html` (예: `trips/uk-2026/index.html`). 추가하면 루트 `index.html` 목록에 한 줄 넣는다.
- 페이지는 한 파일로 완결한다(CSS·JS 인라인). 외부는 Google Fonts 정도만. 맨 위에 `← mkk4726 pages` 링크로 목록에 돌아갈 수 있게 한다.
- 원본 내용은 vault 노트가 기준이다. 노트가 바뀌면 HTML을 다시 만들어 덮어쓴다.
- 공개 레포라 주소를 아는 누구나 볼 수 있다. 예약번호·숙소 위치·연락처 같은 개인정보는 넣지 않는다. 페이지마다 `<meta name="robots" content="noindex">`를 둔다.

## 페이지 목록

| 주소 | 내용 | vault 원본 |
| --- | --- | --- |
| `/trips/uk-2026/` | 영국여행 일정표 (날짜 누르면 시간표) | `Development/여행/영국여행/일정/` |

## legacy/blog

예전 Next.js 블로그 소스(2025). 지금은 빌드·배포하지 않고 보관만 한다. 빌드하려면 비공개 `obsidian-vault`의 `posts/`가 필요하다 → `legacy/blog/README.md`.
