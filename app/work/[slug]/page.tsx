import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { caseStudies, getCaseStudy, getCaseStudySlugs, siteMetadata } from '@/data';
import { Hero } from '@/components/sections/case-study/Hero';
import { Ledger } from '@/components/sections/case-study/Ledger';
import { Context } from '@/components/sections/case-study/Context';
import { Vision } from '@/components/sections/case-study/Vision';
import { Pull } from '@/components/sections/case-study/Pull';
import { Product } from '@/components/sections/case-study/Product';
import { Dashboard } from '@/components/sections/case-study/Dashboard';
import { Toggle } from '@/components/sections/case-study/Toggle';
import { Architecture } from '@/components/sections/case-study/Architecture';
import { Outcomes } from '@/components/sections/case-study/Outcomes';
import { Colophon } from '@/components/sections/case-study/Colophon';
import { NextCase } from '@/components/sections/case-study/NextCase';

export const dynamicParams = false;

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getCaseStudy(slug);
  const canonical = `/work/${slug}`;
  if (entry?.hero) {
    const title = `${entry.hero.title} · Case Study · Akash Tripathi`;
    const description = entry.hero.lede;
    const imageUrl = new URL(entry.hero.image, siteMetadata.siteUrl).toString();
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: `${siteMetadata.siteUrl}${canonical}`,
        type: 'article',
        siteName: siteMetadata.openGraph.siteName,
        images: [
          {
            url: imageUrl,
            alt: entry.hero.alt,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  }
  return { title: 'Case Study · Akash Tripathi', alternates: { canonical } };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getCaseStudy(slug);
  if (!entry) notFound();

  const nextTarget = entry.nextCase ? caseStudies[entry.nextCase.slug]?.hero : undefined;

  const projectSchema = entry.hero
    ? {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        '@id': `${siteMetadata.siteUrl}/work/${slug}#project`,
        headline: entry.hero.title,
        name: entry.hero.title,
        description: entry.hero.lede,
        image: new URL(entry.hero.image, siteMetadata.siteUrl).toString(),
        url: `${siteMetadata.siteUrl}/work/${slug}`,
        author: {
          '@id': `${siteMetadata.siteUrl}/#person`,
        },
        creator: {
          '@type': 'Person',
          name: siteMetadata.person.name,
          jobTitle: siteMetadata.person.jobTitle,
          url: siteMetadata.siteUrl,
        },
        keywords: entry.hero.pills,
      }
    : null;

  return (
    <main>
      {projectSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(projectSchema).replace(/</g, '\\u003c'),
          }}
        />
      )}
      {entry.hero && <Hero {...entry.hero} />}
      {entry.ledger && <Ledger {...entry.ledger} />}
      {entry.context && <Context {...entry.context} />}
      {entry.vision && <Vision {...entry.vision} />}
      {entry.pull && <Pull {...entry.pull} />}
      {entry.product && <Product {...entry.product} />}
      {entry.dashboard && <Dashboard {...entry.dashboard} />}
      {entry.toggle && <Toggle {...entry.toggle} />}
      {entry.architecture && <Architecture {...entry.architecture} />}
      {entry.outcomes && <Outcomes {...entry.outcomes} />}
      {entry.colophon && <Colophon {...entry.colophon} />}
      {entry.nextCase && (
        <NextCase
          slug={entry.nextCase.slug}
          counter={entry.nextCase.counter}
          target={
            nextTarget
              ? {
                  title: nextTarget.title,
                  image: nextTarget.image,
                  alt: nextTarget.alt,
                  year: nextTarget.year,
                }
              : undefined
          }
        />
      )}
    </main>
  );
}
