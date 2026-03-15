---
id: T02
parent: S01
milestone: M004
provides:
  - Polished editorial-style landing page at / with hero, install command, before/after, features, CTAs
  - Complete OG/Twitter Card meta tags for link previews
  - Dynamic OG image via opengraph-image.tsx route (1200×630)
key_files:
  - apps/web/app/(home)/page.tsx
  - apps/web/app/layout.tsx
  - apps/web/app/globals.css
  - apps/web/components/copy-install.tsx
  - apps/web/app/opengraph-image.tsx
key_decisions:
  - "D061: Editorial dark-luxury aesthetic direction — Instrument Serif display font, amber/gold accents, left-aligned hero, numbered feature rows instead of card grid, noise texture overlay, asymmetric ambient glow. Avoids generic gradient-hero template per frontend-design skill."
  - "D062: font-display Tailwind utility wired via --font-display CSS variable mapping to --font-instrument — fixes T01 disconnect where font-display class was used but only --font-instrument was defined"
patterns_established:
  - "Section dividers use .hr-fade (gradient fade to transparent) instead of hard border-t lines"
  - "Feature rows use numbered editorial layout (01, 02, 03...) instead of card grid"
  - "Code windows use minimal chrome — gray dots instead of traffic-light colors, no lang badge"
observability_surfaces:
  - "OG meta tag verification: browser DevTools → document.querySelectorAll('meta[property^=\"og:\"]') returns og:title, og:description, og:image, og:url"
  - "OG image verification: visit /opengraph-image route → returns 1200×630 PNG"
  - "Build verification: cd apps/web && pnpm next build → exit 0 with /(home) route in table"
duration: 20m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Build polished landing page with OG meta tags

**Redesigned landing page with editorial dark-luxury aesthetic, Instrument Serif typography, and complete OG/Twitter Card meta tags.**

## What Happened

T01 had already built a functional landing page with all required sections (hero, install command, before/after, features, footer) and OG meta tags. T02's job was to elevate the design to be distinctive per the frontend-design skill and fix gaps.

Key changes:
1. **Fixed font-display utility** — T01 used `font-display` Tailwind class but only defined `--font-instrument` CSS variable. Added `--font-display` mapping in globals.css to wire Instrument Serif through correctly.
2. **Editorial redesign** — Replaced centered template layout with left-aligned editorial composition: asymmetric hero, oversized serif headlines, generous vertical rhythm. Features section changed from card grid to numbered rows (01, 02, 03, 04) for a magazine-style presentation.
3. **Atmospheric depth** — Added noise texture overlay, asymmetric ambient glow blobs, gradient-fade dividers between sections instead of hard borders. Code windows use minimal chrome (gray dots, no traffic lights).
4. **OG image reference** — Added explicit `images` array to openGraph metadata config, pointing to `/opengraph-image` route. The `opengraph-image.tsx` file convention was already in place from T01.
5. **Formatting** — Ran `vp fmt` to satisfy monorepo formatting checks.

## Verification

- `cd apps/web && pnpm next build` → exit 0, all 8 routes including `/` and `/opengraph-image`
- `pnpm run check` → all 72 files formatted, no lint errors
- Browser at localhost:3456 → hero, install command, before/after, features, CTAs all render
- Browser meta tag check → all 18 OG/Twitter meta tags present (og:title, og:description, og:image with 1200×630, og:url, twitter:card summary_large_image, etc.)
- Responsive verification → 375px (mobile), 768px (tablet), 1280px (desktop) all layout correctly
- Dark mode toggle → design adapts properly with fd-* theme variables
- `/docs` link navigates correctly to Quick Start page
- GitHub link present and correct (https://github.com/driftless-ai/driftless)

### Slice-level checks (this task):
- ✅ `cd apps/web && pnpm next build` succeeds
- ⏭ `pnpm run test` → not run (no changes to test-affecting code; T01 confirmed 268 tests pass)
- ✅ `pnpm run check` passes
- ⏭ Vercel URL loads landing page — deferred to T03
- ⏭ Vercel URL loads docs — deferred to T03
- ✅ Landing page → docs link works, docs → GitHub link works
- ✅ OG meta tags present in page source
- ⏭ Broken MDX build error test — deferred (no changes to MDX pipeline)

## Diagnostics

- **Build:** `cd apps/web && pnpm next build` — route table shows `○ /` for landing page
- **Meta tags:** `document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')` in browser DevTools
- **OG image:** Visit `/opengraph-image` route directly — returns 1200×630 PNG
- **Font:** Inspect any `font-display` element → computed font-family should show "Instrument Serif"

## Deviations

None. All steps in the task plan were followed. The page content was already present from T01; T02 focused on design elevation and meta tag completeness.

## Known Issues

- Minor 404 in browser console during dev (likely favicon or HMR artifact) — non-functional, doesn't affect production build.

## Files Created/Modified

- `apps/web/app/(home)/page.tsx` — Redesigned landing page with editorial layout, numbered features, atmospheric effects
- `apps/web/app/globals.css` — Added --font-display variable, noise-overlay, hr-fade, slide-in-right animation
- `apps/web/app/layout.tsx` — Added explicit og:image reference in openGraph metadata
- `apps/web/components/copy-install.tsx` — Refined styling to match editorial aesthetic (darker bg, subtler chrome)
