# My GitBlog

A modern, fast, and SEO-friendly personal blog built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📝 **Markdown Support**: Write posts in Markdown with frontmatter
- 🎨 **Modern Design**: Clean and responsive design with Tailwind CSS
- ⚡ **Fast Performance**: Static site generation for optimal speed
- 🔍 **SEO Optimized**: Built-in SEO features and meta tags
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🚀 **Easy Deployment**: Deploy to GitHub Pages with GitHub Actions
- 📄 **Resume Section**: Professional resume in Markdown format
- 🎯 **Portfolio Showcase**: Project showcase in Markdown format
- 📧 **Contact Information**: Easy access to social media and contact details
- 📊 **Analytics**: Google Analytics integration with view count display

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Content**: Markdown with gray-matter and remark
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Google Analytics Setup

To enable analytics and view count features:

1. **Create Google Analytics 4 Property**:
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new GA4 property for your website
   - Note down your Measurement ID (G-XXXXXXXXXX)

2. **Set up Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Analytics Data API
   - Create a service account and download the JSON key file

3. **Configure Environment Variables**:
   - Copy `env.example` to `.env.local`
   - Fill in your actual values:
     ```
     NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
     GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     GA_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
     GA_VIEW_ID=properties/123456789
     ```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mkk4726.github.io.git
cd mkk4726.github.io
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the blog.

## Writing Posts

To add a new blog post:

1. **Use the template**: Copy `src/content/posts/template.md` as a starting point
2. **Name your file**: Use format `YYYY-MM-DD-title.md` (e.g., `2024-01-15-my-first-post.md`)
3. **Update frontmatter**: Fill in the title, date, excerpt, and tags

### Frontmatter Format

```markdown
---
title: "Your Post Title"
date: "2024-01-01"
excerpt: "A brief description of your post (optional)"
tags: ["tag1", "tag2", "category"]
---
```

### Supported Markdown Features

- **Headers**: `# H1`, `## H2`, `### H3`
- **Bold/Italic**: `**bold**`, `*italic*`
- **Audio Player**: `@audio[Title](path/to/audio.wav)` - Embeds a custom audio player with play/pause, progress bar, and volume controls
- **Lists**: `-` for bullets, `1.` for numbers
- **Blockquotes**: `> quoted text`
- **Code blocks**: \`\`\`language ... \`\`\`
- **Images**: `![alt text](/image.png)`
- **Links**: `[text](url)`
- **Horizontal rules**: `---`

### Adding Images

1. Place images in the `public/` directory
2. Reference them in markdown: `![description](/image-name.png)`

### Adding Audio Files

1. Place audio files in the `public/` directory (e.g., `public/guitar/love.wav`)
2. Use the audio player syntax in markdown: `@audio[Title](path/to/audio.wav)`

**Example:**
```markdown
@audio[My Guitar Practice](/guitar/love.wav)
```

**Features:**
- Custom audio player with play/pause controls
- Progress bar for seeking through the audio
- Volume control with mute button
- Time display showing current position and total duration
- Responsive design that works on mobile and desktop
- Dark mode support

### Example Post Structure

```markdown
---
title: "My Awesome Post"
date: "2024-01-15"
excerpt: "This is what my post is about"
tags: ["tutorial", "nextjs", "coding"]
---

# My Awesome Post

Introduction paragraph here.

## Main Section

Content with **bold** and *italic* text.

> This is a quote or important note.

### Subsection

More content here.

## Conclusion

Wrap up your thoughts.
```

The post will automatically appear on your blog!

## Managing Resume & Portfolio

### Resume Management
To update your resume on the About page:

1. **Edit the markdown file**: Modify `src/content/resume.md`
2. **Update frontmatter**: Change title and lastUpdated date if needed
3. **Format content**: Use standard markdown syntax for formatting

The resume section includes:
- Professional formatting with markdown
- Last updated timestamp
- Skills and experience sections
- Contact information

### Portfolio Management
To showcase your projects:

1. **Edit the markdown file**: Modify `src/content/portfolio.md`
2. **Add new projects**: Use markdown formatting for project descriptions
3. **Update links**: Include GitHub and live demo links

Portfolio features:
- Project descriptions in markdown
- Technology stack listings
- GitHub and live demo links
- Professional formatting

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── page.tsx        # Home page
│   ├── posts/          # Blog posts routes
│   ├── about/          # About page (with Resume & Portfolio)
│   └── api/            # API routes
│       └── analytics/  # Analytics data endpoint
├── components/         # Reusable components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   ├── PostCard.tsx    # Blog post card
│   ├── MarkdownContent.tsx # Markdown rendering component
│   ├── AudioPlayer.tsx # Custom audio player component
│   ├── CustomAudioPlayer.tsx # Enhanced audio player component
│   ├── GoogleAnalytics.tsx # Google Analytics tracking
│   └── AnalyticsDisplay.tsx # Analytics data display
├── lib/               # Utility functions
│   ├── posts.ts       # Blog post utilities
│   ├── content.ts     # Content management utilities
│   ├── markdown.ts    # Markdown parsing with audio support
│   ├── remark-audio.ts # Remark plugin for audio syntax
│   ├── rehype-audio.ts # Rehype plugin for audio HTML generation
│   └── analytics.ts   # Google Analytics utilities
└── content/           # Markdown files
    ├── posts/         # Blog post markdown files
    ├── resume.md      # Resume content
    └── portfolio.md   # Portfolio content

public/
├── guitar/            # Audio files for guitar practice
│   └── love.wav       # Example audio file
└── post/             # Blog post images
```

## Deployment

This blog is configured to deploy automatically to GitHub Pages:

1. Push your changes to the `main` branch
2. GitHub Actions will automatically build and deploy your site
3. Your blog will be available at `https://yourusername.github.io`

## Customization

- **Styling**: Modify `tailwind.config.ts` and component styles
- **Layout**: Edit `src/app/layout.tsx` for global layout changes
- **Components**: Add new components in `src/components/`
- **Content**: Update About page and sample posts
- **Resume**: Edit `src/content/resume.md` to update your resume
- **Portfolio**: Edit `src/content/portfolio.md` to update your projects

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## GitHub Pages 배포 방법 (정적 사이트)

이 프로젝트는 Next.js 기반으로, 정적 사이트로 export하여 GitHub Pages에서 배포할 수 있습니다.

### 1. 정적 파일로 내보내기 (export)
```bash
npm run export
```
- 프로젝트 루트에 `out/` 폴더가 생성됩니다.

### 2. out/ 폴더를 배포 브랜치(gh-pages) 또는 docs/ 폴더로 복사
- **방법 1:** out/ 폴더의 내용을 gh-pages 브랜치에 커밋
- **방법 2:** main 브랜치의 docs/ 폴더로 복사 후, GitHub Pages에서 docs/로 지정

### 3. (선택) CNAME, 404.html 등 추가 파일 확인
- 커스텀 도메인을 쓴다면 `out/CNAME` 파일이 필요합니다.
- 404 페이지가 필요하다면 `out/404.html`이 생성되어 있는지 확인하세요.

### 4. git add/commit/push
- out/ 폴더(혹은 docs/)의 변경사항을 커밋하고 푸시합니다.

### 5. GitHub Pages 설정 확인
- gh-pages 브랜치 또는 docs/ 폴더가 배포 대상으로 지정되어 있는지 확인하세요.

---

#### 요약 체크리스트
- [x] `npm run export`로 out/ 폴더 생성
- [x] out/ 폴더를 배포 브랜치/docs/로 복사
- [x] (필요시) CNAME, 404.html 등 확인
- [x] git add/commit/push

---

> 이 안내는 자동화/수동 배포 모두 참고할 수 있습니다.
