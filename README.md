# My GitBlog

A modern, fast, and SEO-friendly personal blog built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📝 **Markdown Support**: Write posts in Markdown with frontmatter
- 🎨 **Modern Design**: Clean and responsive design with Tailwind CSS
- ⚡ **Fast Performance**: Static site generation for optimal speed
- 🔍 **SEO Optimized**: Built-in SEO features and meta tags
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🚀 **Easy Deployment**: Deploy to GitHub Pages with GitHub Actions

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
- **Lists**: `-` for bullets, `1.` for numbers
- **Blockquotes**: `> quoted text`
- **Code blocks**: \`\`\`language ... \`\`\`
- **Images**: `![alt text](/image.png)`
- **Links**: `[text](url)`
- **Horizontal rules**: `---`

### Adding Images

1. Place images in the `public/` directory
2. Reference them in markdown: `![description](/image-name.png)`

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

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── page.tsx        # Home page
│   ├── posts/          # Blog posts routes
│   └── about/          # About page
├── components/         # Reusable components
├── lib/               # Utility functions
└── content/           # Markdown files
    └── posts/         # Blog post markdown files
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

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
