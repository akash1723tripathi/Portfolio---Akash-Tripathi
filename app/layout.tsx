import type { Metadata, Viewport } from "next";
import { Doppio_One, Inter } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BackToTop } from "@/components/ui/BackToTop";
import { OllieChatbot } from "@/components/ui/OllieChatbot";
import { AccentColorProvider } from "@/lib/AccentColorContext";
import { LenisProvider } from "@/lib/LenisProvider";
import { InteractiveBackground } from "@/components/sections/Hero";
import { Navbar } from "@/components/layout/Navbar";
import {
  TransitionProvider,
  TransitionStage,
} from "@/components/transitions";
import { siteMetadata } from "@/data";
import { Analytics } from "@vercel/analytics/next";

const doppioOne = Doppio_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-navbar",
  display: "swap",
  // The navbar brand (the only above-the-fold consumer) is hidden/animated in
  // during the welcome→hero handoff, so the font isn't painted at first load.
  // Preloading it buys nothing and triggers Firefox's "preloaded but not used"
  // warning. display:swap still handles the fallback when it does paint.
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-chat",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: siteMetadata.title,
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  authors: [{ name: siteMetadata.author, url: siteMetadata.siteUrl }],
  creator: siteMetadata.author,
  publisher: siteMetadata.author,
  alternates: { canonical: "/" },
  other: {
    "darkreader-lock": "",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: siteMetadata.openGraph.title,
    description: siteMetadata.openGraph.description,
    type: siteMetadata.openGraph.type,
    locale: siteMetadata.openGraph.locale,
    siteName: siteMetadata.openGraph.siteName,
    url: siteMetadata.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.twitter.title ?? siteMetadata.title,
    description: siteMetadata.twitter.description ?? siteMetadata.description,
    creator: siteMetadata.twitter.creator,
  },
};

export const viewport: Viewport = {
  themeColor: siteMetadata.themeColor,
};

// Run synchronously before paint — next/script's beforeInteractive is
// unreliable in App Router (fires after hydration), causing a theme flash on
// dark-mode users and a scroll-position flash on reload. Inline scripts execute
// at parse time, before React. Three concerns: apply saved dark theme, force
// manual scroll restoration, and flag the load as fresh for downstream code.
const BOOTSTRAP_SCRIPT = `
(function(){try{if(localStorage.getItem("portfolio_theme")==="dark"){document.documentElement.setAttribute("data-theme","dark")}}catch(e){}})();
if("scrollRestoration"in history){history.scrollRestoration="manual"}
window.scrollTo(0,0);
window.__freshLoad=true;
`;

const rootStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteMetadata.siteUrl}/#person`,
      name: siteMetadata.person.name,
      alternateName: siteMetadata.person.alternateName,
      jobTitle: siteMetadata.person.jobTitle,
      description: siteMetadata.description,
      url: siteMetadata.siteUrl,
      image: `${siteMetadata.siteUrl}/opengraph-image`,
      email: `mailto:${siteMetadata.person.email}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kanpur",
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
      alumniOf: {
        "@type": "EducationalOrganization",
        name: siteMetadata.person.alumniOf,
        url: "https://jssaten.ac.in/",
      },
      knowsAbout: siteMetadata.person.knowsAbout,
      sameAs: siteMetadata.person.sameAs,
    },
    {
      "@type": "WebSite",
      "@id": `${siteMetadata.siteUrl}/#website`,
      url: siteMetadata.siteUrl,
      name: siteMetadata.title,
      description: siteMetadata.description,
      publisher: {
        "@id": `${siteMetadata.siteUrl}/#person`,
      },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${doppioOne.variable} ${inter.variable}`} suppressHydrationWarning>
        {/* See BOOTSTRAP_SCRIPT above — pre-paint theme + scroll-restoration bootstrap. */}
        <script
          dangerouslySetInnerHTML={{
            __html: BOOTSTRAP_SCRIPT,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(rootStructuredData).replace(/</g, '\\u003c'),
          }}
        />
        <LenisProvider>
          <AccentColorProvider>
            <TransitionProvider>
              <InteractiveBackground />
              <Navbar />
              <CustomCursor />
              <BackToTop />
              <ThemeToggle />
              <OllieChatbot />
              {children}
              <TransitionStage />
            </TransitionProvider>
          </AccentColorProvider>
        </LenisProvider>
        <Analytics />
      </body>
    </html>
  );
}
