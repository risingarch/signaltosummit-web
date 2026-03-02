import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  let signals;
  try {
    signals = await getCollection('signals', ({ data }) => !data.draft);
  } catch {
    signals = [];
  }

  return rss({
    title: 'Summit Signals — Signal to Summit',
    description:
      'Why retail media partnerships fail — and how to read the signals before they do. Analysis and insights from Signal to Summit.',
    site: context.site!.toString(),
    items: signals
      .sort(
        (a, b) =>
          new Date(b.data.publishDate).getTime() -
          new Date(a.data.publishDate).getTime()
      )
      .map((signal) => ({
        title: signal.data.title,
        pubDate: new Date(signal.data.publishDate),
        description: signal.data.description,
        link: `/summit-signals/${signal.id}`,
        author: signal.data.author,
        categories: [signal.data.pillar],
      })),
    customData: '<language>en-us</language>',
  });
}
