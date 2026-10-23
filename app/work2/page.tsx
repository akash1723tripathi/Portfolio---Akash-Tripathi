import type { Metadata } from 'next';
import { WorksStickersPage } from '@/components/sections/works-stickers';
import { siteMetadata } from '@/data';

export const metadata: Metadata = {
  title: 'Selected Works & Projects | Akash Tripathi',
  description:
    'Explore selected full-stack web and systems engineering projects by Akash Tripathi, including Kanbex, Wizardry AI, FinSight AI, CodeRoom, and Channel-X.',
  alternates: { canonical: '/work2' },
  openGraph: {
    title: 'Selected Works & Projects | Akash Tripathi',
    description:
      'Explore selected full-stack web and systems engineering projects by Akash Tripathi, including Kanbex, Wizardry AI, FinSight AI, CodeRoom, and Channel-X.',
    url: `${siteMetadata.siteUrl}/work2`,
    type: 'website',
    siteName: siteMetadata.openGraph.siteName,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Selected Works & Projects | Akash Tripathi',
    description:
      'Explore selected full-stack web and systems engineering projects by Akash Tripathi, including Kanbex, Wizardry AI, FinSight AI, CodeRoom, and Channel-X.',
  },
};

const collectionPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${siteMetadata.siteUrl}/work2#webpage`,
  url: `${siteMetadata.siteUrl}/work2`,
  name: 'Selected Works & Projects | Akash Tripathi',
  description:
    'Explore selected full-stack web and systems engineering projects by Akash Tripathi, including Kanbex, Wizardry AI, FinSight AI, CodeRoom, and Channel-X.',
  isPartOf: {
    '@id': `${siteMetadata.siteUrl}/#website`,
  },
  about: {
    '@id': `${siteMetadata.siteUrl}/#person`,
  },
};

export default function Work2Route() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <WorksStickersPage />
    </>
  );
}
