import { getCollection } from 'astro:content';
import { site, categories } from '../config';

// llms.txt — Markdown guide for AI agents (https://llmstxt.org). Bilingual VI/EN.
export async function GET() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const byDate = (a, b) => new Date(b.data.pubDate ?? 0) - new Date(a.data.pubDate ?? 0);
  const vi = posts.filter((p) => (p.data.lang || 'vi') === 'vi').sort(byDate);
  const en = posts.filter((p) => p.data.lang === 'en').sort(byDate);
  const url = site.url;

  let md = `# ${site.name}\n\n`;
  md += `> ${site.name} — blog song ngữ về công nghệ, AI và phát triển bản thân. / Bilingual blog on technology, AI and self-growth.\n\n`;

  md += `## Chuyên mục (Tiếng Việt)\n\n`;
  for (const c of (categories.vi || [])) md += `- [${c.name}](${url}/blog/category/${c.slug}/)\n`;
  md += `\n## Bài viết (Tiếng Việt)\n\n`;
  for (const p of vi) md += `- [${p.data.title}](${url}/blog/${p.slug}/)\n`;

  md += `\n## Categories (English)\n\n`;
  for (const c of (categories.en || [])) md += `- [${c.name}](${url}/en/blog/category/${c.slug}/)\n`;
  md += `\n## Articles (English)\n\n`;
  for (const p of en) md += `- [${p.data.title}](${url}/blog/${p.slug}/)\n`;

  md += `\n## Liên kết / Links\n\n`;
  md += `- [Trang chủ / Home (VI)](${url}/)\n`;
  md += `- [Home (EN)](${url}/en/)\n`;

  return new Response(md, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
