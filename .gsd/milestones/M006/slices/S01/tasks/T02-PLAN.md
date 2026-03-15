---
estimated_steps: 6
estimated_files: 2
---

# T02: Build ASCII mesa Canvas 2D component with 3D projection and motion controls

**Slice:** S01 — Brand Identity + ASCII Mesa Component
**Milestone:** M006

## Description

Build the `AsciiMesa` React component — a `"use client"` Canvas 2D renderer that displays a slowly rotating geological mesa made from box-drawing and density characters. This is the highest-risk deliverable in M006: it adapts the donut.c technique (parametric surface → rotation matrices → z-buffer → character density mapping) to a truncated-pyramid mesa geometry with strata layers.

The component must hit 30fps with ~2000-5000 fillText calls per frame, handle HiDPI displays, and implement three independent pause mechanisms. A temporary preview page proves it works before S02 integrates it into the rebuilt landing page.

## Steps

1. Create `apps/web/components/ascii-mesa.tsx` as a `"use client"` component. Define the mesa geometry as a parametric surface: flat top (rectangle), four sloped sides (angled inward from base to top), and 3-4 horizontal strata layers cutting across the sides. Each surface point has a position in 3D and a surface normal for lighting.
2. Implement the rendering pipeline: (a) Y-axis rotation at 0.4 RPM with continuous angle increment; (b) X-axis sinusoidal wobble (~5° amplitude, slow period); (c) perspective projection from 3D to 2D grid coordinates; (d) z-buffer array — only render the nearest character per grid cell; (e) luminance calculation from surface normal dot light direction; (f) map luminance to character density ramp `·○░▒▓│─╰╯╭╮` (lighter surfaces get sparse chars, darker get dense); (g) apply geological amber `#C4862A` as fillStyle with luminance-modulated alpha for strata vs rock-face differentiation.
3. Implement the Canvas 2D renderer: create canvas element sized to component container, apply `devicePixelRatio` scaling for HiDPI (set canvas width/height to logical×dpr, scale context, set CSS width/height to logical), use monospace font for fillText, clear and redraw each frame via requestAnimationFrame capped at 30fps (~33ms interval).
4. Wire up the three pause mechanisms: (a) `prefers-reduced-motion` via `window.matchMedia('(prefers-reduced-motion: reduce)')` — when active, render a single static frame and stop rAF; (b) Page Visibility API — listen for `visibilitychange`, pause rAF when `document.hidden` is true; (c) IntersectionObserver on the canvas element — pause rAF when not intersecting viewport. All three are independent and combine with logical OR (any active = paused). Clean up all listeners and observers in useEffect return.
5. Create `apps/web/app/(home)/mesa-preview/page.tsx` — minimal page that imports `AsciiMesa` via `next/dynamic` with `{ ssr: false }` and renders it centered on a `#0A0A0A` background. This is a temporary dev route for visual verification.
6. Verify: run `pnpm next build` in `apps/web` to confirm no type errors; start dev server and open `/mesa-preview` to visually confirm rotation, character rendering, and amber tint; emulate `prefers-reduced-motion` in DevTools to confirm pause; switch tabs to confirm visibility pause; run `pnpm run test` from repo root to confirm 268 tests still pass.

## Must-Haves

- [ ] `"use client"` directive on component
- [ ] Mesa geometry: flat top, sloped sides, horizontal strata layers
- [ ] Rotation: Y-axis 0.4 RPM continuous, X-axis ~5° sinusoidal wobble
- [ ] Z-buffer hidden surface removal
- [ ] Character density palette: `╭╮╰╯─│·○░▒▓` mapped to surface luminance
- [ ] Canvas 2D fillText with monospace font
- [ ] HiDPI canvas sizing via devicePixelRatio
- [ ] Amber `#C4862A` fillStyle with luminance modulation
- [ ] `prefers-reduced-motion` pause (static frame)
- [ ] Page Visibility API pause
- [ ] IntersectionObserver off-screen pause
- [ ] 30fps rAF cap
- [ ] useEffect cleanup for all listeners/observers/rAF
- [ ] `next build` passes with no type errors
- [ ] Preview page renders mesa at `/mesa-preview`

## Verification

- `cd apps/web && pnpm next build` exits 0
- `pnpm run test` passes 268 (repo root)
- Open `http://localhost:3000/mesa-preview` — mesa rotates, characters visible, amber tint present
- Browser console shows no errors on the preview page
- DevTools → Rendering → Emulate prefers-reduced-motion: reduce → animation stops
- Switch to another tab and back → animation pauses and resumes

## Observability Impact

- Signals added: frame timing logged to console at debug level when frame exceeds 33ms budget; NaN/Infinity projection coordinates trigger `console.error` with the degenerate vertex input
- How a future agent inspects this: browser DevTools console for frame budget warnings; Performance panel for rAF timing; canvas element in DOM for screenshot
- Failure state exposed: degenerate projection renders `?` characters instead of palette chars; console error identifies which vertex produced NaN

## Inputs

- `~/Desktop/driftless/brand-identity.md` — color values (#C4862A amber, #0A0A0A text), animation spec (0.4 RPM, wobble, 30fps, character palette, pause behaviors), font choice (monospace = JetBrains Mono or system monospace for canvas)
- D083: Pure Canvas 2D — no 3D libraries
- D080: Brutalist-technical-white aesthetic direction

## Expected Output

- `apps/web/components/ascii-mesa.tsx` — complete `AsciiMesa` component with all rendering, rotation, and pause logic. Exports a single default or named component usable via `next/dynamic` in S02.
- `apps/web/app/(home)/mesa-preview/page.tsx` — temporary preview route for visual verification. S02 will remove this when integrating the mesa into the real hero section.
