---
id: S02
milestone: M006
status: ready
---

# S02: Landing Page Rebuild + Vercel Deploy — Context

## Goal

Rebuild `apps/web/app/(home)/` with the full brutalist-technical-white design system from S01 — custom nav, hero with ASCII mesa + annotation lines + data cards, three content sections, ticker, and footer — and ship it live at `driftless-six.vercel.app`.

## Why this Slice

S01 proves the hard parts (animation math, font rendering, design tokens). S02 assembles everything into the actual product surface: the landing page that Pro tier prospects and OSS users will see. It's the highest-visibility deliverable in M006 and unblocks all future marketing work.

## Scope

### In Scope

- **Custom layout** for `apps/web/app/(home)/layout.tsx` — replaces fumadocs `HomeLayout` entirely (D082). Plain wrapper with the brutalist nav bar. The `/docs` route group keeps its fumadocs layout unchanged.

- **Navigation** — thin 1px bottom-border bar:
  - Left: `DRIFTLESS` in Familjen Grotesk 900, all-caps, small size (~14px)
  - Center: `[ DOCS ]` pill link → `/docs` — amber border/text on hover, black at rest
  - Right: local time via `new Date().toLocaleTimeString()` in JetBrains Mono ~11px — client-only component with `useEffect` to avoid hydration mismatch

- **Hero section** — full viewport height, `#FAFAF8` background:
  - Headline: `DOCS THAT / DON'T DRIFT.` in Familjen Grotesk 900, all-caps, 80–96px display scale on desktop, responsive down to 40–48px on mobile
  - ASCII mesa (`AsciiMesa` component, dynamically imported `{ ssr: false }`): centered in the hero, ~400×320px on desktop, scales down to ~280×200px on mobile. **On mobile: mesa renders above the headline** (stacked layout, mesa on top).
  - **Single primary CTA**: `[ GET STARTED ]` in amber (`#C4862A`) border + text → `/docs`. No secondary GitHub CTA in the hero.
  - **Install command**: static monospace `npx @driftless-ai/cli init` below the CTA using `CopyInstall` component (already exists, restyled to match new design — thin black border, no dark background)
  - **Annotation lines and data cards** (desktop only, hidden below `lg:` breakpoint): 3 floating data cards connected to the mesa by thin SVG lines with small filled-square junction markers:
    - Card 1 (top-left): `FROM TESTS / TO DOCS / IN SECONDS`
    - Card 2 (top-right): `FRAMEWORKS: / PLAYWRIGHT / CYPRESS / +4 MORE`
    - Card 3 (bottom-right, etymology): `DRIFT / FROM: OLD NORSE / DRÍFA / ← TO DRIFT / AWAY`
  - 2–3 crosshair `+` markers at strategic empty-space positions (desktop only)
  - SVG annotation lines: static, absolute-positioned, hardcoded coordinates for `lg:` viewport, hidden on smaller screens

- **`[ HOW IT WORKS ]` section** — 3 numbered steps in technical datasheet style:
  - Section label: `[ HOW IT WORKS ]` in JetBrains Mono, amber color
  - 3 items: monospace number + thin horizontal rule + step title + body text
  - Fades in on scroll via `IntersectionObserver` (pure CSS `opacity`/`translate` transition, no animation library)
  - Steps: (1) Add to your repo — `npx @driftless-ai/cli init`, (2) Run on every PR — GitHub Action checks for drift, (3) Stay current — docs update automatically when tests change

- **`[ WHAT IT GENERATES ]` section** — before/after comparison:
  - Section label: `[ WHAT IT GENERATES ]` in JetBrains Mono, amber color
  - **New code examples written for this design** (not M004's dark CodeWindow components): thin 1px black-border panels on `#FAFAF8` background
  - Before panel: a polished Playwright test snippet — realistic but simplified, shows `test('user logs in', async ({ page }) => { ... })` flow
  - After panel: the generated markdown doc output — shows the actual heading + steps format driftless produces
  - Label above each panel: `BEFORE: playwright test` and `AFTER: generated doc` in JetBrains Mono 11px, amber
  - Fades in on scroll same as How It Works section

- **Ticker/marquee** — bottom of hero or between sections: `tests → docs · tests → docs · tests → docs ·` in JetBrains Mono, repeating infinite scroll via CSS `@keyframes` + `translateX`. No JS.

- **Footer** — minimal:
  - `DRIFTLESS / OPEN SOURCE` in Familjen Grotesk 900, small
  - Links (pill style, thin 1px border): `[ GITHUB ]` → GitHub repo, `[ NPM ]` → npm package, `[ DOCS ]` → `/docs`
  - No version badge, no changelog link, no social links

- **`globals.css` rebuild** — full `@theme inline` token replacement with new brand system: `--color-bg: #FAFAF8`, `--color-text: #0A0A0A`, `--color-amber: #C4862A`, grayscale ramp, 3 font variables, 7-step type scale, spacing scale, new keyframes (marquee, section-fade-in)

- **Root layout update** (`apps/web/app/layout.tsx`) — swap Instrument Serif for 3 new fonts (Familjen Grotesk, Instrument Sans, JetBrains Mono) via `next/font/google`, update `<title>` and OG metadata to reflect new brand

- **OG image rebuild** (`apps/web/app/opengraph-image.tsx`) — new brand visual: white background, `DRIFTLESS` in bold condensed type (loaded via Google Fonts API URL at build time), amber accent line, minimal layout

- **Vercel deploy** — push to `main` (or merge branch to `main`), confirm Vercel auto-deploys at `driftless-six.vercel.app`. Verify mesa renders and docs site `/docs` is unchanged.

### Out of Scope

- Any changes to `/docs` fumadocs content or layout — completely untouched
- Pricing page, Pro tier content — M007+
- Custom domain — still `driftless-six.vercel.app`
- Scroll-triggered parallax or multi-step animations — sections fade in with a single `opacity`/`translate` transition, nothing more complex
- New docs content — M004 docs content stands as-is
- A/B testing, analytics integration, contact form — not in this milestone

## Constraints

- **No page load animation** — everything is immediately visible on load. No stagger, no hero fade-in, no entrance sequence. The design speaks for itself from the first paint.
- **Scroll section fade-ins via IntersectionObserver** — sections (`[ HOW IT WORKS ]`, `[ WHAT IT GENERATES ]`) fade in as they enter the viewport. Pure CSS transitions (`opacity 0→1`, `translateY 20px→0`, ~300ms ease). No Framer Motion, no GSAP, no animation library. A tiny `useEffect` or `useIntersectionObserver` hook is acceptable since the landing page sections are RSC and the effect is small.
- **Single CTA in hero** — `[ GET STARTED ]` → `/docs`. No secondary GitHub button in the hero. The footer has the GitHub link.
- **Mesa stacks above headline on mobile** — enforced via flexbox `flex-col` with mesa first in DOM order. No JS needed for reordering.
- **Section scroll fade-in** — NOT the same as the ASCII mesa's IntersectionObserver pause. The section fade-in is a separate observer on each section element. Two distinct uses of IntersectionObserver in the page: one pauses the animation, one handles section reveals.
- **`"use client"` isolation** — only the time display component (nav), the CopyInstall button, and the AsciiMesa are client components. Sections and layout are RSC.
- **Code examples are new** — written for thin-border-on-white style. The before panel is a polished Playwright snippet; the after panel shows the actual markdown doc format driftless generates. Content must be realistic, not toy examples.
- **`next build` exits 0** — TypeScript strict mode throughout. No `any` casts in new components unless they match existing patterns (D060).
- **268 test baseline holds** — no tests touch `apps/web`. No need to write new landing page tests.
- **OG image font** — `next/og` `ImageResponse` doesn't support `next/font/google`. Load Familjen Grotesk via Google Fonts API URL (`https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@900`) at build time, fetch as ArrayBuffer. Fallback to system bold if fetch fails.

## Integration Points

### Consumes

- `~/Desktop/driftless/brand-identity.md` — design token values, component visual descriptions, font names, color hex codes (produced by S01)
- `apps/web/components/ascii-mesa.tsx` — `AsciiMesa` export, dynamically imported with `next/dynamic` `{ ssr: false }` at the hero call site (produced by S01)
- S01's CSS variable names — `--color-bg`, `--color-text`, `--color-amber`, `--font-display`, `--font-body`, `--font-mono` — applied in `globals.css` `@theme inline`
- `apps/web/components/copy-install.tsx` — existing client component, restyled to match new design system (no logic changes, CSS only)

### Produces

- Live Vercel deployment at `driftless-six.vercel.app` — new brutalist-technical-white landing page
- Updated `apps/web/app/globals.css` — full new design token system
- Updated `apps/web/app/layout.tsx` — 3 Google Fonts, new `<title>`, new OG/Twitter metadata
- New `apps/web/app/(home)/layout.tsx` — custom `<div>` wrapper (replaces fumadocs `HomeLayout`)
- Rebuilt `apps/web/app/(home)/page.tsx` — full landing page with all sections
- Updated `apps/web/app/opengraph-image.tsx` — new brand OG visual

## Open Questions

- **Section fade-in implementation detail** — `IntersectionObserver` is client-side only. Options: (a) a tiny `"use client"` wrapper component that observes its children and adds a CSS class, or (b) use CSS `@keyframes` triggered by `animation-play-state` toggled by a data attribute. Option (a) is cleaner for RSC architecture. Current thinking: a reusable `<FadeInSection>` client component that wraps each section.
- **CopyInstall restyling** — the existing component has a dark background (`bg-[#0c0c0e]`). The new design wants a thin black border on `#FAFAF8`. The component's logic (clipboard copy, feedback state) is unchanged — only the wrapper `className` needs updating. Verify no hardcoded colors inside the component itself.
- **Annotation line SVG coordinates** — must be handcrafted to match the actual rendered layout. This is inherently a build-and-adjust task: render the hero, measure card positions, write the SVG. Plan for one iteration loop during implementation.
- **Local time format** — `new Date().toLocaleTimeString()` returns locale-aware time like `"1:34:22 PM"`. The design shows it as `SFO 1:34 PM` style. Either (a) use `toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })` with a hardcoded city prefix, or (b) skip the city prefix and show just the time. Current thinking: show time with `LOCAL TIME` label above it — no city prefix, avoids hardcoding a location.
