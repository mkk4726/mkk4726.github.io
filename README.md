# mkk4726.github.io

공개 배포용 정적 페이지 저장소. https://mkk4726.github.io

- 노트·원본은 비공개 레포 `obsidian-vault`에 있다. 여기엔 **남에게 보여줘도 되는 HTML만** 올린다.
- 빌드 없음. `main` 브랜치 루트를 GitHub Pages가 그대로 배포한다 (`.nojekyll`).
- 배포 = HTML 파일을 만들어 넣고 push. 1분 안에 반영된다.
- 페이지 하나 = 폴더 하나: `<분류>/<이름>/index.html` (예: `trips/uk-2026/index.html`). 추가하면 루트 `index.html` 목록에 한 줄 넣는다.
- 페이지는 한 파일로 완결한다(CSS·JS 인라인). 외부는 Google Fonts 정도만. 맨 위에 `← mkk4726 pages` 링크로 목록에 돌아갈 수 있게 한다.
- 원본 내용은 vault 노트가 기준이다. 노트가 바뀌면 HTML을 다시 만들어 덮어쓴다.
- 공개 레포라 주소를 아는 누구나 볼 수 있다. 예약번호·집 위치·연락처 같은 개인정보는 넣지 않는다. 여행 숙소 위치는 넣는다. 페이지마다 `<meta name="robots" content="noindex">`를 둔다.

## 여행 일정표 (`trips/`)

- 새 여행은 `trips/_template/index.html`을 `trips/<영문이름>-<연도>/index.html`로 복사해서 시작한다.
- 바꿀 곳은 `<title>`·헤더 문구와 `<script>` 맨 위 데이터 블록뿐이다: `TRIP`, `DAYS`(날짜별 칸·시간표), `PLACES`(장소 이름·구글맵 검색어·좌표), `STOP_PLACES`(시간표 제목 → 장소), `FIT_REGION`.
- 그러면 날짜 칸, 날짜를 누르면 열리는 시간표, 장소별 구글맵 링크, 날짜별 동선 지도(Leaflet + OpenStreetMap, API 키 없음), 구간 선을 누르면 열리는 구글맵 길찾기, 숙소 핀(`TRIP.stay`), '구글맵에서 동선 열기' 버튼이 자동으로 생긴다.
- 완성 예시: `trips/uk-2026/` (뮤지컬 표 같은 여행별 패널 포함). `trips/_template/`은 목록에 올리지 않는다.

## 페이지 목록

| 주소 | 내용 | vault 원본 |
| --- | --- | --- |
| `/trips/uk-2026/` | 영국여행 일정표 (날짜 누르면 시간표 · 동선 지도) | `Development/여행/영국여행/일정/` |
| `/trips/cambodia-2026/` | 캄보디아 의료봉사 일정표 (뽀삿 진료 · 시엠립) | `Development/여행/캄보디아 의료봉사/일정/` |
| `/trips/gongju-2026/` | 공주여행 일정표 (1박 2일, 날씨 반영) | `Development/여행/공주여행/` |
| `/study/english/` | English 허브 (아래 두 페이지로 가는 카드) | — |
| `/study/english/conversation/` | AI Conversation: 표현 노트 · 주제 목록 · 오늘의 한 마디 (옛 주소 `/study/english-2026/`는 여기로 넘김) | `Development/English/Conversation/` (표현 노트 · 주제 목록) |
| `/study/english/harry-potter/` | Harry Potter로 익힌 표현 (본 구간 · 표현·뜻, 대사는 안 넣음) | `Development/English/Series_And_Movies/harry-potter/` → `publish_page.py`로 데이터 갱신 |

## legacy/blog

예전 Next.js 블로그 소스(2025). 지금은 빌드·배포하지 않고 보관만 한다. 빌드하려면 비공개 `obsidian-vault`의 `posts/`가 필요하다 → `legacy/blog/README.md`.
