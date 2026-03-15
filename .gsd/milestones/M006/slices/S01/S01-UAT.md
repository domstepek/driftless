# S01: Brand Identity + ASCII Mesa Component — UAT

**Milestone:** M006
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven for brand doc, live-runtime for mesa component)
- Why this mode is sufficient: Brand doc is a static specification verified by content checks. Mesa component requires real browser rendering to confirm 3D projection, character palette, amber tint, and animation behavior.

## Preconditions

- Repository at `/Users/jstepek/Personal Repos/driftless` with current branch containing S01 changes
- `cd apps/web && pnpm dev` running at `http://localhost:3000`
- Modern browser (Chrome/Firefox/Safari) with DevTools available

## Smoke Test

1. Open `http://localhost:3000/mesa-preview`
2. **Expected:** A slowly rotating geological mesa made from box-drawing and density characters (╭╮╰╯─│·○░▒▓) renders on a dark background with amber tint visible

## Test Cases

### 1. Brand identity document exists with all required sections

1. Run `test -f ~/Desktop/driftless/brand-identity.md && echo EXISTS`
2. Run `grep -c '^## [0-9]' ~/Desktop/driftless/brand-identity.md`
3. **Expected:** File exists; grep returns 7 (one heading per major section: reference analysis, color system, typography, type scale, spacing, animation spec, component catalog)

### 2. Brand doc contains all design token values

1. Run `grep -q '#FAFAF8' ~/Desktop/driftless/brand-identity.md && echo bg`
2. Run `grep -q '#0A0A0A' ~/Desktop/driftless/brand-identity.md && echo text`
3. Run `grep -q '#C4862A' ~/Desktop/driftless/brand-identity.md && echo amber`
4. Run `grep -q 'Familjen Grotesk' ~/Desktop/driftless/brand-identity.md && echo display-font`
5. Run `grep -q 'Instrument Sans' ~/Desktop/driftless/brand-identity.md && echo body-font`
6. Run `grep -q 'JetBrains Mono' ~/Desktop/driftless/brand-identity.md && echo mono-font`
7. Run `grep -q '\-\-font-display' ~/Desktop/driftless/brand-identity.md && echo var-display`
8. Run `grep -q '\-\-font-body' ~/Desktop/driftless/brand-identity.md && echo var-body`
9. Run `grep -q '\-\-font-mono' ~/Desktop/driftless/brand-identity.md && echo var-mono`
10. Run `grep -q '\-\-color-bg' ~/Desktop/driftless/brand-identity.md && echo var-bg`
11. Run `grep -q '\-\-color-text' ~/Desktop/driftless/brand-identity.md && echo var-text`
12. Run `grep -q '\-\-color-amber' ~/Desktop/driftless/brand-identity.md && echo var-amber`
13. **Expected:** All 12 checks print their label — no missing tokens

### 3. Mesa component renders with visible rotation

1. Open `http://localhost:3000/mesa-preview` in browser
2. Observe the canvas for 5 seconds
3. **Expected:** The mesa visibly rotates — the arrangement of characters changes continuously. Characters are from the density palette (·○░▒▓ and box-drawing ╭╮╰╯─│). The overall tint is amber/warm, not white or gray.

### 4. Mesa renders on dark background with amber tint

1. On `/mesa-preview`, inspect the canvas element in DevTools
2. Check the page background color
3. Observe the character colors on the canvas
4. **Expected:** Page background is #0A0A0A (near-black). Characters render in amber (#C4862A) with varying opacity creating depth/strata differentiation.

### 5. Next.js build passes with mesa component

1. Run `cd apps/web && pnpm next build`
2. **Expected:** Build exits 0. Route list includes `/mesa-preview` at ~1.36 kB. No type errors or warnings related to ascii-mesa.

### 6. Test suite has no regressions

1. Run `pnpm run test` from repo root
2. **Expected:** 268 tests pass across 14 test files. No failures, no skipped tests.

### 7. No console errors during mesa rendering

1. Open `http://localhost:3000/mesa-preview`
2. Open browser DevTools Console tab
3. Wait 10 seconds while mesa renders
4. **Expected:** No errors or warnings in console. Specifically: no "Degenerate projection" errors, no "Mesa frame budget exceeded" warnings (on reasonable hardware), no React errors.

### 8. Canvas uses HiDPI sizing

1. On `/mesa-preview`, inspect the `<canvas>` element in DevTools
2. Compare the `width`/`height` attributes to the CSS `width`/`height` style
3. **Expected:** On a Retina display (dpr=2), canvas width/height attributes are 2× the CSS dimensions. On a non-Retina display, they match 1:1.

## Edge Cases

### Reduced-motion preference pauses animation

1. In Chrome DevTools, open Rendering tab (Cmd+Shift+P → "Show Rendering")
2. Enable "Emulate CSS media feature prefers-reduced-motion: reduce"
3. Reload `/mesa-preview`
4. **Expected:** Mesa renders a single static frame — no rotation, no animation. Characters and amber tint are still visible.

### Tab visibility pause

1. Open `/mesa-preview` and confirm mesa is rotating
2. Switch to a different browser tab for 5+ seconds
3. Switch back to the mesa-preview tab
4. **Expected:** Mesa resumes rotation from where it paused (not from the beginning). No frame skip or stutter on resume.

### Browser resize re-renders canvas

1. Open `/mesa-preview` at full desktop width
2. Resize the browser window significantly smaller (e.g., half width)
3. **Expected:** Canvas resizes to fit the new container. Mesa re-renders at the new size. Character grid density adjusts (fewer characters in smaller canvas).

### Off-screen pause (IntersectionObserver)

1. If the mesa-preview page has enough content to scroll (or modify the page temporarily to add spacer content), scroll the canvas completely out of view
2. **Expected:** Animation pauses when canvas is not visible (verify via Performance panel — no rAF callbacks while off-screen)
3. Scroll back to reveal the canvas
4. **Expected:** Animation resumes

## Failure Signals

- Console error "Degenerate projection" — indicates NaN/Infinity in projection math, means geometry or rotation matrix has a bug
- Console warning "Mesa frame budget exceeded: Xms" — indicates performance issue, frame took longer than 33ms
- Mesa renders as solid block or empty canvas — character density mapping or z-buffer is broken
- Characters are white/gray instead of amber — fillStyle not set to #C4862A or alpha modulation is wrong
- Mesa doesn't rotate — requestAnimationFrame loop not started, or all three pause conditions are erroneously active
- `next build` fails with type errors in ascii-mesa.tsx — TypeScript types wrong for Canvas 2D API, refs, or effects
- Brand doc missing sections — check `grep -c '^## [0-9]'` returns less than 7

## Requirements Proved By This UAT

- None directly — M006 has no active requirements. This UAT proves the S01 deliverables that S02 depends on.
- Indirectly supports R021 (Vercel landing page) — the mesa component and brand tokens are inputs to the S02 landing page rebuild.

## Not Proven By This UAT

- Mesa performance under production conditions (Vercel deployment, real user devices) — S02 scope
- Integration of mesa into the actual landing page layout — S02 scope
- Font loading behavior with Familjen Grotesk 900 on the real page — S02 scope
- Full responsive behavior across mobile/tablet/desktop breakpoints — S02 scope
- OG image update with new brand visual — S02 scope

## Notes for Tester

- The mesa animation is intentionally slow (0.4 RPM = one full rotation every 2.5 minutes). Give it at least 5 seconds to confirm visible movement.
- The `/mesa-preview` route is a temporary dev page — it will be removed in S02 when the mesa is integrated into the real landing page.
- Character rendering quality depends on monospace font availability. If characters appear misaligned, check that a monospace font is loaded (the component falls back to generic `monospace`).
- On very high-resolution displays (4K+), watch for the "frame budget exceeded" warning — if it appears, it's a known limitation noted in the S01 summary, not a test failure.
