---
id: T02
parent: S01
milestone: M006
provides:
  - Complete AsciiMesa React component at apps/web/components/ascii-mesa.tsx with all rendering, rotation, and pause logic
  - Temporary preview route at apps/web/app/(home)/mesa-preview/page.tsx for visual verification
key_files:
  - apps/web/components/ascii-mesa.tsx
  - apps/web/app/(home)/mesa-preview/page.tsx
key_decisions:
  - "Mesa geometry as parametric truncated pyramid sampled at variable density (12-30 points per axis based on canvas size) — ~2000-8000 vertices depending on viewport"
  - "Z-buffer per grid cell with character+alpha storage — avoids overdraw, supports stratum opacity differentiation"
  - "Context-sensitive character selection: edge chars (─│╭╮╰╯) chosen by surface normal direction, density chars (·○░▒▓) by luminance fallback"
  - "Three independent pause mechanisms (reduced-motion, visibility, intersection) combined with logical OR via refs"
patterns_established:
  - "Canvas 2D HiDPI pattern: canvas.width = logical * dpr, canvas.style.width = logical, ctx.setTransform(dpr,...) — reusable for any HiDPI canvas component"
  - "useCallback for render function + useEffect for lifecycle — prevents stale closure over vertices/dimensions"
  - "ResizeObserver on container for responsive canvas sizing (re-renders static frame if reduced-motion active)"
observability_surfaces:
  - "console.warn when frame exceeds 33ms budget (Mesa frame budget exceeded: Xms)"
  - "console.error for degenerate projection (NaN/Infinity vertex coordinates)"
  - "Canvas element visible in DOM for DevTools screenshot/pixel inspection"
duration: 25m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Build ASCII mesa Canvas 2D component with 3D projection and motion controls

**Built the full AsciiMesa Canvas 2D renderer — truncated-pyramid geometry with donut.c-style projection, z-buffered character rendering in geological amber, and all three pause mechanisms.**

## What Happened

Implemented the component in a single `ascii-mesa.tsx` file (~310 lines). The geometry generator creates a parametric truncated pyramid (base 2.0×2.0, top 1.2×1.2, height 1.0) with 4 strata layers at y=-0.5, -0.25, 0.0, 0.25. Surface points are sampled with density scaling from 12–30 based on canvas column count. Four sloped sides plus strata ledges (slight outward protrusions for visual definition) generate ~2000–8000 vertices per frame.

Rendering pipeline: Y-axis rotation at 0.4 RPM + X-axis sinusoidal wobble (5° amplitude, 0.3 Hz) → perspective projection (camera at z=3.5) → z-buffer test per grid cell → luminance from normal·light dot product → context-sensitive character selection (edge chars by normal direction, density chars by luminance) → Canvas 2D fillText with amber #C4862A and stratum-modulated alpha.

All three pause mechanisms wired: `matchMedia('prefers-reduced-motion')` renders one static frame and stops rAF; `visibilitychange` pauses/resumes on tab switch; `IntersectionObserver` (10% threshold) pauses when canvas leaves viewport. All combine with logical OR. ResizeObserver handles responsive sizing.

Preview page at `/mesa-preview` uses `next/dynamic` with `ssr: false` inside a `"use client"` page component — Next 15 server components don't allow `ssr: false` on `next/dynamic`, so the page itself needs the client directive.

## Verification

- `cd apps/web && pnpm next build` — exits 0, mesa-preview route at 1.36 kB
- `pnpm run test` — 268 tests passed (14 files)
- Browser: opened `/mesa-preview`, confirmed mesa renders with amber-tinted box-drawing characters on #0A0A0A background
- Rotation confirmed: two screenshots 3 seconds apart show different orientations
- Canvas pixel sampling: 876/10000 non-zero pixels in center 100×100 area confirms active rendering
- `browser_assert`: no console errors, canvas visible, URL correct — all 3 checks passed
- Slice-level checks status:
  - ✅ `brand doc OK` (passed in T01)
  - ✅ `next build` exits 0
  - ✅ `pnpm run test` passes 268
  - ✅ Mesa rotates at `/mesa-preview` with density palette + amber tint + no console errors

## Diagnostics

- Frame budget warnings: `console.warn('Mesa frame budget exceeded: ${elapsed}ms')` fires when rAF callback exceeds 33ms
- Degenerate projection: `console.error('Degenerate projection:', { vertex, col, row, z })` when NaN/Infinity detected — returns null instead of corrupting z-buffer
- Visual inspection: canvas element in DOM, DevTools Performance panel for rAF timing

## Deviations

- Preview page required `"use client"` directive — Next 15 server components reject `ssr: false` on `next/dynamic`. Minor, no impact on component architecture.

## Known Issues

None.

## Files Created/Modified

- `apps/web/components/ascii-mesa.tsx` — Complete AsciiMesa React component (~310 lines): geometry generation, rotation matrices, z-buffer rendering, character density mapping, Canvas 2D HiDPI renderer, three pause mechanisms, ResizeObserver
- `apps/web/app/(home)/mesa-preview/page.tsx` — Temporary preview page: "use client", next/dynamic import with ssr:false, centered on #0A0A0A background
