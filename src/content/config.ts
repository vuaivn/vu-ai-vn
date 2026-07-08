import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['phat-trien-ban-than', 'cong-nghe', 'review']),
    lang: z.enum(['vi', 'en']).default('vi'),
    cover: z.string().optional(),
    updatedDate: z.coerce.date().optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
