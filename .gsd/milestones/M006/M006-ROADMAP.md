# M006: Brand Identity + Landing Page Revamp

**Vision:** Replace the M004 editorial-serif landing page with a brutalist-technical-white aesthetic modeled on sutera.ch — brand identity document, spinning ASCII mesa hero, and full page rebuild with geological amber accent, deployed live on Vercel.

## Success Criteria

- Brand identity document exists at `~/Desktop/driftless/brand-identity.md` with all design tokens (colors, type scale, spacing, fonts, animation spec, component catalog)
- ASCII mesa component renders in the browser — a slowly rotating geological formation made from box-drawing and density characters, with geological amber tint
- Landing page at `driftless-six.vercel.app` loads with the new brutalist-technical-white design: condensed grotesque headline, ASCII mesa hero, annotation lines, floating data cards, monospace label system
- `prefers-reduced-motion` pauses the ASCII animation; animation pauses when tab is hidden or mesa is off-screen
- `cd apps/web && pnpm next build` exits 0 with no type errors
- `pnpm run test` passes 268 (no regressions — all tests are in `packages/*`, none touch `apps/web`)
- fumadocs docs site at `/docs` is unchanged and functional

## Key Risks / Unknowns

- **ASCII mesa 3D projection math** — Adapting donut.c's torus parametric equations to a truncated-pyramid mesa geometry (flat top, sloped sides, strata layers) is novel. Per-frame character selection from a density ramp at 30fps on Canvas 2D `fillText` may stutter on integrated GPUs.
- **Canvas 2D `fillText` performance at scale** — Each frame renders ~2000-5000 characters. 30fps cap and tab-visibility pause help but need real testing.
- **Font loading and hero layout shift** — Familjen Grotesk 900 is a condensed variable font. `font-display: block` means invisible hero text until load. If the font isn't impactful enough at weight 900, the headline design needs adjustment.

## Proof Strategy

- ASCII mesa projection + performance → retire in S01 by building the real component with dev preview, testing rotation, character rendering, and frame budget on actual hardware
- Font visual impact → retire in S02 by rendering the actual hero headline in Familjen Grotesk 900 on the live page and verifying visually

## Verification Classes

- Contract verification: `next build` exits 0, `pnpm run test` passes 268, brand doc exists with all sections, mesa component renders without console errors
- Integration verification: Vercel deployment live at `driftless-six.vercel.app`, ASCII animation renders in browser, all page sections match design system
- Operational verification: `prefers-reduced-motion` pauses animation, animation pauses on tab hidden / off-screen via IntersectionObserver
- UAT / human verification: visual review of landing page against sutera.ch design reference — condensed type, annotation lines, floating cards, geological amber accent placement

## Milestone Definition of Done

This milestone is complete only when all are true:

- Brand identity doc at `~/Desktop/driftless/brand-identity.md` covers: color system, typography (3 fonts), type scale, spacing, animation spec, component catalog, reference analysis
- ASCII mesa component at `apps/web/components/ascii-mesa.tsx` renders a rotating mesa with character palette, amber tint, and motion/visibility pauses
- Landing page at `apps/web/app/(home)/page.tsx` is fully rebuilt with new brand system: custom nav, hero with mesa + annotation lines + data cards, how-it-works section, what-it-generates section, ticker, footer
- OG image updated to new brand visual
- `cd apps/web && pnpm next build` exits 0
- `pnpm run test` returns 268 passing tests
- Vercel deployment live and functional at `driftless-six.vercel.app`
- fumadocs `/docs` site unchanged and accessible
- Success criteria re-checked against live deployment

## Requirement Coverage

- Covers: none (no active requirements are in M006's scope)
- Re-validates: R021 (Vercel landing page — re-executed with new brand direction, already validated in M004)
- Leaves for later: R025 (Claude-first constraint — unrelated to M006)
- Orphan risks: none

## Slices

- [x] **S01: Brand Identity + ASCII Mesa Component** `risk:high` `depends:[]`
  > After this: brand identity document exists at ~/Desktop/driftless/brand-identity.md with all design tokens; ASCII mesa component renders in dev server (pnpm dev) with visible rotation, character palette, and geological amber tint; `next build` passes
- [x] **S02: Landing Page Rebuild + Vercel Deploy** `risk:medium` `depends:[S01]`
  > After this: visit driftless-six.vercel.app and see the complete brutalist-technical-white redesign — condensed grotesque headline, spinning ASCII mesa, annotation lines connecting to floating data cards, monospace label system, geological amber accent on CTA, ticker marquee, all sections styled as technical datasheets; fumadocs /docs unchanged

## Boundary Map

### S01 → S02

Produces:
- `~/Desktop/driftless/brand-identity.md` — complete brand specification with hex color codes, font family names, CSS variable names, type scale values, spacing scale, animation parameters, component visual descriptions
- `apps/web/components/ascii-mesa.tsx` — `"use client"` React component exporting `AsciiMesa` with Canvas 2D renderer, Y-axis rotation (0.4 RPM), X-axis wobble, character palette (`╭╮╰╯─│·○░▒▓`), `prefers-reduced-motion` pause, tab-visibility pause, IntersectionObserver pause, HiDPI canvas sizing
- Design token values ready for `globals.css` `@theme inline` block: `--color-bg: #FAFAF8`, `--color-text: #0A0A0A`, `--color-amber: #C4862A`, `--font-display`, `--font-body`, `--font-mono`, grayscale ramp, type scale, spacing scale

Consumes:
- nothing (first slice)

### S02 (final)

Produces:
- Live Vercel deployment at `driftless-six.vercel.app` with complete landing page + unchanged `/docs`
- Updated `apps/web/app/globals.css` with full brand design token system
- Updated `apps/web/app/layout.tsx` with 3 Google Fonts (Familjen Grotesk, Instrument Sans, JetBrains Mono)
- Rebuilt `apps/web/app/(home)/page.tsx` + custom layout replacing fumadocs `HomeLayout`
- Updated `apps/web/app/opengraph-image.tsx` with new brand visual

Consumes:
- Brand identity doc (design token values, component descriptions, reference analysis)
- `AsciiMesa` component (dynamically imported with `next/dynamic` `{ ssr: false }`)
- CSS variable names and values from S01's design token output
