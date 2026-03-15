---
id: S01
milestone: M006
status: ready
---

# S01: Brand Identity + ASCII Mesa Component — Context

## Goal

Produce a complete brand identity document (`~/Desktop/driftless/brand-identity.md`) and a working spinning ASCII mesa React component (`apps/web/components/ascii-mesa.tsx`) that renders in dev server — proving the animation, establishing the visual identity, and providing all design tokens S02 needs to rebuild the landing page.

## Why this Slice

The mesa is the highest-risk piece in M006. If the 3D ASCII projection math doesn't produce a readable result, or Canvas 2D `fillText` stutters at 30fps on the target hardware, the entire hero section design needs to change. Proving it standalone in S01 — before S02 attempts the full landing page rebuild — eliminates the most expensive unknown early.

The brand identity document is co-developed with the mesa, not in isolation. Writing tokens (colors, type, spacing, animation speed) alongside the component that consumes them ensures the spec reflects what was actually built, not what was planned in the abstract.

## Scope

### In Scope

- **Brand identity document** at `~/Desktop/driftless/brand-identity.md`:
  - **Brand narrative** — geological concept: the Driftless Area (Wisconsin/Iowa/MN/IL unglaciated terrain). Your docs stay grounded while everything else drifts. The mesa is the visual embodiment.
  - **Color system** — `#FAFAF8` (off-white background), `#0A0A0A` (near-black text), `#C4862A` (geological amber — one accent, used for CTA button, active annotation line, section markers), full grayscale ramp (`#1A1A1A`, `#333`, `#666`, `#999`, `#CCC`, `#E5E5E5`, `#F5F5F5`)
  - **Typography** — Familjen Grotesk 900 (display, ALL-CAPS headers, `font-display: block`), Instrument Sans Regular/Medium (body), JetBrains Mono (data labels, annotation cards, monospace content). CSS variable names: `--font-display`, `--font-body`, `--font-mono`
  - **Type scale** — 7 steps: 11px (annotations/labels), 13px (captions), 16px (body), 20px (lead), 32px (subhead), 56px (section), 80–96px (hero display). All in `rem` in the design system.
  - **Spacing system** — 4px base unit, 8 steps: 4, 8, 16, 24, 32, 48, 64, 96px
  - **Animation spec** — Mesa: 0.4 RPM Y-axis primary rotation, slight X-axis wobble (±8°), 30fps cap, ambient only (no hover/click response)
  - **Component catalog** — visual description of each reusable element: annotation line (1px black line, 4px filled square at junction), data card (thin 1px border, monospace content, no fill), crosshair marker (`+` shape, 20×20px), bracketed label (`[ SECTION NAME ]`), numbered item (monospace number, rule separator), ticker (infinite-scroll marquee)
  - **Brand voice guide** — what driftless sounds like in writing: terse and technical (not warm/corporate), second-person imperative ("Run one command. Ship better docs."), all-caps for section labels, sentence case for body, no exclamation marks, no words like "powerful" or "seamless", verbs over adjectives. Examples of on-brand vs off-brand copy for headlines, error messages, and CTAs.
  - **Reference analysis** — 6 specific elements borrowed from sutera.ch (annotation line system, etymology data card, local time in nav, numbered core threads with rule separators, horizontal ticker/marquee, crosshair markers) and 4 elements that are driftless-specific (mesa instead of 3D island, amber accent instead of pure B&W, dev-tool copy voice, install command in hero instead of personal intro)

- **ASCII mesa component** at `apps/web/components/ascii-mesa.tsx`:
  - `"use client"` React component exporting `AsciiMesa`
  - Canvas 2D renderer with HiDPI handling (`devicePixelRatio` scaling)
  - Mesa geometry: truncated pyramid — flat top, 4 sloped sides, visible strata bands on the sides (3 horizontal band lines that give geological layering)
  - Character palette: two passes per frame — (1) surface fill using density ramp (` `, `.`, `·`, `░`) for depth faces, (2) wireframe edges using box-drawing chars (`╭`, `╮`, `╰`, `╯`, `─`, `│`) and dots
  - Characters are pure black (`#0A0A0A`) on white (`#FAFAF8`) — no amber on the mesa itself
  - Rotation: Y-axis continuous loop at 0.4 RPM, slight X-axis wobble (±8°), 30fps cap via `requestAnimationFrame` timing
  - Canvas size: ~400×320px on desktop (approx), scales with parent container
  - Pauses: `prefers-reduced-motion` → freeze at static frame, tab hidden (`document.visibilitychange`) → pause loop, off-screen (`IntersectionObserver`) → pause loop
  - **Static fallback**: `<noscript>` or Canvas-failure path renders a `<pre>` element containing a hardcoded ASCII snapshot of the mesa at a specific rotation angle — same character set, same monospace font
  - JetBrains Mono font loaded in Canvas via `document.fonts.ready` before first render; cell size measured via `ctx.measureText('M')` at init

- **Dev server verification** — `cd apps/web && pnpm dev` shows the mesa rendering at `localhost:3000` (on a test page or the home page). Build must pass: `cd apps/web && pnpm next build` exits 0.

### Out of Scope

- Landing page rebuild — that's S02. S01 delivers the component; S02 integrates it.
- Vercel deployment — S02 handles deploy.
- Font loading in the full brand layout (`apps/web/app/layout.tsx`) — the three fonts are loaded in S02 when the full page is rebuilt. S01 only needs the mesa component to render correctly in dev.
- Any changes to `app/globals.css` or `app/(home)/page.tsx` — S01 creates one new file (`apps/web/components/ascii-mesa.tsx`) and one doc (`~/Desktop/driftless/brand-identity.md`).
- OG image rebuild — S02.
- `fumadocs` docs site — untouched throughout.

## Constraints

- **No 3D libraries** — Canvas 2D `fillText` with rotation matrix math only. The entire renderer fits in ~200 lines.
- **Ambient only** — no hover slowdown, no click burst, no mouse tracking. The mesa spins. That's it.
- **Character color: pure black** — amber accent lives in the annotation lines and CTA in S02. The mesa is B&W, consistent with the rest of the page.
- **Mesa size: medium** (~400×320px canvas, fits in roughly a third of the hero width on desktop). The headline and annotation cards share equal visual weight with the mesa — neither dominates.
- **Static fallback required** — if Canvas fails or JS is disabled, a `<pre>` with a hardcoded rotation snapshot must be visible. Empty space is not acceptable.
- **Brand doc scope**: actionable spec + brand voice guide. Not a pixel-perfect style guide or a 40-page brand manual. Length target: 400–600 lines of markdown.
- **`next build` must exit 0** — the new component must be type-safe. No `any` escapes unless they're already present in the codebase pattern.
- **Font readiness before first canvas draw** — wait for `document.fonts.ready` before initializing the canvas character grid to avoid blurry/wrong-sized characters on first paint.

## Integration Points

### Consumes

- `apps/web/app/globals.css` — reads (does not modify) current CSS variables for background color reference
- `apps/web/package.json` — confirms `next`, `react`, `react-dom` versions (no new deps needed for Canvas 2D)
- sutera.ch design reference — analyzed in brand doc's reference section

### Produces

- `~/Desktop/driftless/brand-identity.md` — complete brand spec with color hex values, font family names, CSS variable names, type scale, spacing scale, animation parameters, component visual descriptions, brand voice guide, reference analysis. All token values ready to paste into S02's `globals.css` `@theme inline` block.
- `apps/web/components/ascii-mesa.tsx` — `AsciiMesa` React component with Canvas 2D renderer, all pause behaviors, HiDPI support, static fallback. S02 dynamically imports this with `next/dynamic` `{ ssr: false }`.

## Open Questions

- **Familjen Grotesk visual impact at 900** — confirmed available on Google Fonts but the visual weight needs in-browser validation during S02 hero headline rendering. If weight 900 doesn't read as "ultra-bold condensed", alternatives confirmed on Google Fonts: Bebas Neue (free, condensed-only, weight 400 but visually heavier), Oswald (variable 200–700). Current plan: try Familjen Grotesk 900 first; if the hero reads weak, swap to Bebas Neue during S02.
- **Mesa geometry legibility at ~400×320px** — a truncated pyramid with strata bands may look sparse at this canvas size. If the wireframe reads as too thin, adding a light dot-matrix fill on the top face may help ground it visually. Decision deferred to S01 execution: render it, see if it reads.
- **IntersectionObserver root margin** — should the mesa animation pause as soon as the hero is fully off-screen, or with a small buffer (e.g., `-100px`) to avoid flickering on partial scroll? Current thinking: use `threshold: 0` (pause as soon as any part leaves viewport).
