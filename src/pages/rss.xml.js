import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../config.ts';

export async function GET(context) {
  const posts = (await getCollection('blog')).filter((p) => !p.data.draft);
  posts.sort((a, b) => b.data.pubDate - a.data.pubDate);
  return rss({
    title: `${site.name} — Blog`,
    description: 'Phát triển bản thân · Công nghệ · Review dự án',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.slug}/`,
    })),
  });
}
