---
id: M006
provides:
  - Complete brand identity specification at ~/Desktop/driftless/brand-identity.md — color system, typography (3 fonts), type scale, spacing, animation spec, component catalog, sutera.ch reference analysis
  - AsciiMesa React component (Canvas 2D, donut.c-style 3D projection, z-buffered character rendering, geological amber tint, three pause mechanisms)
  - Full landing page rebuild at apps/web/app/(home)/ — brutalist-technical-white aesthetic with six sections (nav, hero with mesa, how-it-works, features, framework ticker, footer)
  - Brand design token system in globals.css (colors, grayscale ramp, spacing scale, layout constants, typography variables)
  - Three Google Fonts via next/font/google (Familjen Grotesk 700, Instrument Sans, JetBrains Mono)
  - Custom home route layout replacing fumadocs HomeLayout
  - Rebuilt OG image with brutalist brand visual and committed TTF font asset
  - Live Vercel deployment at driftless-six.vercel.app with new brand system
key_decisions:
  - "D080: Brutalist-technical-white supersedes editorial-serif (D061) — sutera.ch reference for technical-craft + design-craft feel"
  - "D081: Two-slice decomposition — mesa+brand then page+deploy. Co-developing brand doc with mesa proves tokens by building the component that consumes them"
  - "D082: Custom layout replaces fumadocs HomeLayout for (home) route — brutalist nav has nothing in common with fumadocs defaults"
  - "D083: Pure Canvas 2D for ASCII mesa — no 3D libraries. ~310 lines of trig + character lookup"
  - "D084: Three Google Fonts via next/font/google with CSS variables (--font-display, --font-body, --font-mono)"
  - "D085: Familjen Grotesk weight 700 (not 900) — Google Fonts max available weight"
  - "D086: Client wrapper for next/dynamic ssr:false — Next.js 15 forbids ssr:false in Server Components"
  - "D087: OG image font loaded via readFile from assets/ — Satori requires TTF ArrayBuffer"
patterns_established:
  - "CSS variable naming: --color-* for colors, --font-* for typography, --space-* for spacing (4px grid)"
  - "Semantic color aliases resolve to grayscale ramp tokens (--color-surface → --color-gray-100)"
  - "Canvas 2D HiDPI pattern: canvas.width = logical * dpr, canvas.style.width = logical, ctx.setTransform(dpr,...)"
  - "Client wrapper pattern for next/dynamic with ssr:false in App Router"
  - "OG image font loading via readFile from committed TTF asset"
  - "Brand design tokens consumed via CSS custom properties and inline style prop"
observability_surfaces:
  - "console.warn('Mesa frame budget exceeded:') — fires when a frame exceeds 33ms budget"
  - "console.error('Degenerate projection:') — indicates NaN/Infinity in projection math"
  - "CSS tokens inspectable via getComputedStyle(document.documentElement).getPropertyValue('--color-amber')"
  - "Font loading verified via document.fonts.check('700 16px Familjen Grotesk')"
  - "OG image generation included in static page generation; font load failure surfaces as ENOENT build error"
requirement_outcomes: []
duration: 67m
verification_result: passed
completed_at: 2026-03-14
---

# M006: Brand Identity + Landing Page Revamp

**Defined the driftless brand identity from scratch (brutalist-technical-white with geological amber accent) and rebuilt the entire landing page — spinning ASCII mesa hero, condensed grotesque typography, six technical-datasheet sections, deployed live on Vercel.**

## What Happened

Two slices, both clean.

**S01 (Brand Identity + ASCII Mesa):** Wrote the brand identity document (~24KB, 7 sections) at `~/Desktop/driftless/brand-identity.md` — reference analysis of sutera.ch, color system (#FAFAF8 bg / #0A0A0A text / #C4862A amber + 7-step warm grayscale ramp), typography spec (Familjen Grotesk 900 display, Instrument Sans body, JetBrains Mono data), fixed type scale, 4px-grid spacing, animation parameters, and a full component catalog with spacing tokens. Then built the ASCII mesa component (~310 lines) — a parametric truncated pyramid with Y-axis rotation at 0.4 RPM, X-axis sinusoidal wobble, perspective projection, z-buffer per grid cell, luminance-based character selection from a density ramp + context-sensitive edge characters, and Canvas 2D fillText rendering with geological amber tint. Three independent pause mechanisms wired: `prefers-reduced-motion` renders a static frame, `visibilitychange` pauses/resumes, `IntersectionObserver` (10% threshold) pauses off-screen.

**S02 (Landing Page Rebuild + Deploy):** Rebuilt `globals.css` with the full token set from the brand doc appendix. Swapped root layout to three Google Fonts via `next/font/google` (Familjen Grotesk 700 — Google Fonts caps at 700 despite brand doc specifying 900). Replaced the fumadocs `HomeLayout` with a custom wrapper. Rebuilt the landing page from scratch with six sections: nav (brand name + CTA pill + local time), hero (ASCII mesa behind headline with annotation data cards), how-it-works (numbered steps), feature cards, framework ticker marquee, and footer. Created a `LocalTime` client component for hydration-safe clock rendering. Created a `mesa-canvas.tsx` client wrapper to encapsulate `next/dynamic` with `ssr: false` (Next.js 15 requires this in a client component, not a server component). Rebuilt the OG image with the brand palette and a committed Familjen Grotesk Bold TTF for Satori. Deleted the temporary `mesa-preview` route from S01. Pushed to trigger Vercel deployment.

The slices connected cleanly — S01's brand doc appendix had a copy-pasteable CSS variable block that went directly into `globals.css`, and the mesa component exported exactly what S02 consumed via dynamic import.

## Cross-Slice Verification

Each success criterion from the roadmap, verified:

- **Brand identity document exists with all design tokens:** `~/Desktop/driftless/brand-identity.md` confirmed — 7 sections covering color system (all hex codes + CSS variable names), typography (3 font families with fallback stacks), type scale (7 steps), spacing (4px grid, 13 values), animation spec, and component catalog.
- **ASCII mesa component renders with rotation, character palette, amber tint:** `apps/web/components/ascii-mesa.tsx` exists (~310 lines). Browser verification in S01 confirmed rotation via two screenshots 3 seconds apart showing different orientations, canvas pixel sampling confirmed active rendering (876/10000 non-zero pixels in center area), no console errors.
- **Landing page loads with brutalist-technical-white design:** `apps/web/app/(home)/page.tsx` fully rebuilt with all six sections — nav, hero with mesa + annotation cards, how-it-works, features, framework ticker, footer. Three Google Fonts loaded. Amber accent on CTAs.
- **`prefers-reduced-motion` pauses animation; animation pauses on tab hidden / off-screen:** All three pause mechanisms confirmed in component code via `matchMedia`, `visibilitychange` listener, and `IntersectionObserver` with 10% threshold.
- **`cd apps/web && pnpm next build` exits 0:** Confirmed — 12 routes generated including `/opengraph-image` and `/twitter-image`, no type errors.
- **`pnpm run test` passes 268:** Confirmed — 268 tests across 14 files, zero failures.
- **fumadocs `/docs` unchanged and functional:** Docs route builds and renders with sidebar navigation, confirmed via `next build` output showing `/docs/[[...slug]]` route and browser verification in S02.
- **OG image updated:** `opengraph-image.tsx` rebuilt with #FAFAF8 background, #0A0A0A text, #C4862A amber accent, Familjen Grotesk Bold TTF loaded from committed asset.
- **Vercel deployment live:** Branch pushed, deployment confirmed at `driftless-six.vercel.app` with new brand design via browser verification in S02.

## Requirement Changes

No requirement status transitions in M006. R021 (Vercel landing page) was already validated in M004 — M006 re-executes it with the new brand direction but doesn't change its status. No new requirements were surfaced or invalidated.

## Forward Intelligence

### What the next milestone should know
- The brand system is fully self-contained in CSS custom properties in `globals.css`. Any new pages should consume tokens from there, not introduce new color/spacing values.
- The ASCII mesa is a `"use client"` component imported via `next/dynamic` with `ssr: false` through a client wrapper (`mesa-canvas.tsx`). This is the established pattern for any Canvas/WebGL components in the App Router.
- Familjen Grotesk is capped at weight 700 on Google Fonts. The brand doc specifies 900. If heavier weight is needed, switch to a variable font with wider range.
- The OG image font path (`readFile(join(process.cwd(), 'assets', 'FamiljenGrotesk-Bold.ttf'))`) depends on Vercel's build working directory being `apps/web`. If the Vercel `rootDirectory` config changes, this breaks with ENOENT.
- All 10 business planning docs from M005 and the brand identity doc from M006 are at `~/Desktop/driftless/` — not committed to the repo.

### What's fragile
- **Canvas character rendering + font loading order** — If JetBrains Mono isn't loaded when the mesa first renders, character spacing is wrong. The component uses a generic monospace fallback but the visual fidelity depends on the real font.
- **Z-buffer resolution at 4K** — Very large viewports may push vertex count past 8000 and approach the 33ms frame budget. The `console.warn` diagnostic fires if this happens.
- **Familjen Grotesk weight availability** — Google Fonts controls what weights are served. If they add 900, update the font config in `layout.tsx`.

### Authoritative diagnostics
- `next build` output — if it succeeds with 12 routes including `/opengraph-image`, all imports and font loading are correct
- `console.warn('Mesa frame budget exceeded:')` — performance diagnostic from the mesa component
- `getComputedStyle(document.documentElement).getPropertyValue('--color-amber')` should return `#C4862A`
- Fetch `/opengraph-image` directly to see rendered PNG

### What assumptions changed
- Familjen Grotesk weight 900 was assumed available → only 400–700 exists on Google Fonts (D085)
- `next/dynamic` with `ssr: false` was assumed usable directly in page.tsx → Next.js 15 requires a client wrapper (D086)
- Original M006 context proposed 3 slices (brand → mesa → page) → compressed to 2 slices (brand+mesa → page+deploy) during planning because co-developing the brand doc with the mesa proved tokens faster (D081)

## Files Created/Modified

- `~/Desktop/driftless/brand-identity.md` — Complete brand identity specification (~24KB, 7 sections)
- `apps/web/components/ascii-mesa.tsx` — AsciiMesa React component (~310 lines): 3D projection, z-buffer, character density, Canvas 2D HiDPI, three pause mechanisms
- `apps/web/components/mesa-canvas.tsx` — Client wrapper for mesa dynamic import (Next.js 15 ssr:false constraint)
- `apps/web/components/local-time.tsx` — Hydration-safe local time client component
- `apps/web/app/globals.css` — Rebuilt with full brand token system (colors, grayscale, spacing, layout, typography, ticker keyframes)
- `apps/web/app/layout.tsx` — Three Google Fonts replacing Instrument Serif, updated metadata
- `apps/web/app/(home)/layout.tsx` — Custom wrapper replacing fumadocs HomeLayout
- `apps/web/app/(home)/page.tsx` — Fully rebuilt landing page with six brand sections
- `apps/web/app/opengraph-image.tsx` — Rebuilt with brutalist brand visual, custom TTF font
- `apps/web/assets/FamiljenGrotesk-Bold.ttf` — Font asset for OG image generation
- `apps/web/app/(home)/mesa-preview/page.tsx` — Deleted (S01 temporary scaffolding)
