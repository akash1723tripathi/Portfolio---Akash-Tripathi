import type { Metadata } from 'next';
import { AboutPageView } from '@/components/sections/about-page';
import { siteMetadata } from '@/data';

export const metadata: Metadata = {
  title: 'About Akash Tripathi | Full Stack Developer & Engineer',
  description:
    'Learn about Akash Tripathi, Full Stack Developer & Systems Engineer from Kanpur, India. Background in B.Tech CSE Data Science, experience at Weya.ai, and skills.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Akash Tripathi | Full Stack Developer & Engineer',
    description:
      'Learn about Akash Tripathi, Full Stack Developer & Systems Engineer from Kanpur, India. Background in B.Tech CSE Data Science, experience at Weya.ai, and skills.',
    url: `${siteMetadata.siteUrl}/about`,
    type: 'profile',
    siteName: siteMetadata.openGraph.siteName,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Akash Tripathi | Full Stack Developer & Engineer',
    description:
      'Learn about Akash Tripathi, Full Stack Developer & Systems Engineer from Kanpur, India. Background in B.Tech CSE Data Science, experience at Weya.ai, and skills.',
  },
};

const profilePageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${siteMetadata.siteUrl}/about#webpage`,
  url: `${siteMetadata.siteUrl}/about`,
  name: 'About Akash Tripathi | Full Stack Developer & Engineer',
  description:
    'Learn about Akash Tripathi, Full Stack Developer & Systems Engineer from Kanpur, India. Background in B.Tech CSE Data Science, experience at Weya.ai, and skills.',
  mainEntity: {
    '@id': `${siteMetadata.siteUrl}/#person`,
  },
};

/* Dedicated About page — composed like a case study (editorial reading
   rhythm with the Ledger woven in as a vitals strip and a colophon). Navbar,
   transitions and providers come from the root layout. */
export default function AboutRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profilePageJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <AboutPageView />
    </>
  );
}
