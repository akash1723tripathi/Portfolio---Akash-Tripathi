import type { MetadataRoute } from 'next';
import { siteMetadata } from '@/data';

// Required for output: 'export' — emits a static robots.txt at build time.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-SearchBot',
    'PerplexityBot',
    'Google-Extended',
    'Applebot-Extended',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      ...aiBots.map((bot) => ({
        userAgent: bot,
        allow: '/',
      })),
    ],
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
  };
}
