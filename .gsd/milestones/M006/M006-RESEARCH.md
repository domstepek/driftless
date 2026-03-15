# M006: Brand Identity + Landing Page Revamp — Research

**Date:** 2026-03-15

## Summary

M006 replaces the M004 editorial-serif landing page with a brutalist-technical-white aesthetic modeled on sutera.ch. The work breaks into three distinct slices: a brand identity document (design spec only, no code), a spinning ASCII mesa hero component (pure Canvas 2D math, no 3D libs), and a full landing page rebuild in `apps/web`. The existing codebase is well-structured for this — the `(home)` route group is isolated from the `/docs` fumadocs site, and all landing page code lives in a single `page.tsx` + `layout.tsx` + `globals.css` surface area. No packages/* code changes needed.

The highest-risk slice is the ASCII mesa component. 3D-to-2D projection with per-frame character selection is a solved problem (donut.c algorithm), but adapting it to a mesa/plateau geometry (flat top, sloped sides, strata layers) rather than a torus is novel. Canvas 2D `fillText` for character rendering is well-supported but performance on integrated GPUs at 30fps needs testing early. The second risk is font loading — swapping from one Google Font (Instrument Serif) to three (Familjen Grotesk, Instrument Sans, JetBrains Mono) with `font-display: block` on the display font will cause a brief invisible-text period on the hero. This is acceptable for a landing page but must be tested.

The recommendation is: **S01 (brand doc) → S02 (ASCII mesa component) → S03 (landing page + deploy)**. S01 is pure spec writing with no code risk. S02 proves the hardest technical unknown (the animation) in isolation before S03 integrates everything. S03 is the largest slice (full page rebuild, font swap, OG image, deploy) but has the lowest uncertainty once S01 and S02 exist.

## Recommendation

Prove the ASCII mesa component first (after the brand doc locks design tokens). The mesa is the visual centerpiece and the only piece with real technical risk. Build it standalone with a local dev preview, then integrate into the landing page rebuild. Do not attempt the landing page rebuild without a working mesa — if the animation doesn't work or performs poorly, it changes the entire hero section design.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| 3D rotation math | Standard rotation matrix (Rx, Ry, Rz) from donut.c technique | Well-documented, single formula. No need for custom quaternion or matrix library. ~20 lines of trig. |
| Font loading/optimization | `next/font/google` with `variable` + `font-display` options | Already used for Instrument Serif (D062). Handles preload, self-hosting, and CSS variable injection. Swap to new fonts is a config change. |
| CSS design tokens | Tailwind v4 `@theme inline` in `globals.css` | Established pattern (D057). New brand tokens go here: colors, type scale, spacing. No JS config needed. |
| Dynamic import with SSR disabled | `next/dynamic` with `{ ssr: false }` | Standard Next.js pattern for client-only Canvas/WebGL components. Prevents hydration mismatch. |
| Reduced motion handling | `window.matchMedia('(prefers-reduced-motion: reduce)')` | Browser-native. No library needed. Check once on mount, add listener for changes. |
| Tab visibility detection | `document.visibilitychange` event | Browser-native. Pause animation when tab is hidden to save CPU. |
| Monospace character rendering | Canvas 2D `ctx.fillText` with monospace font | Each character is a fixed-width cell. No complex text layout needed. `measureText` once for cell size, then grid-align. |
| Ticker/marquee animation | CSS `@keyframes` + `translateX` with infinite loop | Pure CSS, no JS. Duplicate content for seamless loop. Already pattern-adjacent to the `animate-fade-up` keyframes in `globals.css`. |
| SVG annotation lines | Static `<svg>` with `<line>` / `<path>` elements, absolute-positioned | Context doc's recommendation. Responsive via viewBox + CSS positioning. No dynamic computation needed for a layout that changes only at breakpoints. |

## Existing Code and Patterns

- `apps/web/app/(home)/page.tsx` — Current 420-line landing page. Fully replaced in S03. Contains local presentational components (CodeWindow, FeatureRow, TestCode, DocCode) and the page layout. All RSC, only `CopyInstall` is client-side. Good pattern: section-by-section structure with dividers.
- `apps/web/app/(home)/layout.tsx` — Uses fumadocs `HomeLayout` with `baseOptions()`. This wrapper stays but may need font/nav customization for the new brand. The `baseOptions()` function in `lib/layout.shared.tsx` controls nav title and GitHub URL — both shared with docs layout.
- `apps/web/app/globals.css` — 56 lines. `@theme inline` block with one font variable (`--font-display`), three keyframe animations, and three utility classes. Completely rebuilt in S03 with new brand tokens (3 font variables, color system, expanded type scale, spacing scale, new animations).
- `apps/web/app/layout.tsx` — Root layout. Currently loads Instrument Serif only. Must be updated to load 3 fonts (Familjen Grotesk, Instrument Sans, JetBrains Mono) with CSS variables. Metadata (`<title>`, OG tags) updated for new brand.
- `apps/web/app/opengraph-image.tsx` — Dynamic OG image (118 lines). Uses inline styles (no Tailwind in `ImageResponse`). Rebuilt in S03 with new brand visual: B&W + amber, condensed type.
- `apps/web/app/twitter-image.tsx` — Re-exports OG image. No change needed.
- `apps/web/components/copy-install.tsx` — Client component. Reused in S03 (install command doesn't change), but styling may need adaptation for new design system.
- `apps/web/lib/layout.shared.tsx` — `baseOptions()` returns nav title + GitHub URL. The new brand nav is custom (brand name left, center CTA pill, local time right) — this may need to bypass or heavily customize the fumadocs `HomeLayout` nav. Key decision: whether to keep `HomeLayout` wrapper or replace with a custom layout for `(home)`.
- `apps/web/lib/source.ts` — Docs source loader. Untouched.
- `apps/web/app/docs/` — Entire docs route group. Untouched.
- `apps/web/package.json` — No new dependencies needed. Canvas 2D and SVG are browser-native. All three Google Fonts are available via `next/font/google` (already a Next.js built-in).

## Constraints

- **Node 20 runtime** — Current environment is Node v20.19.5. pnpm warns about wanting >=22.12.0 but everything works. No Node 22+ features needed for this milestone.
- **Tailwind v4 CSS-first only** (D057) — All design tokens in `@theme inline`. No `tailwind.config.js`. Custom colors, fonts, spacing go through CSS custom properties.
- **No third-party 3D libraries** — Three.js, Babylon.js, etc. are explicitly out of scope. ASCII renderer is math + Canvas 2D `fillText`. This keeps the bundle small and avoids a heavy dependency for a single visual element.
- **No animation libraries** — No Framer Motion, GSAP, or similar. Pure CSS transitions + `requestAnimationFrame` for the canvas.
- **`"use client"` isolation** — Only the ASCII mesa component and the `CopyInstall` button are client components. Everything else in the landing page should be RSC.
- **fumadocs `HomeLayout` wrapper** — Currently used for `(home)` route. The new nav design (brand name left, CTA pill center, local time right) is custom and likely incompatible with fumadocs' default `HomeLayout` nav. Options: (a) replace `HomeLayout` with a custom layout for `(home)` only, (b) pass custom nav config to `HomeLayout`. Option (a) is cleaner since the new design has nothing in common with the fumadocs nav pattern.
- **268 test baseline** — All tests are in `packages/*`. No tests touch `apps/web`. The constraint is `pnpm run test` must still pass 268 (no regressions), not that we need new tests for the landing page.
- **`next build` must exit 0** — TypeScript strict mode, no type errors in the new components.
- **Google Fonts only** — Familjen Grotesk (variable, 100–900), Instrument Sans (variable), JetBrains Mono (variable). All confirmed available on Google Fonts and importable via `next/font/google` as `Familjen_Grotesk`, `Instrument_Sans`, `JetBrains_Mono`.
- **Vercel deploy config** — D063: `rootDirectory: apps/web`, `framework: nextjs`, `installCommand: pnpm install`, `buildCommand: next build`. No changes needed to deploy config.

## Common Pitfalls

- **Canvas font rendering inconsistency** — Canvas 2D `fillText` uses the page's font stack, but monospace character width can vary across browsers if the font isn't loaded when the canvas initializes. **Avoid:** Preload JetBrains Mono via `next/font/google`, wait for `document.fonts.ready` before first render, and measure character cell size with `ctx.measureText('M')` at startup.
- **`font-display: block` causing invisible hero text** — The hero headline in Familjen Grotesk 900 won't render until the font loads. On slow connections this could be 2-3 seconds of blank space. **Avoid:** Use `font-display: block` only for the display font. Use `swap` for body and mono fonts. Accept the brief blank — it's a landing page, not a SaaS app where perceived speed matters for retention.
- **Hydration mismatch on `new Date()` in nav** — The local time display (`new Date().toLocaleTimeString()`) will differ between server render and client render. **Avoid:** Either make the time component client-only (wrap in `"use client"` with `useEffect`), or suppress hydration warning on that specific element. Client-only is cleaner.
- **SVG annotation lines breaking on mobile** — Hardcoded SVG coordinates for annotation lines won't scale to mobile viewports. **Avoid:** Hide annotation lines below tablet breakpoint (`lg:` prefix). On mobile, the mesa and headline stand alone. Don't try to make annotation lines responsive — they're a desktop visual feature.
- **Canvas sizing on high-DPI displays** — Canvas looks blurry on Retina/HiDPI if not sized correctly. **Avoid:** Set canvas width/height to `element.clientWidth * devicePixelRatio` and scale the context accordingly. Standard pattern.
- **Mesa geometry complexity** — A torus (donut.c) has a simple parametric equation. A mesa/plateau is a multi-surface shape (flat top, 4 sloped sides, optional strata bands). Over-specifying the geometry leads to a rat's nest of edge cases. **Avoid:** Model the mesa as a simple truncated pyramid (6 faces: top, 4 sides, no bottom since it's below viewport). Use line segments for edges, dot-fill for surfaces. Two-pass render: fill layer, then wireframe on top.
- **fumadocs HomeLayout nav override** — Trying to customize fumadocs' `HomeLayout` nav to match the brutalist design will fight the framework. **Avoid:** Replace `HomeLayout` with a plain `<div>` wrapper for the `(home)` route group. The fumadocs nav is only needed for `/docs`. The `(home)` layout gets its own custom nav component.
- **OG image font limitations** — `next/og` `ImageResponse` doesn't support `next/font/google`. Fonts must be loaded as ArrayBuffer from a URL or bundled file. **Avoid:** For the OG image, either load Familjen Grotesk from Google Fonts API URL at build time, or use a system font that approximates the look. The OG image is a stylized card — close enough is fine.

## Open Risks

- **Familjen Grotesk at weight 900 may not look "ultra-bold condensed"** — The context doc describes it as "Black" but Google Fonts lists it as a variable font 100–900 with "rather narrow" proportions. Weight 900 exists but the visual impact needs to be verified in-browser before committing to the design. If it's not impactful enough, alternatives: use all-caps + letter-spacing to emphasize it, or swap to a different condensed grotesque (e.g., Oswald, Bebas Neue — both on Google Fonts).
- **Canvas 2D `fillText` performance at 30fps** — Each frame renders ~2000-5000 characters via `fillText`. On modern hardware this is fine, but on older integrated GPUs (Intel HD 4000 era) it may stutter. The 30fps cap helps but needs real testing. Fallback: render to an offscreen canvas at half resolution and scale up.
- **Animation loop causing battery drain on mobile** — Even at 30fps, a perpetual `requestAnimationFrame` loop consumes battery. The tab-visibility pause helps, but the animation also runs when the tab is visible but the user isn't looking at the hero (scrolled past). Consider adding an IntersectionObserver to pause when the mesa is off-screen.
- **Brand doc scope creep** — The brand identity document has an extensive spec list (color system, 7-step type scale, spacing system, animation spec, component catalog, reference analysis). If treated as a pixel-perfect design system document, S01 could take longer than the code slices. Keep it focused on what S02 and S03 actually need: token values, font choices, color hex codes, and a reference screenshot analysis. Not a 40-page brand manual.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Frontend UI/design | `frontend-design` | installed (local at `~/.gsd/agent/skills/frontend-design/SKILL.md`) |
| WebGPU/shader design | `webgpu-design` | installed (local at `~/.gsd/agent/skills/webgpu-design/SKILL.md`) — Canvas 2D is lower-level than WebGPU but the skill's shader math patterns may inform the ASCII projection math |
| Next.js | `timelessco/recollect@nextjs` | available (95 installs) — low install count, probably not needed given `next/font/google` docs are sufficient |
| ASCII art | `jeremylongshore/claude-code-plugins-plus-skills@ascii-art-diagram-creator` | available (32 installs) — too low-signal, the donut.c technique is well-documented |

No external skills needed. The installed `frontend-design` skill covers the landing page design work, and the ASCII mesa is a custom math component that doesn't map to any available skill.

## Sources

- Familjen Grotesk is a variable font (100–900 weight range) on Google Fonts with "rather narrow" proportions — confirmed suitable for condensed display use at weight 900 (source: [Google Fonts](https://fonts.google.com/specimen/Familjen+Grotesk), [Pimp My Type](https://pimpmytype.com))
- Instrument Sans confirmed available on Google Fonts, variable weight with 12 stylistic sets (source: [Google Fonts](https://fonts.google.com/specimen/Instrument+Sans))
- JetBrains Mono confirmed available via `next/font/google` as `JetBrains_Mono` (source: [Next.js docs](https://nextjs.org/docs/app/api-reference/components/font))
- donut.c 3D ASCII rendering technique: parametric surface generation → rotation matrices → perspective projection → luminance-to-character mapping → z-buffer for occlusion (source: [a1k0n.net — donut math](https://www.a1k0n.net/2011/07/20/donut-math.html))
- `next/dynamic` with `{ ssr: false }` for client-only Canvas components — standard Next.js pattern (source: [Next.js lazy loading docs](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading))
- `next/font/google` supports multiple fonts with CSS variable binding and `font-display` control (source: [Next.js font docs](https://nextjs.org/docs/app/api-reference/components/font))
- sutera.ch design patterns observed: local time in nav ("ZUR 03:46 am"), etymology card ("su (underneath) + tera (earth)"), numbered core threads, ticker/marquee ("blueprint reality" repeated), minimal social links, data-dashboard-style status cards (source: [sutera.ch](https://www.sutera.ch))
