# S02: Landing Page Rebuild + Vercel Deploy

**Goal:** Replace the M004 editorial landing page with the brutalist-technical-white brand system — all design tokens, three fonts, six page sections, spinning ASCII mesa, and live on Vercel.
**Demo:** Visit `driftless-six.vercel.app` and see the complete redesign — condensed grotesque headline, spinning ASCII mesa with annotation lines and floating data cards, monospace label system, geological amber accent on CTA, ticker marquee, all sections styled as technical datasheets. `/docs` unchanged and functional.

## Must-Haves

- `globals.css` rebuilt with full brand token system from appendix (colors, spacing, layout variables) alongside fumadocs CSS imports
- Root layout loads 3 Google Fonts via `next/font/google` with CSS variables (`--font-display`, `--font-body`, `--font-mono`), Instrument Serif removed
- `(home)/layout.tsx` uses custom wrapper instead of fumadocs `HomeLayout` — fumadocs layout only for `/docs`
- `(home)/page.tsx` fully rebuilt with: custom nav (brand left, CTA center, local time right), hero (mesa + headline + annotation lines + data cards), how-it-works (3 steps), what-it-generates (2-col cards), ticker marquee, footer
- `LocalTime` client component handles hydration mismatch (SSR placeholder → client time)
- ASCII mesa integrated via `next/dynamic` with `ssr: false`
- No scroll-triggered animations — content is immediately present
- Annotation lines hidden below `lg` breakpoint; data cards hidden below `lg` breakpoint
- OG image rebuilt with brutalist B&W + amber aesthetic, Familjen Grotesk 900 loaded as TTF ArrayBuffer
- `mesa-preview` route deleted
- `cd apps/web && pnpm next build` exits 0
- `pnpm run test` passes 268
- Vercel deployment live at `driftless-six.vercel.app`
- fumadocs `/docs` site unchanged and accessible

## Proof Level

- This slice proves: final-assembly
- Real runtime required: yes (browser verification of live Vercel deployment)
- Human/UAT required: yes (visual review of landing page against brand spec)

## Verification

- `cd apps/web && pnpm next build` — exits 0 with no type errors
- `pnpm run test` — 268 tests pass (no regressions)
- Browser: `driftless-six.vercel.app` loads with new design — condensed headline visible, mesa animating, ticker scrolling, nav with CTA pill
- Browser: `driftless-six.vercel.app/docs` — fumadocs documentation site renders correctly with sidebar navigation
- Browser: verify OG meta tags present (`og:image` pointing to `/opengraph-image`)

## Observability / Diagnostics

- Runtime signals: `console.warn('Mesa frame budget exceeded:')` if frame rendering exceeds 33ms, existing from S01
- Inspection surfaces: Vercel deployment logs, browser DevTools Network tab for font loading, Canvas element for mesa pixel inspection
- Failure visibility: `next build` type errors surface at build time; font loading failures visible as fallback font rendering; OG image failures visible as missing image in social previews
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: `~/Desktop/driftless/brand-identity.md` (design tokens, component catalog), `apps/web/components/ascii-mesa.tsx` (S01 output), `apps/web/components/copy-install.tsx` (existing, restyle optional)
- New wiring introduced in this slice: 3 Google Fonts in root layout, brand CSS variables in globals.css, custom `(home)` layout replacing fumadocs HomeLayout, `next/dynamic` import of AsciiMesa in page.tsx, TTF font asset for OG image
- What remains before the milestone is truly usable end-to-end: nothing — this is the final slice

## Tasks

- [ ] **T01: Rebuild landing page with brand system — tokens, fonts, layout, and all six sections** `est:45m`
  - Why: This is the core deliverable — replace the editorial page with the brutalist-technical-white design system. Tokens, fonts, and layout are prerequisites that the page sections immediately consume, so they're built in one flow.
  - Files: `apps/web/app/globals.css`, `apps/web/app/layout.tsx`, `apps/web/app/(home)/layout.tsx`, `apps/web/app/(home)/page.tsx`, `apps/web/components/local-time.tsx`
  - Do: (1) Rebuild `globals.css` — keep fumadocs imports, replace `@theme inline` with full brand token block from appendix, remove old keyframes/utility classes. (2) Update root `layout.tsx` — swap Instrument Serif for 3 new fonts via `next/font/google`, apply CSS variables to `<html>`, keep `RootProvider`. (3) Replace `(home)/layout.tsx` — remove `HomeLayout` import, render plain wrapper with `--color-bg` background scoped to home route. (4) Create `LocalTime` client component — `"use client"`, `useState` + `useEffect` for hydration-safe time display, `--:--:--` SSR placeholder. (5) Rebuild `(home)/page.tsx` — custom nav with brand name + CTA pill + LocalTime, hero section with `next/dynamic` mesa + headline + annotation SVG lines + floating data cards (hidden below `lg`), how-it-works with 3 numbered steps, what-it-generates 2-column card grid, dark ticker marquee with CSS infinite scroll + reduced-motion pause, footer with three columns + tagline. No scroll animations. Mesa z-layered behind text.
  - Verify: `cd apps/web && pnpm next build` exits 0; `pnpm run test` passes 268
  - Done when: build passes, all six page sections implemented matching brand spec component catalog

- [ ] **T02: Rebuild OG image, download font asset, clean up mesa-preview, and deploy to Vercel** `est:20m`
  - Why: OG image needs the display font as TTF (next/font/google doesn't work in ImageResponse). Mesa-preview is temporary S01 scaffolding. Deploy proves the full assembly on production infrastructure.
  - Files: `apps/web/app/opengraph-image.tsx`, `apps/web/assets/FamiljenGrotesk-Bold.ttf`, `apps/web/app/(home)/mesa-preview/page.tsx`
  - Do: (1) Download Familjen Grotesk TTF to `apps/web/assets/` — extract weight 900 (or boldest available) `.ttf` from Google Fonts. (2) Rebuild `opengraph-image.tsx` — white bg `#FAFAF8`, dark text `#0A0A0A`, amber accent `#C4862A`, load font via `readFile(join(process.cwd(), 'assets/FamiljenGrotesk-Bold.ttf'))`, condensed headline layout. (3) Delete `apps/web/app/(home)/mesa-preview/page.tsx` (and its directory). (4) Run `next build` to verify OG image generates. (5) Git push to trigger Vercel deploy. (6) Verify live deployment loads correctly — landing page and `/docs`.
  - Verify: `pnpm next build` exits 0; browser check `driftless-six.vercel.app` loads new design; browser check `driftless-six.vercel.app/docs` still works
  - Done when: Vercel deployment live with new brand design, OG image renders with Familjen Grotesk, mesa-preview route removed, fumadocs docs unchanged

## Files Likely Touched

- `apps/web/app/globals.css`
- `apps/web/app/layout.tsx`
- `apps/web/app/(home)/layout.tsx`
- `apps/web/app/(home)/page.tsx`
- `apps/web/components/local-time.tsx`
- `apps/web/app/opengraph-image.tsx`
- `apps/web/assets/FamiljenGrotesk-Bold.ttf`
- `apps/web/app/(home)/mesa-preview/page.tsx` (deleted)
