# PDF 포스트 기능

`src/content/posts` 디렉토리에 PDF 파일을 업로드하면 자동으로 포스트로 생성되어 볼 수 있는 기능입니다.

## 🚀 주요 기능

- **자동 포스트 생성**: PDF 파일을 업로드하면 자동으로 포스트가 생성됩니다
- **카테고리별 분류**: 폴더 구조에 따라 자동으로 카테고리가 분류됩니다
- **파일 정보 표시**: 파일 크기, 업로드 날짜, 수정 날짜 등 메타 정보 표시
- **PDF 뷰어**: 브라우저에서 직접 PDF를 볼 수 있습니다
- **다운로드**: PDF 파일을 로컬에 저장할 수 있습니다
- **반응형 디자인**: 모바일과 데스크톱에서 모두 최적화

## 📁 파일 구조

```
src/
├── lib/
│   └── pdf-posts.ts              # PDF 포스트 관련 유틸리티 함수
├── components/
│   └── PdfPostCard.tsx           # PDF 포스트 카드 컴포넌트
├── app/
│   └── pdf-posts/
│       ├── page.tsx              # PDF 포스트 목록 페이지
│       └── [slug]/
│           └── page.tsx          # 개별 PDF 포스트 페이지
src/content/posts/                # PDF 파일 업로드 디렉토리
└── public/post/                  # 웹에서 접근 가능한 PDF 파일들
```

## 💻 사용법

### 1. PDF 파일 업로드

PDF 파일을 `src/content/posts` 디렉토리나 하위 폴더에 업로드하세요:

```
src/content/posts/
├── Data Science/
│   └── AI Engineering/
│       └── ai-engineering-building-applications-with-foundation-models.pdf
├── Causal Inference/
│   └── paper-review.pdf
└── documents.pdf
```

### 2. 자동 포스트 생성

PDF 파일을 업로드하면 다음과 같이 자동으로 포스트 정보가 생성됩니다:

- **제목**: 파일명을 기반으로 자동 생성 (예: `ai-engineering.pdf` → `Ai Engineering`)
- **카테고리**: 폴더 구조를 기반으로 자동 분류
- **태그**: 카테고리와 'PDF' 태그 자동 추가
- **슬러그**: 파일명을 기반으로 URL 친화적인 슬러그 생성

### 3. 페이지 접근

- **목록 페이지**: `/pdf-posts` - 모든 PDF 포스트 목록
- **개별 포스트**: `/pdf-posts/[slug]` - 개별 PDF 포스트 상세 페이지

## 🎨 기능 상세

### PDF 포스트 목록 페이지 (`/pdf-posts`)

- 카테고리별로 그룹화된 PDF 포스트 목록
- 각 포스트의 기본 정보 표시 (제목, 설명, 파일 크기, 날짜)
- 보기, 다운로드, 새 탭에서 열기 버튼
- 반응형 그리드 레이아웃

### 개별 PDF 포스트 페이지 (`/pdf-posts/[slug]`)

- PDF 문서의 상세 정보 표시
- 내장 PDF 뷰어로 직접 확인
- 다운로드 및 새 탭에서 열기 기능
- 메타 정보 (파일 크기, 날짜, 태그 등)

### PDF 뷰어

- 브라우저 내장 PDF 뷰어 사용
- 줌, 스크롤, 검색 등 기본 기능 제공
- 반응형 디자인으로 모바일에서도 최적화

## ⚙️ 기술적 구현

### 1. 파일 스캔 시스템

- `getPdfPosts()`: `src/content/posts` 디렉토리를 재귀적으로 스캔
- PDF 파일을 자동으로 감지하고 포스트 정보 생성
- 파일 메타데이터 (크기, 날짜 등) 자동 추출

### 2. 동적 라우팅

- Next.js의 동적 라우팅을 사용하여 개별 포스트 페이지 생성
- `generateStaticParams()`로 빌드 시 정적 페이지 생성

### 3. 파일 경로 매핑

- `src/content/posts`의 파일을 `public/post`로 매핑
- 웹에서 접근 가능한 경로로 자동 변환

### 4. 메타데이터 처리

- 파일명을 기반으로 한 제목 생성
- 폴더 구조를 기반으로 한 카테고리 분류
- 파일 크기, 수정 날짜 등 자동 추출

## 🔧 커스터마이징

### 제목 생성 규칙 수정

`src/lib/pdf-posts.ts`의 `title` 생성 로직을 수정할 수 있습니다:

```typescript
const title = fileName
  .replace(/[-_]/g, ' ')
  .replace(/\b\w/g, l => l.toUpperCase());
```

### 카테고리 분류 규칙 수정

폴더 구조에 따른 카테고리 분류 로직을 수정할 수 있습니다:

```typescript
const category = category || 'Documents';
```

### 태그 추가

추가 태그를 자동으로 추가하려면:

```typescript
const tags = [...categoryParts.filter(part => part.trim() !== ''), 'PDF', '문서'];
```

## 🚨 주의사항

1. **파일 크기**: 큰 PDF 파일은 로딩 시간이 걸릴 수 있습니다
2. **브라우저 호환성**: 브라우저의 PDF 뷰어 기능에 의존합니다
3. **파일 경로**: PDF 파일은 `public/post` 디렉토리에도 복사되어야 합니다
4. **파일명**: 특수문자가 포함된 파일명은 URL에서 문제가 될 수 있습니다

## 🐛 문제 해결

### PDF가 표시되지 않는 경우

1. 파일이 `public/post` 디렉토리에 있는지 확인
2. 파일 경로가 올바른지 확인
3. 브라우저 개발자 도구에서 네트워크 오류 확인

### 포스트가 목록에 나타나지 않는 경우

1. 파일이 `src/content/posts` 디렉토리에 있는지 확인
2. 파일 확장자가 `.pdf`인지 확인
3. 개발 서버를 재시작

### 파일 경로 오류

1. `src/lib/pdf-posts.ts`의 `pdfPath` 설정 확인
2. `public/post` 디렉토리 구조 확인

## 📝 예시

### 파일 구조
```
src/content/posts/
└── Data Science/
    └── AI Engineering/
        └── ai-engineering-building-applications-with-foundation-models.pdf
```

### 생성되는 포스트 정보
```typescript
{
  title: "Ai Engineering Building Applications With Foundation Models",
  slug: "ai-engineering-building-applications-with-foundation-models",
  category: "Data Science/AI Engineering",
  tags: ["Data Science", "AI Engineering", "PDF"],
  pdfPath: "/post/Data Science/AI Engineering/ai-engineering-building-applications-with-foundation-models.pdf",
  fileSize: 2.5, // MB
  date: "2025-01-27",
  lastModified: Date
}
```

이제 `src/content/posts` 디렉토리에 PDF 파일을 업로드하면 자동으로 포스트가 생성되어 블로그에서 확인할 수 있습니다! 