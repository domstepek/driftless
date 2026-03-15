# M006: Brand Identity + Landing Page Revamp — Context

**Gathered:** 2026-03-15
**Status:** Queued — pending auto-mode execution

## Project Description

M006 is a full creative overhaul of driftless's public face. The current landing page (M004) is functional but lacks visual identity — it doesn't represent the brand with the confidence a serious product deserves. This milestone defines the driftless brand from scratch and rebuilds the landing page to match.

**Design target:** Closely model [https://www.sutera.ch](https://www.sutera.ch) — a brutalist technical-white aesthetic with ultra-bold condensed display type, engineering annotation lines connecting a central hero to floating data cards, crosshair markers, monospace label system, and near-zero color. driftless extends this with one brand accent: **geological amber** (`#C4862A`), drawn from the ochre color of exposed Driftless Area sandstone.

**Central hero element:** A spinning ASCII mesa/plateau rendered in the browser — a slowly rotating geological formation made from box-drawing and density characters. The Driftless Area (the geological region from which the product name derives) was the only terrain untouched by glacial drift. The mesa is a direct visual metaphor: your docs stay grounded while everything else shifts.

**Milestone structure:**
1. **S01:** Brand identity document + design system specification (`~/Desktop/driftless/brand-identity.md`) — the single source of truth for all visual decisions, written before any code
2. **S02:** Spinning ASCII mesa hero component — the centerpiece, developed as a standalone React component with full WebGL/Canvas renderer
3. **S03:** Full landing page rebuild in `apps/web` using the new brand system + hero component, deploying to Vercel

## Why This Milestone

M004 shipped a landing page. But "functional" isn't enough when the product is competing against Pendo and WalkMe for mid-market B2B SaaS attention. The current editorial serif + amber design (D061) was a good first pass but doesn't read as the category-redefining tool that driftless is. The Pro tier features (M007+) will drive revenue; the landing page is what creates the first impression that makes someone trust driftless enough to try it.

The sutera.ch reference was chosen specifically because it feels like a product made by someone who understands technical craft *and* design craft. That's the driftless positioning: a developer tool with the visual rigor of a design studio.

Shipping this before the Pro tier (M007+) ensures the brand is locked before new features start shipping — so all Pro tier marketing, product pages, and UI share the same identity.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Visit `driftless-six.vercel.app` (or new domain) and see a landing page that stops them — not because it's flashy, but because it's precise
- Read a hero headline in massive all-caps condensed grotesque with annotation lines connecting to floating data cards
- Watch a slowly rotating ASCII mesa at the center of the hero section, drawing the eye before a word is read
- Scroll to find sections styled like technical datasheets — monospace labels, numbered items, thin rule separators
- Experience the geological amber accent used exactly where it earns attention: the primary CTA, the animated annotation connector, the section dividers

### Entry point / environment

- Entry point: `https://driftless-six.vercel.app` (Vercel deployment); brand doc at `~/Desktop/driftless/brand-identity.md`
- Environment: browser, local dev (`apps/web`)
- Live dependencies: Vercel (deploy), `requestAnimationFrame` / Canvas 2D or WebGL for ASCII animation

## Completion Class

- Contract complete means: brand doc exists with all tokens defined, `apps/web` builds clean with `next build`, ASCII component renders without errors in dev
- Integration complete means: Vercel deployment live, ASCII animation renders in Chrome/Firefox/Safari, all sections match design system, no console errors
- Operational complete means: `prefers-reduced-motion` pauses the ASCII animation, animation pauses when tab is not visible

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Brand identity doc exists at `~/Desktop/driftless/brand-identity.md` with all design tokens (colors, type scale, spacing, animation spec) defined
- Landing page loads at Vercel URL, ASCII mesa is visible and rotating, headline is in Familjen Grotesk Black (or chosen display font), amber accent appears on CTA
- `pnpm run test` still passes (268 baseline, no regressions from web app changes)
- `cd apps/web && pnpm next build` exits 0 with no type errors

## Risks and Unknowns

- **ASCII animation performance** — 3D ASCII rotation in the browser requires per-frame JS math (3D-to-2D projection, character selection based on surface normal). Canvas 2D text rendering is fast enough; the risk is frame budget on low-end hardware. Mitigation: test on integrated graphics, provide `prefers-reduced-motion` pause, cap frame rate at 30fps.
- **Font licensing and loading** — Familjen Grotesk (Google Fonts) is free and renders well. The display font must load before paint to prevent layout shift on the hero. Use `font-display: block` for the display font only.
- **Replicating sutera's annotation line aesthetic** — The thin connection lines with small square nodes at junctions require careful CSS or SVG. Not technically hard but fiddly to get right at different viewport widths. Plan: use absolute-positioned SVG overlay on the hero section.
- **ASCII component in Next.js RSC context** — The animation is fully client-side. Must be wrapped in `"use client"` and dynamically imported with `ssr: false` to avoid hydration mismatch. This is a known pattern but requires careful placement.
- **Current landing page regression** — M004's landing page (D061: editorial serif + amber) will be fully replaced. This is intentional. Existing fumadocs docs site (`/docs`) is untouched — only the `app/(home)` route group changes.

## Existing Codebase / Prior Art

- `apps/web/app/(home)/page.tsx` — current landing page (editorial serif direction, M004 S01). Replaced in S03.
- `apps/web/app/(home)/layout.tsx` — layout wrapper. Updated in S03 with new brand fonts.
- `apps/web/app/globals.css` — CSS custom properties and Tailwind v4 theme. Rebuilt with new design system tokens in S03.
- `apps/web/app/layout.tsx` — root layout with Next.js Metadata. OG/Twitter card meta tags updated to reflect new brand.
- `apps/web/app/opengraph-image.tsx` — dynamic OG image route. Updated to match new visual identity.
- D061: editorial dark-luxury aesthetic — superseded by this milestone's brutalist-technical-white direction. No code dependency; just a decision override.
- D053–D064: all valid, no architecture changes to fumadocs/Next.js/Vercel setup. Only the visual layer changes.
- `~/Desktop/driftless/brand-identity.md` — written in S01 of this milestone. Does not yet exist.

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R021 — Vercel landing/marketing page (re-executed with new brand direction, supersedes M004's validation)

## Scope

### In Scope

- **Brand identity document** at `~/Desktop/driftless/brand-identity.md` — not committed to the repo (private planning doc). Contains:
  - Brand concept: geological anchoring, the Driftless Area, "docs that don't drift"
  - Color system: `#FAFAF8` background, `#0A0A0A` text, `#C4862A` amber accent, full grayscale ramp
  - Typography: Familjen Grotesk Black (display), Instrument Sans Regular (body), JetBrains Mono (data/labels) — all Google Fonts free tier
  - Type scale: 7 steps from 11px annotations to 96px hero display
  - Spacing system: 4px base unit, 8-step scale
  - Animation spec: ASCII mesa rotation speed (0.4 RPM), character palette, projection math
  - Component catalog: annotation line, data card, crosshair marker, ticker/marquee, bracketed label, numbered item
  - Sutera.ch reference analysis: what we're borrowing vs. what's driftless-specific

- **Spinning ASCII mesa component** (`apps/web/components/ascii-mesa.tsx`) — standalone React component:
  - Pure Canvas 2D or WebGL renderer (no third-party 3D libs)
  - 3D wireframe projection using rotation matrix math (same approach as classic donut.c)
  - Mesa/plateau geometry: flat top, sloped sides with visible strata layers
  - Character palette drawn from density ramps + box-drawing chars: `╭╮╰╯─│·○░▒▓`
  - Geological amber tint applied via CSS `color` property on the canvas container (or rendered directly)
  - Rotation: Y-axis primary (360° loop), slight X-axis wobble
  - Pauses on `prefers-reduced-motion`, pauses when tab is hidden
  - `"use client"` with `next/dynamic` SSR-disabled import at the call site

- **Landing page rebuild** in `apps/web/app/(home)/` — full replacement of M004's design:
  - Navigation: brand name left (`DRIFTLESS`), center CTA pill with brackets (`[ DOCS ]`), right: `LOCAL TIME / SFO 00:00 AM`
  - Hero section: full-viewport, pure white, large headline (`DOCS THAT / DON'T DRIFT.`), ASCII mesa centered, 3–4 annotation lines connecting mesa to floating data cards, 2–3 crosshair markers
  - Annotation data cards (floating, monospace, thin border): "FROM TESTS / TO DOCS / IN SECONDS", "FRAMEWORKS: / PLAYWRIGHT / CYPRESS / +4 MORE", brand etymology card (`DRIFT / FROM: OLD NORSE / DRÍFA / ← TO DRIFT / AWAY`) mirroring sutera's `SU (UNDERNEATH) + TERA (EARTH)` card
  - Second section: `[ HOW IT WORKS ]` with 3 numbered steps in technical datasheet style
  - Third section: `[ WHAT IT GENERATES ]` — before/after comparison with thin-bordered code panel
  - Bottom ticker/marquee: `tests → docs · tests → docs · tests → docs ·`
  - Footer: minimal — links, GitHub star button (pill style), `DRIFTLESS / OPEN SOURCE`
  - Amber accent on: primary CTA button, the active/animated annotation line, section labels

- **Vercel redeployment** — same project, same URL, new design live

- **OG image update** — `apps/web/app/opengraph-image.tsx` rebuilt with new brand identity (B&W + amber, condensed type, minimal)

### Out of Scope / Non-Goals

- Changes to fumadocs docs site (`/docs`) — unchanged
- New docs content — M004 content stands
- Animation library integration (no Framer Motion, no GSAP) — pure CSS transitions and requestAnimationFrame only
- Mobile-specific ASCII art variant — the mesa component can scale down; no second version needed
- Custom domain setup — still uses `driftless-six.vercel.app` unless trivially available
- Any Pro tier content or pricing page — that's M007+

## Technical Constraints

- **Pure Canvas 2D or WebGL — no 3D library** — Three.js, Babylon.js, etc. are out. The ASCII renderer is math + character lookup, fitting in a single ~200-line component. The ascii-video skill (hermes-agent) provides the algorithmic reference for character-brightness mapping and value field generators.
- **Google Fonts only** — Familjen Grotesk, Instrument Sans, JetBrains Mono are all available. Next.js `next/font/google` handles loading with `font-display: block` for display font.
- **Tailwind v4 CSS-first** — design tokens go into `@theme inline` in `globals.css` following the established D057 pattern. No JS config.
- **`"use client"` isolation** — ASCII component is the only client component in the landing page. The rest is RSC.
- **Zero regressions to packages/*** — no changes outside `apps/web`. `pnpm run test` baseline is 268.
- **sutera.ch reference is inspiration, not copy** — structure and design language are closely modeled, but copy, content, and brand story are entirely driftless-specific.

## Integration Points

- **Vercel** — redeployment of `apps/web` to existing project (same `rootDirectory: apps/web` config, D063)
- **Google Fonts** — Familjen Grotesk, Instrument Sans, JetBrains Mono via `next/font/google`
- **Canvas 2D API / WebGL** — browser-native animation for ASCII mesa component
- **fumadocs** — docs site at `/docs` is untouched; shared layout components are scoped to the home route group

## Open Questions

- **Display font fallback** — If Familjen Grotesk loads late, the layout shifts dramatically because it's condensed+bold. Use `font-display: block` and a matching system font in the fallback stack? Or accept the shift given that it's a landing page (not an app)?
  - Current thinking: `font-display: block` with `'Arial Narrow'` as nearest system fallback. Small layout shift is acceptable.
- **ASCII character density for the mesa** — the mesa needs to be legible at ~400×300px canvas. Should it use block elements (`░▒▓`) for fill or box-drawing (`╭─╮`) for wireframe only?
  - Current thinking: wireframe-first (box-drawing + dots) on the outside, light fill (`░` or `.`) for depth surfaces. Two-pass render: background fill layer then edge/wireframe layer on top.
- **Annotation line implementation** — pure CSS absolute positioning with SVG paths vs. a React component that computes connector positions dynamically based on viewport?
  - Current thinking: static SVG overlay with hardcoded positions that respond to a breakpoint (hide on mobile, reposition at tablet). Dynamic computation is over-engineering for a layout that won't change often.
- **"LOCAL TIME" in navigation** — sutera shows Zurich local time. For driftless, show the user's own local time (via JS `new Date()`), or a fixed location?
  - Current thinking: user's local time via `new Date().toLocaleTimeString()` — personalizes the experience slightly, no extra API calls.
