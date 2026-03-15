# S01: Brand Identity + ASCII Mesa Component

**Goal:** Establish the brutalist-technical-white brand system and prove the ASCII mesa 3D projection works at 30fps on Canvas 2D.
**Demo:** `~/Desktop/driftless/brand-identity.md` exists with all design tokens; open `http://localhost:3000/mesa-preview` and see a slowly rotating geological mesa made from box-drawing characters with amber tint; `next build` exits 0.

## Must-Haves

- Brand identity document covers: reference analysis, color system, typography (3 fonts), type scale, spacing scale, animation spec, component catalog
- All design token values specified with CSS variable names for S02 consumption
- ASCII mesa component renders a rotating truncated-pyramid mesa with character density palette
- Geological amber (#C4862A) tint visible on mesa strata
- `prefers-reduced-motion` pauses animation
- Tab-visibility pause (Page Visibility API)
- IntersectionObserver off-screen pause
- HiDPI canvas sizing via devicePixelRatio
- 30fps requestAnimationFrame cap
- `next build` exits 0 with no type errors
- `pnpm run test` passes 268 (no regressions)

## Proof Level

- This slice proves: contract + operational
- Real runtime required: yes (browser rendering, animation frame budget)
- Human/UAT required: yes (visual confirmation of mesa rotation, character rendering, amber tint)

## Verification

- `test -f ~/Desktop/driftless/brand-identity.md && grep -q '#C4862A' ~/Desktop/driftless/brand-identity.md && grep -q 'Familjen Grotesk' ~/Desktop/driftless/brand-identity.md && grep -q 'JetBrains Mono' ~/Desktop/driftless/brand-identity.md && echo "brand doc OK"`
- `cd apps/web && pnpm next build` exits 0
- `pnpm run test` passes 268
- Open `http://localhost:3000/mesa-preview` — mesa rotates visibly, characters render from density palette, amber tint present, no console errors

## Observability / Diagnostics

- Runtime signals: `console.warn` if requestAnimationFrame exceeds 33ms frame budget; component logs pause/resume transitions at debug level
- Inspection surfaces: browser DevTools Performance panel for frame timing; canvas element visible in DOM for screenshot verification
- Failure visibility: if projection math produces NaN or Infinity, characters render as `?` with a console error identifying the degenerate input
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: none (first slice)
- New wiring introduced: `apps/web/components/ascii-mesa.tsx` as standalone `"use client"` component; `apps/web/app/(home)/mesa-preview/page.tsx` as temporary dev route
- What remains before the milestone is truly usable end-to-end: S02 integrates the mesa into the rebuilt landing page, wires design tokens into `globals.css`, adds the 3 Google Fonts to `layout.tsx`, deploys to Vercel

## Tasks

- [x] **T01: Write brand identity document with all design tokens** `est:45m`
  - Why: Establishes the complete design specification consumed by the mesa component (this slice) and the full landing page rebuild (S02). Defines every hex code, font name, CSS variable, spacing value, and animation parameter so downstream work implements a cohesive system, not ad-hoc choices.
  - Files: `~/Desktop/driftless/brand-identity.md`
  - Do: Write comprehensive brand doc with 7 sections: (1) reference analysis — break down sutera.ch's brutalist-technical aesthetic and how driftless adapts it; (2) color system — #FAFAF8 bg, #0A0A0A text, #C4862A amber, grayscale ramp with CSS variable names; (3) typography — Familjen Grotesk 900 (display), Instrument Sans (body), JetBrains Mono (data/labels) with font-display strategies per D084; (4) type scale — fluid/fixed sizes for h1–h6, body, small, labels; (5) spacing scale — 4px base unit grid; (6) animation spec — mesa rotation params (0.4 RPM Y-axis, ~5° X-wobble, 30fps cap, character palette `╭╮╰╯─│·○░▒▓`, pause behaviors); (7) component catalog — visual descriptions of nav, hero, mesa, annotation lines, floating data cards, ticker, footer with layout rules.
  - Verify: File exists with all 7 sections, all 3 font families named, all hex codes present, CSS variable names defined for `--color-bg`, `--color-text`, `--color-amber`, `--font-display`, `--font-body`, `--font-mono`
  - Done when: `~/Desktop/driftless/brand-identity.md` exists and contains reference analysis, color system, typography, type scale, spacing, animation spec, and component catalog — all with concrete values, not placeholders
- [x] **T02: Build ASCII mesa Canvas 2D component with 3D projection and motion controls** `est:2h`
  - Why: The highest-risk deliverable in M006. Proves donut.c-style projection math works for mesa geometry, that Canvas 2D fillText handles ~2000-5000 characters at 30fps, and that all three pause mechanisms (reduced-motion, tab-hidden, off-screen) function correctly. Retires the "ASCII mesa 3D projection math" and "Canvas 2D fillText performance" risks from the roadmap.
  - Files: `apps/web/components/ascii-mesa.tsx`, `apps/web/app/(home)/mesa-preview/page.tsx`
  - Do: Implement `"use client"` React component: (1) mesa geometry as truncated pyramid — parametric surface with flat top, angled sides, horizontal strata layers; (2) rotation matrices for Y-axis (0.4 RPM continuous) and X-axis (~5° sinusoidal wobble); (3) z-buffer array for hidden surface removal; (4) character density ramp mapping surface luminance → palette chars (`╭╮╰╯─│·○░▒▓`); (5) Canvas 2D fillText renderer with monospace font, one char per grid cell; (6) HiDPI canvas sizing via `devicePixelRatio`; (7) geological amber `#C4862A` as fillStyle with luminance-based opacity for strata differentiation; (8) `prefers-reduced-motion` via `matchMedia` listener — show static frame; (9) Page Visibility API — pause rAF when `document.hidden`; (10) IntersectionObserver — pause when canvas leaves viewport. Create `mesa-preview/page.tsx` with centered mesa on dark bg for visual verification. All color values match brand-identity.md spec.
  - Verify: `cd apps/web && pnpm next build` exits 0; start dev server, open `/mesa-preview`, confirm visible rotation + amber tint + character rendering + no console errors; test reduced-motion via DevTools emulation; `pnpm run test` passes 268
  - Done when: Mesa rotates in browser with character palette and amber tint, all three pause mechanisms work, build passes with no type errors, 268 tests still pass

## Files Likely Touched

- `~/Desktop/driftless/brand-identity.md`
- `apps/web/components/ascii-mesa.tsx`
- `apps/web/app/(home)/mesa-preview/page.tsx`
