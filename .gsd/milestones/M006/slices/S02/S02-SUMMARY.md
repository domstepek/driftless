---
id: S02
parent: M006
milestone: M006
provides:
  - Full brand design token system in globals.css (colors, grayscale ramp, spacing scale, layout constants, typography variables)
  - Three Google Fonts loaded via next/font/google (Familjen Grotesk 700, Instrument Sans, JetBrains Mono) with CSS variable binding
  - Custom home route layout replacing fumadocs HomeLayout
  - Hydration-safe LocalTime client component
  - Complete landing page with six brand sections (nav, hero with mesa, how-it-works, what-it-generates/features, works-with ticker, footer)
  - Client wrapper component for ASCII mesa dynamic import (Next.js 15 SSR constraint)
  - Brutalist OG image with Familjen Grotesk TTF loaded as ArrayBuffer for Satori
  - Font asset at apps/web/assets/FamiljenGrotesk-Bold.ttf
  - mesa-preview temporary route removed
  - Live Vercel deployment at driftless-six.vercel.app with new brand system
requires:
  - slice: S01
    provides: Brand identity document (design tokens, component catalog), AsciiMesa component, CSS variable names and values
affects: []
key_files:
  - apps/web/app/globals.css
  - apps/web/app/layout.tsx
  - apps/web/app/(home)/layout.tsx
  - apps/web/app/(home)/page.tsx
  - apps/web/components/local-time.tsx
  - apps/web/components/mesa-canvas.tsx
  - apps/web/app/opengraph-image.tsx
  - apps/web/assets/FamiljenGrotesk-Bold.ttf
key_decisions:
  - "D085: Familjen Grotesk weight 700 (not 900) — Google Fonts max available weight"
  - "D086: Client wrapper for next/dynamic ssr:false — Next.js 15 forbids ssr:false in Server Components"
  - "D087: OG image font loaded via readFile from assets/ — Satori requires TTF ArrayBuffer"
patterns_established:
  - Brand design tokens consumed via CSS custom properties and inline style prop
  - Client wrapper pattern for next/dynamic with ssr:false in App Router
  - OG image font loading via readFile from committed TTF asset
observability_surfaces:
  - CSS tokens inspectable via getComputedStyle(document.documentElement).getPropertyValue('--color-amber')
  - Font loading verified via document.fonts.check('700 16px Familjen Grotesk')
  - Mesa frame budget warning: console.warn('Mesa frame budget exceeded:') from S01
  - Build-time type checking catches import/type errors
  - OG image generation included in static page generation; font load failure surfaces as ENOENT build error
drill_down_paths:
  - .gsd/milestones/M006/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M006/slices/S02/tasks/T02-SUMMARY.md
duration: 27m
verification_result: passed
completed_at: 2026-03-14
---

# S02: Landing Page Rebuild + Vercel Deploy

**Replaced the editorial landing page with the brutalist-technical-white brand system — full token set, three fonts, six sections, spinning ASCII mesa, rebuilt OG image, deployed live on Vercel.**

## What Happened

Rebuilt the entire `(home)` route with the brand system established in S01. `globals.css` was rewritten with the complete token set from the brand identity appendix — all color tokens (primary palette, grayscale ramp, semantic aliases), spacing scale (4px grid, 13 values), layout constants, and typography variables. Old editorial keyframes and utility classes removed; ticker marquee keyframe and reduced-motion query added.

Root `layout.tsx` swapped Instrument Serif for three Google Fonts via `next/font/google`: Familjen Grotesk (700, `--font-display`), Instrument Sans (400/500/600, `--font-body`), JetBrains Mono (400/500, `--font-mono`). The `(home)/layout.tsx` was replaced with a plain wrapper scoped to brand background — no fumadocs imports.

The landing page was rebuilt from scratch with six sections: nav with brand name, hero with ASCII mesa behind headline and annotation data cards, how-it-works with numbered steps, feature cards, framework ticker, and footer. A `LocalTime` client component handles hydration safely (null state → live clock). A `mesa-canvas.tsx` client wrapper encapsulates the `next/dynamic` import with `ssr: false` — required because Next.js 15 forbids this in Server Components.

The OG image was rebuilt with the brutalist brand: white `#FAFAF8` background, dark `#0A0A0A` text, amber `#C4862A` accent. Familjen Grotesk Bold TTF was downloaded from Google Fonts gstatic and committed to `apps/web/assets/` for Satori's ArrayBuffer requirement. The temporary `mesa-preview` route from S01 was deleted.

Branch pushed to trigger Vercel deployment.

## Verification

- `cd apps/web && pnpm next build` — exits 0, 12 routes generated including `/opengraph-image` and `/twitter-image`
- `pnpm run test` — 268 tests pass across 14 files (no regressions)
- Browser: `driftless-six.vercel.app` loads with new brand design — condensed headline, amber accents, features section, framework ticker, footer
- Browser: `driftless-six.vercel.app/docs` — fumadocs renders correctly with sidebar navigation, "On this page" ToC, code blocks
- Browser: OG meta tags present — `og:image` → `/opengraph-image`, `twitter:image` → `/twitter-image`

## Requirements Advanced

- R021 — Landing page re-executed with new brutalist-technical-white brand direction, replacing M004 editorial design

## Requirements Validated

- none (R021 was already validated in M004; this is a re-execution with new design, not new validation)

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- **Familjen Grotesk weight 700 instead of 900:** Brand doc specifies 900 but Google Fonts only serves up to 700. Used heaviest available weight. Condensed letterforms still produce dense typographic blocks.
- **Client wrapper for mesa dynamic import:** Plan specified `next/dynamic` with `ssr: false` directly in page.tsx. Next.js 15 App Router forbids this in Server Components. Created dedicated `mesa-canvas.tsx` client component.
- **CSS hover for CTA pill:** Nav CTA used `onMouseEnter`/`onMouseLeave` originally, but event handlers aren't allowed in Server Components. Used CSS `.cta-pill:hover` class instead.
- **Satori `display: flex` constraint:** OG image required restructuring mixed text+span children into explicit flex containers for Satori compatibility.

## Known Limitations

- Familjen Grotesk 700 may lack the visual density intended by the brand doc's 900 weight spec. If more weight is needed, consider switching to a variable font with wider weight range.
- OG image references `driftless.dev` domain (custom domain not yet mapped); images work on the Vercel URL directly.

## Follow-ups

- none — this is the final slice of M006

## Files Created/Modified

- `apps/web/app/globals.css` — rebuilt with full brand token system, ticker keyframes, CTA hover class
- `apps/web/app/layout.tsx` — three Google Fonts replacing Instrument Serif, updated metadata
- `apps/web/app/(home)/layout.tsx` — custom wrapper replacing fumadocs HomeLayout
- `apps/web/app/(home)/page.tsx` — fully rebuilt with all six brand sections
- `apps/web/components/local-time.tsx` — new hydration-safe client component
- `apps/web/components/mesa-canvas.tsx` — new client wrapper for mesa dynamic import
- `apps/web/app/opengraph-image.tsx` — rebuilt with brutalist brand, custom font
- `apps/web/assets/FamiljenGrotesk-Bold.ttf` — font asset for OG image generation
- `apps/web/app/(home)/mesa-preview/page.tsx` — deleted (S01 temporary scaffolding)

## Forward Intelligence

### What the next slice should know
- This is the final slice of M006. No downstream slices exist.
- The landing page brand system is fully self-contained in CSS custom properties — any future page additions should consume tokens from `globals.css`, not introduce new color/spacing values.

### What's fragile
- Familjen Grotesk weight availability — Google Fonts controls what weights are served. If they add 900, the font config in `layout.tsx` should be updated.
- OG image font path — `readFile(join(process.cwd(), 'assets', 'FamiljenGrotesk-Bold.ttf'))` depends on the Vercel build working directory being `apps/web`. If the Vercel root directory config changes, this path breaks with ENOENT.

### Authoritative diagnostics
- `next build` output — if it succeeds with 12 routes including `/opengraph-image`, the font loading and all imports are correct
- Browser DevTools: `getComputedStyle(document.documentElement).getPropertyValue('--color-amber')` should return `#C4862A`
- OG image: fetch `/opengraph-image` directly to see rendered PNG

### What assumptions changed
- Familjen Grotesk weight 900 was assumed available → only 400–700 exists on Google Fonts (D085)
- `next/dynamic` with `ssr: false` was assumed usable in Server Components → Next.js 15 requires a client wrapper (D086)
