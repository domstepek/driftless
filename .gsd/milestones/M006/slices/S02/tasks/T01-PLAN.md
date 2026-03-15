---
estimated_steps: 5
estimated_files: 5
---

# T01: Rebuild landing page with brand system — tokens, fonts, layout, and all six sections

**Slice:** S02 — Landing Page Rebuild + Vercel Deploy
**Milestone:** M006

## Description

Replace the entire `(home)` route's visual identity. Rebuild `globals.css` with the full brand token system (colors, grayscale ramp, semantic aliases, spacing, layout variables). Swap the root layout's Instrument Serif font for three Google Fonts (Familjen Grotesk 900, Instrument Sans, JetBrains Mono) with CSS variables. Replace fumadocs `HomeLayout` with a custom wrapper scoped to the home route. Create a hydration-safe `LocalTime` client component. Then rebuild `page.tsx` from scratch with all six sections from the brand identity component catalog: nav, hero with ASCII mesa and annotation lines, how-it-works, what-it-generates, ticker marquee, and footer.

## Steps

1. **Rebuild `globals.css`** — Keep the three fumadocs imports (`tailwindcss`, `neutral.css`, `preset.css`) and the `@source` directive. Replace the `@theme inline` block with the full brand token set from the brand doc appendix (all `--color-*`, `--font-*`, `--space-*`, `--max-width`, `--nav-height`, `--annotation-width`, `--border-radius` variables). Remove old keyframes (`fade-up`, `fade-in`, `slide-in-right`) and old utility classes (`.bg-grid-pattern`, `.noise-overlay`, `.hr-fade`). Add ticker marquee `@keyframes marquee` (translateX(0) to translateX(-50%)) and reduced-motion media query to pause it.

2. **Update root `layout.tsx`** — Remove `Instrument_Serif` import, add `Familjen_Grotesk` (weight 900, variable `--font-display`, display `block`), `Instrument_Sans` (weights 400/500/600, variable `--font-body`, display `swap`), `JetBrains_Mono` (weights 400/500, variable `--font-mono`, display `swap`). Apply all three CSS variable classes to `<html>`. Keep `RootProvider`, `metadata`, `body` structure. Update metadata title/description if needed to match brand voice.

3. **Replace `(home)/layout.tsx`** — Remove `HomeLayout` and `baseOptions` imports. Render a plain `<div>` wrapper with `bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen` to scope the brand background to the home route only (avoids bleeding into fumadocs `/docs`). Keep it as a server component.

4. **Create `apps/web/components/local-time.tsx`** — `"use client"` component. `useState<string | null>(null)` for time, `useEffect` with 1-second `setInterval` calling `new Date().toLocaleTimeString('en-US', { hour12: false })`. Render `--:--:--` placeholder when state is null (SSR). Render time in `font-mono text-[var(--color-muted)]` when hydrated.

5. **Rebuild `(home)/page.tsx`** — Full replacement. All section components defined locally in the file (same pattern as existing page). Sections in order:
   - **Nav:** Fixed top, h-16, three-zone layout. Brand name left (mono, uppercase), CTA pill center (amber bg, links to GitHub or init command), LocalTime right with "DRIFTLESS REGION, WI" sublabel. Responsive: center CTA hides below `md`, time hides below `lg`.
   - **Hero:** Full viewport height minus nav. Headline in `font-display` uppercase, centered. Subline below. Mesa via `next/dynamic(() => import('@/components/ascii-mesa'), { ssr: false })` positioned behind text with z-0/z-10 layering. 3-5 annotation SVG lines + floating data cards (absolute positioned, `hidden lg:flex`). Data cards: STATUS/OPERATIONAL, TESTS/268 PASSING, FRAMEWORK/AGNOSTIC.
   - **How It Works:** Max-width container. H2 header + rule. Three numbered steps (01: Write Tests, 02: Push to GitHub, 03: Docs Update) with mono step numbers in amber, step title, step description. Vertical layout with dividers.
   - **What It Generates:** Max-width container. H2 header + rule. Two-column grid (`lg:grid-cols-2`). Cards for Training Docs and E2E Tests with mono amber labels, titles, descriptions, code snippet previews.
   - **Ticker:** Full-width dark strip (`bg-[var(--color-text)]`), white text. Duplicate content for seamless loop. CSS `animation: marquee 30s linear infinite`. Pauses on hover. `@media (prefers-reduced-motion: reduce)` stops animation.
   - **Footer:** Max-width container. Three columns (brand, nav links, version/copyright). Bottom rule + "BUILT IN THE DRIFTLESS REGION" tagline.

## Must-Haves

- [ ] `globals.css` has full brand token set in `@theme inline` — all colors, spacing, layout, and font variables from brand doc appendix
- [ ] fumadocs CSS imports preserved (`neutral.css`, `preset.css`)
- [ ] Root layout loads three Google Fonts with correct weights and CSS variable names
- [ ] `(home)/layout.tsx` no longer imports fumadocs `HomeLayout` — uses custom wrapper with brand background
- [ ] LocalTime component handles hydration safely (placeholder on SSR, live time on client)
- [ ] All six page sections present: nav, hero, how-it-works, what-it-generates, ticker, footer
- [ ] Mesa integrated via `next/dynamic` with `ssr: false`, z-layered behind headline
- [ ] Annotation lines + data cards hidden below `lg` breakpoint
- [ ] No scroll-triggered animations — no `animate-fade-up`, no `animate-fade-in`
- [ ] Ticker uses CSS-only animation with reduced-motion pause and duplicate content for seamless loop
- [ ] `cd apps/web && pnpm next build` exits 0
- [ ] `pnpm run test` passes 268

## Verification

- `cd apps/web && pnpm next build` — exits 0, no type errors
- `pnpm run test` — 268 tests pass
- Manual review: page.tsx contains all six sections with brand tokens, no references to old editorial styles

## Inputs

- `~/Desktop/driftless/brand-identity.md` — Section 7 (Component Catalog) for layout specs, Appendix for CSS variable block
- `apps/web/components/ascii-mesa.tsx` — S01 output, imported via next/dynamic
- `apps/web/app/globals.css` — current file to rebuild (keep fumadocs imports)
- `apps/web/app/layout.tsx` — current root layout to update (swap fonts)
- `apps/web/app/(home)/layout.tsx` — current home layout to replace
- `apps/web/app/(home)/page.tsx` — current page to fully replace

## Expected Output

- `apps/web/app/globals.css` — rebuilt with brand token system, ticker keyframes, no old editorial styles
- `apps/web/app/layout.tsx` — three Google Fonts loaded, Instrument Serif removed
- `apps/web/app/(home)/layout.tsx` — custom wrapper, no fumadocs HomeLayout
- `apps/web/components/local-time.tsx` — new hydration-safe client component
- `apps/web/app/(home)/page.tsx` — fully rebuilt landing page with all six sections
