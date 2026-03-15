---
id: S01
parent: M004
milestone: M004
provides:
  - Next.js 15 + fumadocs-mdx v11 + fumadocs-ui v15 app in apps/web
  - fumadocs content pipeline (source.config.ts → loader → MDX → rendered docs)
  - Quick Start docs page at /docs with sidebar, TOC, search, dark mode
  - Polished editorial landing page at / with hero, install command, before/after, features, CTAs
  - Complete OG/Twitter Card meta tags (19 tags) and dynamic OG image route
  - Live Vercel deployment at driftless-six.vercel.app serving both landing page and docs
  - Tailwind v4 with fumadocs-ui CSS preset
requires:
  - slice: none
affects:
  - S02 (docs content — consumes fumadocs pipeline, MDX conventions, deployed /docs URL)
  - S03 (launch playbook — consumes live Vercel URL for tweet copy)
key_files:
  - apps/web/app/(home)/page.tsx
  - apps/web/app/docs/[[...slug]]/page.tsx
  - apps/web/lib/source.ts
  - apps/web/source.config.ts
  - apps/web/app/layout.tsx
  - apps/web/app/globals.css
  - apps/web/components/copy-install.tsx
  - apps/web/app/opengraph-image.tsx
  - apps/web/app/api/search/route.ts
  - apps/web/content/docs/index.mdx
key_decisions:
  - "D057: Tailwind v4 CSS-first config for fumadocs — @import directives instead of JS config"
  - "D058: apps/web excluded from vp check/test/build — uses next build directly"
  - "D059: fumadocs-mdx Source.files compatibility bridge — lib/source.ts calls files() as function"
  - "D060: page data typed as any for body/toc — fumadocs types lose MDX properties"
  - "D061: Editorial dark-luxury aesthetic — Instrument Serif, amber accents, numbered features"
  - "D062: font-display Tailwind utility via --font-display CSS variable"
  - "D063: Vercel monorepo deploy — rootDirectory apps/web with pnpm install from root"
patterns_established:
  - "fumadocs route groups: app/(home) for landing, app/docs for docs"
  - "lib/layout.shared.tsx exports baseOptions() used by both HomeLayout and DocsLayout"
  - "Editorial section layout: numbered rows (01, 02, 03) instead of card grids"
  - "Code windows use minimal chrome — gray dots, no traffic-light colors"
  - "oxlint/oxfmt ignore Next.js generated files (next-env.d.ts, .source/, .next/)"
observability_surfaces:
  - "`cd apps/web && pnpm next build` — exits 0 with route table on success, actionable file-path error on failure"
  - "`curl -sI https://driftless-six.vercel.app/` — HTTP 200 confirms live"
  - "Browser DevTools: document.querySelectorAll('meta[property^=\"og:\"]') — 10 OG tags"
  - "Visit /opengraph-image route — returns 1200×630 dynamic PNG"
drill_down_paths:
  - .gsd/milestones/M004/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M004/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M004/slices/S01/tasks/T03-SUMMARY.md
duration: 1h30m
verification_result: passed
completed_at: 2026-03-14
---

# S01: Landing page + docs site deployed on Vercel

**Polished editorial landing page and fumadocs documentation scaffold live on Vercel, integrated into the Vite+ pnpm monorepo with zero test regressions.**

## What Happened

Three tasks, straightforward progression:

**T01 (scaffold)** — Expanded `pnpm-workspace.yaml` to include `apps/*`. Created `apps/web` with Next.js 15.5, fumadocs-core/mdx/ui, Tailwind v4, PostCSS. Main challenge was fumadocs version compatibility: fumadocs-mdx v11 returns `files` as a lazy function but fumadocs-core v15.8 expects an array (D059), and MDX page data types lose `body`/`toc` through the generic chain (D060). Both solved with pragmatic bridges. Configured oxlint/oxfmt to ignore Next.js generated files. Quick Start MDX page, search route handler, shared layout options all wired.

**T02 (landing page)** — Elevated the functional landing page from T01 into a distinctive editorial design per the frontend-design skill. Instrument Serif display font, amber/gold accents, left-aligned hero, numbered feature rows (not card grid), noise texture overlay, gradient-fade dividers. Fixed a disconnect where `font-display` Tailwind class wasn't wired to the `--font-instrument` CSS variable (D062). Added explicit OG image reference in metadata config. All 19 OG/Twitter Card meta tags verified present.

**T03 (deploy)** — Required three attempts: first from `apps/web` (Vercel used npm, couldn't resolve workspace deps), second from root (no framework detected), third with API-configured project settings (`rootDirectory: apps/web`, `framework: nextjs`, `installCommand: pnpm install`). Production deployment live at `driftless-six.vercel.app`.

## Verification

- ✅ `cd apps/web && pnpm next build` → exit 0, 8 routes (/, /docs, /opengraph-image, /twitter-image, /api/search, /_not-found, /docs/[[...slug]])
- ✅ `pnpm run test` → 268 tests pass across 14 files (zero regressions)
- ✅ `pnpm run check` → 72 files formatted, 46 files linted, zero errors
- ✅ Vercel URL `https://driftless-six.vercel.app/` → HTTP 200, landing page with hero, install command, before/after, features, footer
- ✅ Vercel URL `/docs` → Quick Start page with fumadocs sidebar, TOC, search bar, dark mode toggle
- ✅ Landing page → /docs links work (CTA button + footer link)
- ✅ Docs → GitHub link works (`https://github.com/driftless-ai/driftless`)
- ✅ OG meta tags: `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:site_name`, `og:locale`, `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image` — 19 total
- ✅ Broken MDX file → build fails with actionable error (file path + description)
- ✅ Responsive: mobile (375px), tablet (768px), desktop (1280px) verified

## Requirements Advanced

- R021 (Vercel landing/marketing page) — landing page live on Vercel with all required content
- R022 (Fumadocs documentation site) — scaffold and Quick Start page deployed; remaining 4 sections are S02 scope

## Requirements Validated

- R021 — polished landing page at `driftless-six.vercel.app` with hero, install command, before/after, feature highlights, /docs link, GitHub link, OG/Twitter Card meta tags. Design uses editorial aesthetic (not generic template).

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- fumadocs import paths differ from plan: used `@/.source` import (not `fumadocs-mdx:collections/server`), `fumadocs-ui/page` (not `fumadocs-ui/layouts/docs/page`), CSS `@import` (not `fumadocs-ui/style.css`). All due to fumadocs v11/v15 API changes vs. older documentation.
- Vercel deploy required 3 attempts with API-configured project settings (plan assumed single deploy step).

## Known Limitations

- OG image URLs reference `https://driftless.dev` (custom domain not configured) — images won't resolve from that origin until domain is mapped. The `/opengraph-image` route works on the Vercel URL itself.
- fumadocs-mdx/fumadocs-core version gap requires compatibility bridge (D059) — monitor for upstream fix.
- Page data `body`/`toc` types require `as any` cast (D060) — runtime behavior correct, types cosmetic.
- Only Quick Start docs page exists — remaining 4 sections (init walkthrough, GitHub Action setup, config reference, troubleshooting) are S02 scope.

## Follow-ups

- S02: Fill remaining docs sections using the fumadocs pipeline established here
- S03: Use `https://driftless-six.vercel.app` as the live URL in tweet copy
- Custom domain mapping (`driftless.dev` or similar) — not in M004 scope but would fix OG image URLs

## Files Created/Modified

- `pnpm-workspace.yaml` — expanded to include `apps/*`
- `package.json` (root) — added `pnpm.onlyBuiltDependencies` for esbuild/sharp
- `apps/web/package.json` — Next.js + fumadocs + Tailwind v4 dependencies
- `apps/web/tsconfig.json` — Next.js TypeScript config with `@/*` path alias
- `apps/web/next.config.mjs` — Next.js config with fumadocs-mdx `createMDX()`
- `apps/web/source.config.ts` — fumadocs content collection definition
- `apps/web/postcss.config.mjs` — PostCSS with `@tailwindcss/postcss`
- `apps/web/lib/source.ts` — fumadocs-core loader with compatibility bridge
- `apps/web/lib/layout.shared.tsx` — shared layout options (nav, GitHub link)
- `apps/web/app/layout.tsx` — root layout with RootProvider, full OG metadata
- `apps/web/app/globals.css` — Tailwind v4 + fumadocs-ui CSS, font variables, noise overlay, animations
- `apps/web/app/(home)/layout.tsx` — HomeLayout wrapper
- `apps/web/app/(home)/page.tsx` — editorial landing page with all sections
- `apps/web/app/docs/layout.tsx` — DocsLayout with page tree sidebar
- `apps/web/app/docs/[[...slug]]/page.tsx` — docs page with MDX rendering
- `apps/web/app/api/search/route.ts` — fumadocs search route handler
- `apps/web/app/opengraph-image.tsx` — dynamic 1200×630 OG image
- `apps/web/components/copy-install.tsx` — copy-to-clipboard install command component
- `apps/web/content/docs/index.mdx` — Quick Start docs page
- `apps/web/.gitignore` — ignores .next/ and .source/
- `.gitignore` — added .source/ pattern
- `.oxlintrc.json` — added ignore patterns for Next.js generated files
- `.oxfmtrc.json` — added ignore patterns for .next/ and .source/
- `.vercel/project.json` — Vercel project config (gitignored)

## Forward Intelligence

### What the next slice should know
- fumadocs MDX files go in `apps/web/content/docs/`. The loader auto-discovers them. Add new pages by creating `*.mdx` files — they appear in the sidebar automatically based on file structure.
- The `meta.json` file pattern controls sidebar ordering. See fumadocs docs for nested directory structure.
- Quick Start (`content/docs/index.mdx`) is the reference for frontmatter format and MDX conventions used in this project.
- Live URL is `https://driftless-six.vercel.app`. Redeploy via `source .env && npx vercel --prod --token "$VERCEL_TOKEN"` from repo root.

### What's fragile
- fumadocs compatibility bridge in `lib/source.ts` (D059) — if fumadocs-mdx or fumadocs-core updates, this may break or become unnecessary. Check `files` return type.
- OG image references `https://driftless.dev` which doesn't resolve — link previews on X/Twitter will show broken images until custom domain is configured or URLs are updated to `driftless-six.vercel.app`.

### Authoritative diagnostics
- `cd apps/web && pnpm next build` — the single source of truth for whether the docs pipeline works. Exits 0 = good, non-zero = actionable error with file path.
- `curl -sI https://driftless-six.vercel.app/` — HTTP 200 = deployment healthy.
- `pnpm run test` at monorepo root — 268 tests = no regressions from web app integration.

### What assumptions changed
- Plan assumed fumadocs v11/v15 imports matched official docs — actual API surface differs significantly (import paths, CSS setup, type chain). The task summaries document every deviation.
- Plan assumed single Vercel deploy step — required 3 attempts with API configuration to handle pnpm monorepo correctly.
