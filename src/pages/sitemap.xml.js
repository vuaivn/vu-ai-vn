import { getCollection } from 'astro:content';

const STATIC = [
  '/', '/blog', '/tools', '/contact',
  '/en', '/en/blog', '/en/tools', '/en/contact',
  '/blog/category/phat-trien-ban-than',
  '/blog/category/cong-nghe',
  '/blog/category/review',
];

export async function GET(context) {
  const base = context.site?.href?.replace(/\/$/, '') || 'https://vu.ai.vn';
  const posts = (await getCollection('blog')).filter((p) => !p.data.draft);
  const urls = [
    ...STATIC.map((u) => ({ loc: base + u, lastmod: null })),
    ...posts.map((p) => ({
      loc: `${base}/blog/${p.slug}`,
      lastmod: p.data.pubDate.toISOString(),
    })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`
  )
  .join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
