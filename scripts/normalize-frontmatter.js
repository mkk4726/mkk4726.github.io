const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'posts');

function getAllMarkdownFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function normalizeDate(value, fallbackDate) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      const isoLike = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
      if (isoLike) return isoLike[1];
      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }
  }
  return fallbackDate;
}

function normalizeTags(value, fallbackCategory) {
  const normalizeTagValue = (tag) => String(tag).trim().replace(/\s+/g, '-');
  let tags = [];
  if (Array.isArray(value)) {
    tags = value.map((tag) => normalizeTagValue(tag)).filter(Boolean);
  } else if (typeof value === 'string') {
    tags = value
      .split(',')
      .map((tag) => normalizeTagValue(tag))
      .filter(Boolean);
  }

  if (tags.length === 0 && fallbackCategory) {
    tags = fallbackCategory
      .split('/')
      .map((segment) => normalizeTagValue(segment))
      .filter(Boolean);
  }

  return Array.from(new Set(tags));
}

function fallbackTitle(filePath) {
  const fileName = path.basename(filePath, '.md');
  return fileName
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fallbackExcerpt(content) {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('!['));
  return (lines[0] || '').slice(0, 180);
}

function normalizeFrontmatter(filePath, data, content) {
  const stat = fs.statSync(filePath);
  const relativePath = path.relative(postsDirectory, filePath);
  const folderPath = path.dirname(relativePath).replace(/\\/g, '/');
  const fallbackDate = stat.mtime.toISOString().split('T')[0];

  const title = typeof data.title === 'string' && data.title.trim() ? data.title.trim() : fallbackTitle(filePath);
  const date = normalizeDate(data.date, fallbackDate);
  const category = typeof data.category === 'string' && data.category.trim()
    ? data.category.trim()
    : (folderPath === '.' ? 'Uncategorized' : folderPath);
  const tags = normalizeTags(data.tags, category);
  const excerpt = typeof data.excerpt === 'string' && data.excerpt.trim()
    ? data.excerpt.trim()
    : fallbackExcerpt(content);
  const doneValue = data.Done ?? data.done;
  const isDone = typeof doneValue === 'boolean' ? doneValue : true;

  return {
    title,
    date,
    excerpt,
    category,
    tags,
    Done: isDone,
  };
}

function escapeYamlString(value) {
  const text = String(value ?? '');
  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function stringifyFrontmatter(data) {
  const lines = ['---'];
  lines.push(`title: ${escapeYamlString(data.title)}`);
  lines.push(`date: ${data.date}`);
  lines.push(`excerpt: ${escapeYamlString(data.excerpt)}`);
  lines.push(`category: ${escapeYamlString(data.category)}`);
  lines.push('tags:');
  for (const tag of data.tags) {
    lines.push(`  - ${escapeYamlString(tag)}`);
  }
  lines.push(`Done: ${data.Done ? 'true' : 'false'}`);
  lines.push('---');
  return `${lines.join('\n')}\n`;
}

function run() {
  const markdownFiles = getAllMarkdownFiles(postsDirectory);
  let updatedCount = 0;

  for (const filePath of markdownFiles) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(raw);
    const normalizedData = normalizeFrontmatter(filePath, parsed.data || {}, parsed.content || '');

    const body = parsed.content.startsWith('\n') ? parsed.content.slice(1) : parsed.content;
    const stableStringified = `${stringifyFrontmatter(normalizedData)}\n${body}`;
    if (stableStringified !== raw) {
      fs.writeFileSync(filePath, stableStringified, 'utf8');
      updatedCount += 1;
    }
  }

  console.log(`Normalized frontmatter: ${updatedCount}/${markdownFiles.length} markdown files updated`);
}

run();
