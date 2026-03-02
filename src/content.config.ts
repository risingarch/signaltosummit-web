import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Summit Signals — Content collection for the content hub
 * Each piece is a markdown file with frontmatter defining
 * title, pillar, description, date, video URL, etc.
 */
const signals = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/signals' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pillar: z.enum(['thesis', 'pattern-recognition', 'buyer-education']),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Jaiah Kamara'),
    videoUrl: z.string().url().optional(),
    videoTitle: z.string().optional(),
    videoDuration: z.string().optional(),
    thumbnail: z.string().optional(),
    draft: z.boolean().default(false),
    faqItems: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
  }),
});

export const collections = { signals };
