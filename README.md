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

1. Create a new `.md` file in the `src/content/posts/` directory
2. Add frontmatter with title, date, excerpt, and tags:

```markdown
---
title: "Your Post Title"
date: "2024-01-01"
excerpt: "A brief description of your post"
tags: ["tag1", "tag2"]
---

# Your Post Content

Write your post content here in Markdown...
```

3. The post will automatically appear on your blog!

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
