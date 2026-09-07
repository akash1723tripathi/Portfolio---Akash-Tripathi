# Akash Tripathi — Portfolio

Personal portfolio website for Akash Tripathi, a Full Stack Web Engineer. The site presents selected work, case studies, services, an about page, and contact information through an animation-led interface.

## Overview

This project is built as a statically exported Next.js application. It combines structured JSON content with reusable React sections and UI components, smooth scrolling, page transitions, interactive backgrounds, theme switching, and selected Three.js experiences.

The production build is generated in the `out/` directory and can be deployed to any static hosting provider.

## Tech stack

- Next.js 16 with the App Router and static export
- React 19 and TypeScript
- GSAP for animation and transitions
- Three.js, React Three Fiber, Drei, and Rapier for 3D experiences
- Lenis for smooth scrolling
- CSS Modules and global CSS for styling
- Vercel Analytics

## Requirements

- Node.js 20 or newer
- npm

## Getting started

Clone the repository, install dependencies, and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Fetch contribution data and create the production static export in `out/`. |
| `npm run start` | Start Next.js in production mode where supported. For the static export, serve `out/` with a static web server. |
| `npm run lint` | Run ESLint. |
| `npm run lint:fix` | Automatically fix supported ESLint issues. |
| `npm run contrib` | Refresh the GitHub contributions data used by the About page. |
| `node scripts/optimize-images.mjs` | Generate optimized WebP copies of portfolio images. |

To preview the exported site locally after building, use any static server, for example:

```bash
npx serve out
```

## Project structure

```text
app/          Routes, layouts, metadata, sitemap, and robots configuration
components/   Reusable layout, UI, page section, case study, and transition components
data/         Typed JSON content, design tokens, navigation, projects, and case studies
lib/          Shared hooks, providers, animation helpers, and utilities
public/       Images, fonts, 3D assets, and other static files
scripts/      Build-time contribution fetching and image optimization scripts
styles/       Font, animation, and CSS variable definitions
docs/         Performance notes and implementation plans
out/          Generated static export (created by `npm run build`)
```

## Updating the content

Most portfolio content is data-driven. Edit the JSON files in `data/` to update copy and configuration without changing the React components:

- `data/content.json` — homepage, about, services, archive, and project content
- `data/case-studies.json` — detailed case study pages
- `data/navigation.json` — navigation and social links
- `data/site-metadata.json` — title, description, SEO metadata, and profile links
- `data/design-tokens.json` — colors and visual design tokens
- `data/features.json` — feature flags and optional experiences

Add project and case study media under `public/images/`. Keep references in the data files aligned with the corresponding asset paths.

## GitHub contribution data

The `prebuild` hook runs `scripts/fetch-contributions.mjs` automatically before every production build. It fetches the public contribution history for `akash1723tripathi` and writes the normalized result to `data/github-contributions.json`.

The fetch is intentionally tolerant: if GitHub or the contribution endpoint is unavailable, the build keeps the existing committed data or creates an empty fallback grid. Run `npm run contrib` when you want to refresh the data independently.

## Images and performance

The application uses an unoptimized Next.js image configuration because it is exported as static HTML. For large portfolio images, generate WebP versions before committing them:

```bash
node scripts/optimize-images.mjs
```

The script keeps the original PNG/JPEG files by default. Review the generated assets and references before using its optional deletion mode:

```bash
node scripts/optimize-images.mjs --delete
```

## Deployment

Run a production build:

```bash
npm run build
```

Deploy the generated `out/` directory to a static host such as Vercel, Netlify, GitHub Pages, Cloudflare Pages, or an object-storage website bucket. Configure the host to serve `index.html` for the root route and preserve the generated route directories for pages such as `/about`, `/work`, and `/work/<slug>`.

Before deploying, update `siteUrl` in `data/site-metadata.json` from the placeholder URL to the public domain. This value is used by metadata, canonical URLs, sitemap generation, and structured data.

## License

The source code and visual assets are personal portfolio material. Unless a separate license is included, do not reuse the content, branding, photography, or project artwork without permission.