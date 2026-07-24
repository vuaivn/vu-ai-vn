import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://vu.ai.vn',
  integrations: [mdx()],
});
