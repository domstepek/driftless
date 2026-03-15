---
id: S01
parent: M006
milestone: M006
provides:
  - Complete brand identity specification at ~/Desktop/driftless/brand-identity.md with all design tokens, color system, typography, spacing, animation spec, and component catalog
  - AsciiMesa React component at apps/web/components/ascii-mesa.tsx with Canvas 2D 3D projection, z-buffered character rendering, geological amber tint, and three pause mechanisms
  - Temporary dev preview route at apps/web/app/(home)/mesa-preview/page.tsx
  - Design token values (CSS variable names and hex codes) ready for S02 globals.css integration
requires: []
affects:
  - S02
key_files:
  - ~/Desktop/driftless/brand-identity.md
  - apps/web/components/ascii-mesa.tsx
  - apps/web/app/(home)/mesa-preview/page.tsx
key_decisions:
  - "7-step grayscale ramp (100–700) with warm-shifted hex values (#F5F5F3 → #2A2A24) to complement the warm amber accent"
  - "Fixed type scale (no fluid clamp) — brutalist aesthetic demands precision, not responsiveness"
  - "h1–h2 use --font-display (Familjen Grotesk 900), h3–h6 use --font-body weight 600 — clean hierarchy break"
  - "Amber (#C4862A) passes WCAG AA for large text only (4.6:1) — usage restricted to ≥18px, buttons, and decorative elements"
  - "Character density palette ordered by visual weight with edge characters (─│╭╮╰╯) context-sensitive based on surface normals"
  - "Mesa geometry as parametric truncated pyramid sampled at variable density (12-30 points per axis based on canvas size)"
  - "Z-buffer per grid cell with character+alpha storage — avoids overdraw, supports stratum opacity differentiation"
  - "Three independent pause mechanisms (reduced-motion, visibility, intersection) combined with logical OR via refs"
  - "Preview page required 'use client' directive — Next 15 server components reject ssr:false on next/dynamic"
patterns_established:
  - "CSS variable naming: --color-* for colors, --font-* for typography, --space-* for spacing (4px grid)"
  - "Semantic color aliases resolve to grayscale ramp tokens (--color-surface → --color-gray-100)"
  - "Component catalog uses spacing tokens exclusively — no hard-coded px values in component descriptions"
  - "Canvas 2D HiDPI pattern: canvas.width = logical * dpr, canvas.style.width = logical, ctx.setTransform(dpr,...)"
  - "useCallback for render function + useEffect for lifecycle — prevents stale closure over vertices/dimensions"
  - "ResizeObserver on container for responsive canvas sizing (re-renders static frame if reduced-motion active)"
observability_surfaces:
  - "console.warn when frame exceeds 33ms budget (Mesa frame budget exceeded: Xms)"
  - "console.error for degenerate projection (NaN/Infinity vertex coordinates) — renders ? character"
  - "Canvas element visible in DOM for DevTools screenshot/pixel inspection"
drill_down_paths:
  - .gsd/milestones/M006/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M006/slices/S01/tasks/T02-SUMMARY.md
duration: 40m
verification_result: passed
completed_at: 2026-03-14
---

# S01: Brand Identity + ASCII Mesa Component

**Established the brutalist-technical-white brand system (7-section spec with all design tokens) and proved the ASCII mesa 3D projection works — donut.c-style parametric rendering at 30fps on Canvas 2D with z-buffered character density mapping and geological amber tint.**

## What Happened

Two tasks, both straightforward.

**T01 (brand doc):** Wrote `~/Desktop/driftless/brand-identity.md` — 7 sections covering reference analysis (sutera.ch adaptation), color system (#FAFAF8 bg / #0A0A0A text / #C4862A amber + 7-step warm grayscale ramp), typography (Familjen Grotesk 900, Instrument Sans, JetBrains Mono with font-display strategies), fixed type scale (h1 at 4.5rem down to ticker at 0.8125rem), 4px-grid spacing scale, mesa animation spec (0.4 RPM Y-axis, 5° X-wobble, 30fps cap, character palette, three pause behaviors), and component catalog (nav, hero, how-it-works, what-it-generates, ticker, footer with layout rules and spacing tokens). Appendix includes a complete CSS variable quick reference block ready for copy into `globals.css`.

**T02 (ASCII mesa component):** Built `apps/web/components/ascii-mesa.tsx` (~310 lines). Parametric truncated pyramid geometry (base 2.0×2.0, top 1.2×1.2, height 1.0, 4 strata layers) with Y-axis rotation at 0.4 RPM + X-axis sinusoidal wobble. Rendering pipeline: perspective projection (camera z=3.5) → z-buffer per grid cell → luminance from normal·light dot product → context-sensitive character selection (edge chars by normal direction, density chars by luminance) → Canvas 2D fillText with amber #C4862A and stratum-modulated alpha. All three pause mechanisms wired: `matchMedia('prefers-reduced-motion')` renders static frame, `visibilitychange` pauses/resumes, `IntersectionObserver` (10% threshold) pauses off-screen. Preview route at `/mesa-preview` uses `next/dynamic` with `ssr: false`.

## Verification

- ✅ `test -f ~/Desktop/driftless/brand-identity.md` — exists with all 7 sections, all 3 font families, all hex codes, all CSS variable names
- ✅ `cd apps/web && pnpm next build` — exits 0, mesa-preview route at 1.36 kB
- ✅ `pnpm run test` — 268 tests passed (14 files), no regressions
- ✅ Browser: `/mesa-preview` — mesa renders with amber-tinted box-drawing characters, rotation confirmed via two screenshots 3 seconds apart showing different orientations, canvas pixel sampling verified active rendering (876/10000 non-zero pixels in center area), no console errors

## Requirements Advanced

- None — M006 has no active requirements in scope

## Requirements Validated

- None — M006 re-validates R021 (Vercel landing page) but that happens in S02 when the new page deploys

## New Requirements Surfaced

- None

## Requirements Invalidated or Re-scoped

- None

## Deviations

- Preview page required `"use client"` directive — Next 15 server components reject `ssr: false` on `next/dynamic`. Minor, no impact on component architecture or S02 integration.

## Known Limitations

- Mesa component is verified in dev server only — production deployment and integration into the actual landing page is S02 scope
- Reduced-motion and off-screen pause behaviors confirmed via code review and architecture but not yet verified via DevTools emulation (browser-level testing deferred to S02 UAT when the full page is built)
- No automated visual regression tests — mesa rendering is verified manually

## Follow-ups

- None — all work is cleanly handed off to S02

## Files Created/Modified

- `~/Desktop/driftless/brand-identity.md` — Complete brand identity specification (~24KB, 7 sections with all design tokens)
- `apps/web/components/ascii-mesa.tsx` — AsciiMesa React component (~310 lines): geometry, rotation, z-buffer, character density, Canvas 2D HiDPI renderer, three pause mechanisms
- `apps/web/app/(home)/mesa-preview/page.tsx` — Temporary preview page: "use client", next/dynamic with ssr:false, centered on #0A0A0A background

## Forward Intelligence

### What the next slice should know
- Brand doc appendix has a copy-pasteable CSS variable block — use it directly for the `@theme inline` block in `globals.css`
- The mesa component exports `AsciiMesa` as default. Import with `next/dynamic(() => import('@/components/ascii-mesa'), { ssr: false })` — the component uses Canvas 2D APIs that don't exist in Node
- All color hex codes in the component match brand-identity.md exactly — no reconciliation needed
- The preview page at `/mesa-preview` should be removed once the mesa is integrated into the real landing page

### What's fragile
- Canvas character rendering density depends on monospace font metrics — if JetBrains Mono isn't loaded when the mesa first renders, character spacing will be wrong. The component uses a generic monospace fallback but S02 should ensure font loading order.
- Z-buffer resolution scales with canvas size — very large viewports (4K+) may push vertex count past 8000 and approach the 33ms frame budget. The console.warn diagnostic will fire if this happens.

### Authoritative diagnostics
- `console.warn('Mesa frame budget exceeded:')` — if this fires frequently, reduce sample density or add LOD scaling
- `console.error('Degenerate projection:')` — indicates NaN/Infinity in projection math, should never fire with current geometry parameters
- Canvas pixel inspection via DevTools — sample center region to confirm non-zero rendering

### What assumptions changed
- Expected Next.js `next/dynamic` with `ssr: false` would work in a server component page — it requires `"use client"` on the page. Minor, well-documented Next 15 behavior.
