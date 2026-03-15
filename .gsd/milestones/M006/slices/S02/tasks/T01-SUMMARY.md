---
id: T01
parent: S02
milestone: M006
provides:
  - Full brand token system in globals.css (colors, spacing, layout, typography variables)
  - Three Google Fonts loaded via next/font/google with CSS variable binding
  - Custom home route layout replacing fumadocs HomeLayout
  - Hydration-safe LocalTime client component
  - Complete landing page with all six brand sections (nav, hero, how-it-works, what-it-generates, ticker, footer)
  - Client wrapper for ASCII mesa dynamic import (Next.js 15 SSR constraint)
key_files:
  - apps/web/app/globals.css
  - apps/web/app/layout.tsx
  - apps/web/app/(home)/layout.tsx
  - apps/web/app/(home)/page.tsx
  - apps/web/components/local-time.tsx
  - apps/web/components/mesa-canvas.tsx
key_decisions:
  - Familjen Grotesk weight 700 (not 900) — Google Fonts max available weight; visually close
  - Client wrapper component for mesa dynamic import — Next.js 15 forbids `ssr: false` in Server Components
  - CSS class hover for CTA pill — event handlers not allowed in Server Components, CSS hover is cleaner
patterns_established:
  - Brand design tokens consumed via CSS custom properties and inline style prop (not Tailwind arbitrary values for complex tokens)
  - Section components defined locally in page.tsx (same pattern as original page)
  - Client wrapper pattern for next/dynamic with ssr:false in App Router
observability_surfaces:
  - CSS tokens inspectable via getComputedStyle(document.documentElement).getPropertyValue('--color-amber')
  - Font loading verified via document.fonts.check('700 16px Familjen Grotesk')
  - Mesa frame budget warning: console.warn('Mesa frame budget exceeded:') from S01
  - Build-time type checking via next build
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Rebuild landing page with brand system — tokens, fonts, layout, and all six sections

**Replaced the entire (home) route visual identity with the brutalist-technical-white brand system — full token set, three fonts, six sections, spinning ASCII mesa.**

## What Happened

Rebuilt `globals.css` with the complete brand token set from the brand identity appendix: all color tokens (primary palette, grayscale ramp, semantic aliases), spacing scale (4px grid, 13 values), layout constants, and typography variables. Removed old editorial keyframes (fade-up, fade-in, slide-in-right) and utility classes (bg-grid-pattern, noise-overlay, hr-fade). Added ticker marquee keyframe and reduced-motion media query.

Updated root `layout.tsx` — removed Instrument Serif, added Familjen Grotesk (weight 700, `--font-display`), Instrument Sans (weights 400/500/600, `--font-body`), and JetBrains Mono (weights 400/500, `--font-mono`). Applied all three CSS variable classes to `<html>`. Updated metadata title/description to match brand voice.

Replaced `(home)/layout.tsx` with a plain `<div>` wrapper scoped to brand background — no fumadocs imports.

Created `LocalTime` client component with `useState<string | null>` for hydration safety — renders `--:--:--` on SSR, live HH:MM:SS on client via 1-second interval.

Created `mesa-canvas.tsx` client wrapper for `next/dynamic(() => import('@/components/ascii-mesa'), { ssr: false })` — Next.js 15 forbids `ssr: false` in Server Components, so the dynamic import lives in a dedicated client component.

Rebuilt `page.tsx` from scratch with all six sections: fixed nav with brand name / CTA pill / LocalTime, full-viewport hero with mesa behind headline and annotation data cards, how-it-works with three numbered steps, what-it-generates two-column card grid, ticker marquee with CSS-only animation, and footer with three columns and tagline. No scroll-triggered animations. Annotation cards hidden below `lg`.

## Verification

- `cd apps/web && pnpm next build` — exits 0, compiled in ~3.4s, all 13 pages generated
- `pnpm run test` — 268 tests pass (14 test files, all green)
- Manual review: page.tsx contains all six sections, uses brand tokens exclusively, no references to old editorial styles (no animate-fade-up, no fd- classes, no noise-overlay)
- Slice-level checks partial pass:
  - ✅ `next build` exits 0
  - ✅ `pnpm run test` passes 268
  - ⬜ Browser: Vercel deployment (T02 — not yet deployed)
  - ⬜ Browser: fumadocs /docs on Vercel (T02)
  - ⬜ Browser: OG meta tags (T02)

## Diagnostics

- CSS tokens: `getComputedStyle(document.documentElement).getPropertyValue('--color-amber')` → `#C4862A`
- Font loading: Network tab shows three Google Font requests; fallback rendering visible if fonts fail
- Mesa: Canvas element present in hero section, `console.warn('Mesa frame budget exceeded:')` if frames exceed 33ms
- Build errors: `next build` catches type errors and import failures at build time

## Deviations

- **Familjen Grotesk weight 700 instead of 900:** Brand doc and D084 specify weight 900, but Google Fonts only offers Familjen Grotesk in weights 400–700. Used 700 (heaviest available). Visually close — the condensed letterforms at 700 still produce the desired dense typographic blocks.
- **Client wrapper component for mesa:** Task plan specified `next/dynamic` with `ssr: false` directly in page.tsx. Next.js 15 App Router forbids this in Server Components. Created `mesa-canvas.tsx` as a `"use client"` wrapper that encapsulates the dynamic import.
- **CSS hover for CTA pill instead of JS event handlers:** Nav CTA pill originally used `onMouseEnter`/`onMouseLeave` for hover color change, but these are event handlers prohibited in Server Components. Used CSS class `.cta-pill:hover` in globals.css instead.

## Known Issues

- Familjen Grotesk 700 may not have the same visual density as the 900 weight specified in the brand doc. If the display font needs more weight, consider switching to a variable font with wider weight range or a different condensed grotesque.

## Files Created/Modified

- `apps/web/app/globals.css` — rebuilt with full brand token system, ticker keyframes, CTA hover class
- `apps/web/app/layout.tsx` — three Google Fonts replacing Instrument Serif, updated metadata
- `apps/web/app/(home)/layout.tsx` — custom wrapper replacing fumadocs HomeLayout
- `apps/web/app/(home)/page.tsx` — fully rebuilt with all six brand sections
- `apps/web/components/local-time.tsx` — new hydration-safe client component
- `apps/web/components/mesa-canvas.tsx` — new client wrapper for mesa dynamic import
- `.gsd/milestones/M006/slices/S02/tasks/T01-PLAN.md` — added Observability Impact section (pre-flight fix)
