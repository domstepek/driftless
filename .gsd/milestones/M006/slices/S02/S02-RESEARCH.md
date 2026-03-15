# S02: Landing Page Rebuild + Vercel Deploy — Research

**Date:** 2026-03-14

## Summary

S02 replaces the entire `app/(home)/page.tsx` and surrounding layout/styles with the brutalist-technical-white brand system established in S01. The surface area is well-contained: 6 files to modify (`globals.css`, root `layout.tsx`, `(home)/layout.tsx`, `(home)/page.tsx`, `opengraph-image.tsx`) plus one to delete (`mesa-preview/page.tsx`). No new npm dependencies — all three Google Fonts come via `next/font/google`, Canvas/SVG are browser-native, and the ticker marquee is pure CSS.

The biggest integration challenge is replacing fumadocs `HomeLayout` with a custom layout for the `(home)` route group while keeping the `/docs` route's `DocsLayout` + `baseOptions()` working untouched. This is clean because the two route groups have completely separate `layout.tsx` files. The `(home)` layout just stops importing `HomeLayout` and renders a plain wrapper with the custom nav. The shared `layout.shared.tsx` stays for docs only.

The OG image rebuild requires loading Familjen Grotesk 900 as an ArrayBuffer — `next/font/google` doesn't work inside `ImageResponse`. The recommended approach is fetching the font from Google Fonts API at build time, or bundling a `.ttf` file in an `assets/` directory and using `readFile` from `node:fs/promises`. Bundling is more reliable (no runtime fetch) and only adds ~80KB to the project.

Vercel deployment is the simplest part — push to the branch, Vercel rebuilds automatically from `rootDirectory: apps/web` (D063). The only verification needed is that the live URL loads correctly after deploy.

## Recommendation

Build sequentially within a single task scope: globals.css tokens → root layout fonts → (home) layout replacement → page.tsx rebuild (nav, hero+mesa, how-it-works, what-it-generates, ticker, footer) → OG image → cleanup (remove mesa-preview). Run `next build` after the page is assembled to catch type errors early. Deploy via git push to the working branch — Vercel will preview-deploy. Final verification in browser against the live URL.

The annotation lines (SVG overlay connecting mesa to data cards) should be static SVG with absolute positioning, hidden below `lg` breakpoint. Don't attempt dynamic positioning — the layout is fixed and only changes at breakpoints.

The local time component in the nav must be `"use client"` to avoid hydration mismatch from `new Date()`. Keep it as a small isolated client component, not the entire nav.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| 3 Google Fonts with CSS variables | `next/font/google` with `variable` option | Already used for Instrument Serif (current). Swap to 3 new fonts with same pattern. Handles preload, self-hosting, CSS variable injection. |
| CSS design tokens | Tailwind v4 `@theme inline` in `globals.css` | Established pattern (D057). Brand doc appendix has a copy-pasteable CSS variable block. |
| Ticker/marquee animation | CSS `@keyframes` + `translateX` with infinite loop | Pure CSS, no JS. Duplicate content for seamless loop. Standard pattern. |
| OG image font loading | `readFile` from `node:fs/promises` + `ImageResponse` `fonts` option | Next.js docs show this exact pattern. Fetch at build time, pass as ArrayBuffer. |
| Reduced-motion on ticker | `@media (prefers-reduced-motion: reduce)` | CSS-only — pauses the `animation-play-state`. No JS needed. |
| SVG annotation lines | Static `<svg>` with `<line>` / `<path>` elements, absolute-positioned | Brand doc recommends static SVG. Responsive via CSS visibility (`hidden lg:block`). No dynamic computation. |

## Existing Code and Patterns

- `apps/web/app/(home)/page.tsx` — 420 lines, current editorial landing page. **Fully replaced.** Good structural pattern: local presentational components at top, sections in sequence. `CopyInstall` import is reusable.
- `apps/web/app/(home)/layout.tsx` — Currently wraps children in fumadocs `HomeLayout`. **Replaced** with plain `<div>` wrapper containing custom nav component. Only 7 lines; change is trivial.
- `apps/web/app/globals.css` — 56 lines with `@theme inline` block. **Rebuilt** with full brand token system from appendix. Keep the fumadocs CSS imports (`neutral.css`, `preset.css`) — they're needed for `/docs`. Add brand tokens alongside.
- `apps/web/app/layout.tsx` — Root layout with Instrument Serif font. **Updated** to load 3 new fonts (Familjen Grotesk, Instrument Sans, JetBrains Mono) with CSS variables on `<html>`. Remove Instrument Serif. `RootProvider` from fumadocs stays.
- `apps/web/app/opengraph-image.tsx` — Current dark-theme OG image. **Rebuilt** with brutalist B&W + amber. Must load Familjen Grotesk as ArrayBuffer for `ImageResponse` fonts option.
- `apps/web/app/twitter-image.tsx` — Re-exports OG image. **No change** — it re-exports from `opengraph-image.tsx`, so the rebuild propagates automatically.
- `apps/web/components/ascii-mesa.tsx` — S01 output. **Consumed** via `next/dynamic` with `{ ssr: false }`. Exports `AsciiMesa` as both named and default.
- `apps/web/components/copy-install.tsx` — Client component. **Reusable** — restyle to match new brand (swap `fd-*` colors to brand tokens).
- `apps/web/lib/layout.shared.tsx` — `baseOptions()` for fumadocs nav. **Untouched** — only consumed by `app/docs/layout.tsx` after the home layout replacement.
- `apps/web/app/docs/layout.tsx` — Docs layout. **Untouched.**
- `apps/web/app/(home)/mesa-preview/page.tsx` — S01 temporary preview. **Deleted** after mesa is integrated into the real page.

## Constraints

- **fumadocs CSS imports must stay** — `@import "fumadocs-ui/css/neutral.css"` and `preset.css` in `globals.css` provide theme tokens for the `/docs` route. New brand tokens are additive, not replacements.
- **fumadocs `RootProvider` must stay** in root layout — it provides theme/context for docs pages.
- **`"use client"` isolation** — Only `AsciiMesa`, `CopyInstall`, and the new `LocalTime` nav component are client components. Everything else in the landing page should be RSC.
- **No scroll-triggered animations** — Brand doc section 6 explicitly states "No scroll-triggered animations. Content is present when scrolled to — no fade-in, no slide-up. Brutalist = immediate presence." Remove all `animate-fade-up` / `animate-fade-in` usage.
- **268 test baseline** — All tests are in `packages/*`. `pnpm run test` must still pass 268.
- **`next build` must exit 0** — TypeScript strict mode, no type errors.
- **Google Fonts only** — Familjen Grotesk (900 weight), Instrument Sans (400, 500, 600), JetBrains Mono (400, 500). Import names: `Familjen_Grotesk`, `Instrument_Sans`, `JetBrains_Mono`.
- **Vercel deploy config unchanged** — D063: `rootDirectory: apps/web`, auto-deploys on push. No CLI needed; deploy triggers from git push.
- **OG image font limitation** — `next/font/google` does NOT work inside `ImageResponse`. Must load font as ArrayBuffer via `readFile` from a bundled `.ttf` file or `fetch` from Google Fonts API URL. Bundling a `.ttf` is more reliable (no runtime HTTP call during build).
- **`--color-amber` (#C4862A) accessibility** — Only WCAG AA for large text (≥18px). Don't use amber on small body text or as the only distinguishing color for interactive states.
- **No animation libraries** — Pure CSS transitions (150ms ease for hover/focus per brand doc) + `requestAnimationFrame` for the mesa canvas only.
- **Tailwind v4 `@theme inline`** — Custom CSS variables go in the `@theme inline` block. Brand tokens coexist with fumadocs tokens. The `font-display`, `font-body`, `font-mono` utility classes resolve from `--font-display`, `--font-body`, `--font-mono` variables automatically in Tailwind v4.

## Common Pitfalls

- **fumadocs CSS variable collision** — fumadocs `neutral.css` and `preset.css` define their own CSS variables (e.g., `--fd-foreground`, `--fd-background`). Our brand variables use the `--color-*` namespace which avoids collision. But overriding `body` background to `#FAFAF8` will affect the docs pages too unless scoped. **Avoid:** Apply `--color-bg` as background only on the `(home)` route group layout wrapper, not on `body`. Let fumadocs control its own background for `/docs`.
- **`font-display` variable name collision with Tailwind** — The current `globals.css` already maps `--font-display` to Instrument Serif. We're changing it to Familjen Grotesk. The Tailwind utility `font-display` will then resolve to the new font. **Just replace it** — no collision issue, but make sure to update the variable's value in `@theme inline` and remove the old `--font-instrument` reference.
- **Hydration mismatch on local time** — `new Date().toLocaleTimeString()` differs between SSR and client. **Avoid:** Make the `LocalTime` component `"use client"` with `useState` + `useEffect` to render time only client-side. Show a placeholder on SSR (e.g., `--:--:--`).
- **SVG annotation lines on mobile** — Absolute-positioned SVG coordinates don't scale to mobile. **Avoid:** Hide annotation lines + data cards below `lg` breakpoint. On mobile, mesa + headline stand alone.
- **OG image build failure from missing font file** — If the `.ttf` isn't at the expected path, `readFile` throws during `next build`. **Avoid:** Download the font file and commit it to `apps/web/assets/`. Verify path with `process.cwd()` (which is `apps/web` in the Vercel build context per D063 rootDirectory).
- **Ticker marquee janky restart** — A single `translateX(-100%)` to `0%` animation shows a gap. **Avoid:** Duplicate the ticker content and animate `translateX(0)` to `translateX(-50%)` for seamless loop.
- **Mesa z-index layering** — Mesa canvas must be behind headline text. **Avoid:** Use `relative` on the hero container, `absolute` + `z-0` on the mesa wrapper, `relative z-10` on the text content.
- **`CopyInstall` styling mismatch** — Current component uses `fd-*` color tokens (fumadocs). These still work because fumadocs CSS is imported, but they produce the fumadocs dark theme colors. **Avoid:** Restyle `CopyInstall` to use brand tokens or keep it as-is if the dark terminal-style look fits the new design (it does — dark code blocks on white background is consistent with brutalist aesthetic).
- **Familjen Grotesk weight 900 rendering** — If the font doesn't load at weight 900, the fallback stack (`Arial Narrow`, etc.) won't match visually. `font-display: block` hides text until the font loads. For the OG image, the bundled `.ttf` guarantees the exact weight is available.

## Open Risks

- **Familjen Grotesk visual impact at 900** — The brand doc notes this font is "rather narrow" with weight range 100–900. At 900 it should be dense enough for the brutalist display headline, but visual verification is required in the browser at actual sizes. If insufficient, alternatives (Oswald 700, Bebas Neue) are available on Google Fonts. Retired by S02 when the live page renders.
- **fumadocs theme bleeding into home page** — fumadocs `neutral.css` and `preset.css` set global CSS variables. The home layout needs its own background/text colors that don't interfere with docs. If fumadocs' dark mode toggle affects the home page, we may need to explicitly set light-mode-only variables in the `(home)` scope. Risk is low — fumadocs scopes most variables to its layout components.
- **Annotation line visual precision** — Static SVG coordinates for 3–5 annotation lines connecting to the mesa must look intentional, not arbitrary. Getting the exact positions right requires iterating in the browser. Plan for 2–3 visual adjustment passes.
- **Google Fonts TTF file for OG image** — Need to download Familjen Grotesk 900 as a `.ttf` file. Google Fonts API provides `.woff2` by default. The Google Fonts helper URL `https://fonts.google.com/download?family=Familjen+Grotesk` provides a zip with all weights as `.ttf`. Alternatively, the font file URL can be extracted from the Google Fonts CSS API response. Satori (the renderer behind `ImageResponse`) supports `.ttf` and `.woff` but NOT `.woff2`.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Frontend UI/design | `frontend-design` | installed (local at `~/.gsd/agent/skills/frontend-design/SKILL.md`) |
| Vercel deployment | `sickn33/antigravity-awesome-skills@vercel-deployment` | available (879 installs) — not needed, deploy is just a git push |
| Next.js App Router | `wshobson/agents@nextjs-app-router-patterns` | available (8.4K installs) — not needed, patterns are standard and well-covered by docs |

No additional skills needed. The installed `frontend-design` skill covers the page design work.

## Sources

- `next/font/google` multiple font CSS variable pattern — confirmed working with `Familjen_Grotesk`, `Instrument_Sans`, `JetBrains_Mono` import names (source: [Next.js font docs](https://nextjs.org/docs/app/api-reference/components/font))
- `ImageResponse` custom font loading — use `readFile` from `node:fs/promises` to load `.ttf` as ArrayBuffer, pass in `fonts` option. Satori supports `.ttf` and `.woff` only (not `.woff2`) (source: [Next.js ImageResponse docs](https://nextjs.org/docs/app/api-reference/functions/image-response))
- Tailwind v4 `@theme inline` — CSS variables defined in `@theme inline` block auto-generate utility classes. `--font-display` → `font-display` utility (source: established D057 pattern + Tailwind v4 docs)
- CSS marquee animation — duplicate content + `translateX(0)` to `translateX(-50%)` with `infinite linear` for seamless loop (source: standard CSS pattern)
- fumadocs CSS imports — `neutral.css` provides color theme, `preset.css` provides component styles. Both must stay for `/docs` route. They use `--fd-*` namespace, no collision with `--color-*` brand tokens (source: fumadocs-ui CSS source inspection)
- Brand identity spec — all design tokens, component layouts, and spacing values from `~/Desktop/driftless/brand-identity.md` (S01 output)
- Vercel monorepo deploy — `rootDirectory: apps/web`, auto-deploys on push, no CLI needed (source: D063)
