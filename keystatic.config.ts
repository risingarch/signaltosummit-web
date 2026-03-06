import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    signals: collection({
      label: 'Summit Signals',
      slugField: 'title',
      path: 'src/content/signals/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
        }),
        description: fields.text({
          label: 'Description',
          description: 'Brief description for cards and SEO',
          multiline: true,
        }),
        pillar: fields.select({
          label: 'Pillar',
          description: 'Content pillar categorization',
          options: [
            { label: 'Thesis', value: 'thesis' },
            { label: 'Pattern Recognition', value: 'pattern-recognition' },
            { label: 'Buyer Education', value: 'buyer-education' },
          ],
          defaultValue: 'thesis',
        }),
        publishDate: fields.date({
          label: 'Publish Date',
        }),
        updatedDate: fields.date({
          label: 'Updated Date',
          description: 'Leave blank if not updated since publish',
        }),
        author: fields.text({
          label: 'Author',
          defaultValue: 'Jaiah Kamara',
        }),
        videoUrl: fields.url({
          label: 'YouTube Video URL',
          description: 'YouTube embed URL (privacy-enhanced mode)',
        }),
        videoTitle: fields.text({
          label: 'Video Title',
          description: 'Title for the video embed',
        }),
        videoDuration: fields.text({
          label: 'Video Duration',
          description: 'e.g., "18 minutes"',
        }),
        thumbnail: fields.image({
          label: 'Thumbnail',
          directory: 'public/images/signals',
          publicPath: '/images/signals/',
        }),
        transcript: fields.text({
          label: 'Transcript',
          description: 'Video transcript text (collapsible on page)',
          multiline: true,
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Draft content is not published',
          defaultValue: false,
        }),
        content: fields.markdoc({
          label: 'Content',
        }),
      },
    }),
  },
});
