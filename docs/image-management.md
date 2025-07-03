# 이미지 관리 가이드

## 📁 폴더 구조

```
assets/
├── images/
│   ├── common/          # 공통 이미지 (로고, 아이콘 등)
│   ├── posts/           # 포스트별 이미지
│   │   ├── 2024-01-01-welcome/
│   │   ├── 2024-01-15-tutorial/
│   │   └── ...
│   └── thumbnails/      # 썸네일 이미지
```

## 🎯 이미지 관리 방법

### **1. 포스트별 이미지 관리 (권장)**

#### **폴더 구조:**
```
assets/images/posts/
├── 2024-01-01-welcome/
│   ├── hero-image.jpg
│   ├── screenshot-1.png
│   └── diagram.svg
├── 2024-01-15-tutorial/
│   ├── step-1.png
│   ├── step-2.png
│   └── final-result.jpg
```

#### **포스트에서 사용:**
```markdown
---
layout: post
title: "깃허브 블로그 시작하기"
date: 2024-01-01
image: /assets/images/posts/2024-01-01-welcome/hero-image.jpg
---

![히어로 이미지](/assets/images/posts/2024-01-01-welcome/hero-image.jpg)

## 첫 번째 단계

![스크린샷](/assets/images/posts/2024-01-01-welcome/screenshot-1.png)
```

### **2. 공통 이미지 관리**

#### **폴더 구조:**
```
assets/images/common/
├── logo.png
├── favicon.ico
├── social-share.jpg
└── icons/
    ├── github.svg
    ├── twitter.svg
    └── email.svg
```

#### **사용법:**
```html
<!-- 헤더에서 -->
<img src="{{ '/assets/images/common/logo.png' | relative_url }}" alt="로고">

<!-- 소셜 링크에서 -->
<img src="{{ '/assets/images/common/icons/github.svg' | relative_url }}" alt="GitHub">
```

## 📝 이미지 최적화 가이드

### **1. 파일 형식 선택**

| 용도 | 권장 형식 | 장점 |
|------|-----------|------|
| **사진** | JPEG | 압축률 높음, 파일 크기 작음 |
| **스크린샷** | PNG | 투명도 지원, 선명함 |
| **아이콘/로고** | SVG | 벡터, 확대해도 깨지지 않음 |
| **애니메이션** | GIF/WebP | 애니메이션 지원 |

### **2. 파일 크기 권장사항**

| 용도 | 최대 크기 | 권장 크기 |
|------|-----------|-----------|
| **히어로 이미지** | 1920x1080 | 1200x675 |
| **포스트 썸네일** | 800x600 | 600x450 |
| **인라인 이미지** | 800x600 | 600x450 |
| **아이콘** | 64x64 | 32x32 |

### **3. 파일명 규칙**

```
YYYY-MM-DD-post-title-image-type.jpg

예시:
2024-01-01-welcome-hero-image.jpg
2024-01-01-welcome-screenshot-1.png
2024-01-01-welcome-diagram.svg
```

## 🛠️ 이미지 최적화 도구

### **1. 온라인 도구**
- **TinyPNG**: PNG/JPEG 압축
- **Squoosh**: Google의 이미지 최적화 도구
- **SVGOMG**: SVG 최적화

### **2. 명령줄 도구**
```bash
# ImageMagick 설치 (Mac)
brew install imagemagick

# 이미지 리사이즈
convert input.jpg -resize 800x600 output.jpg

# 이미지 압축
convert input.jpg -quality 85 output.jpg
```

### **3. Jekyll 플러그인**
```ruby
# Gemfile에 추가
group :jekyll_plugins do
  gem 'jekyll-picture-tag'
  gem 'jekyll-responsive-image'
end
```

## 📱 반응형 이미지

### **1. CSS로 반응형 처리**
```scss
.post-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .post-image {
    margin: 0 -20px;
    border-radius: 0;
  }
}
```

### **2. HTML picture 태그 사용**
```html
<picture>
  <source media="(min-width: 800px)" srcset="/assets/images/posts/post-large.jpg">
  <source media="(min-width: 400px)" srcset="/assets/images/posts/post-medium.jpg">
  <img src="/assets/images/posts/post-small.jpg" alt="포스트 이미지">
</picture>
```

## 🎨 이미지 스타일링

### **1. 기본 이미지 스타일**
```scss
// assets/main.scss에 추가
.post-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  &.hero-image {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
  }
  
  &.thumbnail {
    width: 200px;
    height: 150px;
    object-fit: cover;
  }
}
```

### **2. 이미지 캡션**
```html
<figure>
  <img src="/assets/images/posts/image.jpg" alt="설명">
  <figcaption>이미지 캡션</figcaption>
</figure>
```

## 📊 이미지 성능 최적화

### **1. 지연 로딩 (Lazy Loading)**
```html
<img src="/assets/images/posts/image.jpg" loading="lazy" alt="설명">
```

### **2. WebP 형식 사용**
```html
<picture>
  <source srcset="/assets/images/posts/image.webp" type="image/webp">
  <img src="/assets/images/posts/image.jpg" alt="설명">
</picture>
```

### **3. CDN 사용**
```html
<!-- Cloudinary 예시 -->
<img src="https://res.cloudinary.com/your-cloud/image/upload/v1234567890/image.jpg" alt="설명">
```

## 🔍 이미지 SEO

### **1. Alt 텍스트 작성**
```html
<!-- 좋은 예 -->
<img src="/assets/images/posts/tutorial.png" alt="Jekyll 블로그 설정 단계별 스크린샷">

<!-- 나쁜 예 -->
<img src="/assets/images/posts/tutorial.png" alt="이미지">
```

### **2. 이미지 메타데이터**
```html
<img src="/assets/images/posts/image.jpg" 
     alt="설명"
     title="이미지 제목"
     width="800"
     height="600">
```

## 📋 체크리스트

- [ ] 이미지 파일명이 의미있게 작성되었는가?
- [ ] 이미지 크기가 적절한가? (1MB 이하 권장)
- [ ] Alt 텍스트가 작성되었는가?
- [ ] 반응형으로 설정되었는가?
- [ ] 지연 로딩이 적용되었는가?
- [ ] 이미지가 적절한 폴더에 저장되었는가? 