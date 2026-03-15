# S02: Landing Page Rebuild + Vercel Deploy — UAT

**Milestone:** M006
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed
- Why this mode is sufficient: Contract checks (build, tests) are artifact-driven; visual design review and deployment verification require live-runtime browser checks; brand aesthetic quality requires human judgment

## Preconditions

- Vercel deployment is live at `driftless-six.vercel.app`
- No local dev server required — all checks run against the production deployment
- Brand identity doc exists at `~/Desktop/driftless/brand-identity.md` for reference

## Smoke Test

1. Open `https://driftless-six.vercel.app` in a browser
2. **Expected:** Page loads with light background (`#FAFAF8`), dark text, amber (`#C4862A`) accents visible on headline and labels. No console errors.

## Test Cases

### 1. Build and test suite pass

1. Run `cd apps/web && pnpm next build`
2. **Expected:** Exits 0, compiles 12 routes including `/opengraph-image` and `/twitter-image`
3. Run `pnpm run test`
4. **Expected:** 268 tests pass across 14 files, zero failures

### 2. Brand token system applied

1. Open `https://driftless-six.vercel.app` in browser DevTools
2. Run `getComputedStyle(document.documentElement).getPropertyValue('--color-bg')` in console
3. **Expected:** Returns `#FAFAF8`
4. Run `getComputedStyle(document.documentElement).getPropertyValue('--color-amber')` in console
5. **Expected:** Returns `#C4862A`
6. Run `getComputedStyle(document.documentElement).getPropertyValue('--color-text')` in console
7. **Expected:** Returns `#0A0A0A`

### 3. Three Google Fonts loaded

1. Open `https://driftless-six.vercel.app`, open DevTools Network tab, filter by "font"
2. **Expected:** Three font families loaded: Familjen Grotesk, Instrument Sans, JetBrains Mono
3. Run `document.fonts.check('700 16px Familjen Grotesk')` in console
4. **Expected:** Returns `true`

### 4. Hero section with ASCII mesa

1. Open `https://driftless-six.vercel.app`
2. **Expected:** Hero section visible with condensed display headline "Your e2e tests become training docs." — "training docs." rendered in amber
3. **Expected:** "Automatically." visible in light gray below headline
4. Look for a `<canvas>` element in the hero area (DevTools Elements)
5. **Expected:** Canvas element present (ASCII mesa component mounted via dynamic import)

### 5. How-it-works section

1. Scroll past the hero
2. **Expected:** "HOW IT WORKS" label in amber monospace, "From test to doc in seconds" headline
3. **Expected:** Side-by-side code comparison showing a test file (`.spec.ts`) and generated doc (`.md`)

### 6. Feature cards section

1. Continue scrolling
2. **Expected:** "Built for the way you ship" heading with numbered feature cards (Framework Agnostic, Always In Sync, Composable Capabilities, Multiple Doc Targets)
3. **Expected:** Each card has an amber number, title, and description

### 7. Framework ticker / works-with section

1. Continue scrolling
2. **Expected:** "WORKS WITH" section listing supported test frameworks: Playwright, Cypress, TestCafe, Detox, WebDriverIO, Nightwatch

### 8. Footer

1. Scroll to bottom
2. **Expected:** Footer with links to Docs, GitHub, npm
3. **Expected:** "MIT © 2026 Dom Stepek" copyright line

### 9. Fumadocs docs site unchanged

1. Navigate to `https://driftless-six.vercel.app/docs`
2. **Expected:** fumadocs documentation renders with sidebar navigation showing Quick Start and other doc pages
3. **Expected:** "On this page" table of contents on the right side
4. **Expected:** Code blocks render with syntax highlighting
5. Click sidebar link to navigate between docs pages
6. **Expected:** Navigation works, content loads without errors

### 10. OG meta tags present

1. On the landing page, open DevTools and inspect `<head>`
2. Check `meta[property="og:image"]`
3. **Expected:** Points to `/opengraph-image` (full URL: `https://driftless.dev/opengraph-image...`)
4. Check `meta[name="twitter:image"]` or `meta[property="twitter:image"]`
5. **Expected:** Points to `/twitter-image`
6. Fetch `https://driftless-six.vercel.app/opengraph-image` directly
7. **Expected:** Returns a PNG image with brutalist design — white background, dark text, amber accent

### 11. mesa-preview route removed

1. Navigate to `https://driftless-six.vercel.app/mesa-preview`
2. **Expected:** 404 page (route no longer exists)

## Edge Cases

### prefers-reduced-motion pauses mesa animation

1. Open Chrome DevTools → Rendering → check "Emulate prefers-reduced-motion: reduce"
2. Reload `https://driftless-six.vercel.app`
3. **Expected:** ASCII mesa canvas is present but animation is paused (static frame)

### Tab visibility pauses mesa animation

1. Open `https://driftless-six.vercel.app`, verify mesa is animating
2. Switch to a different browser tab, wait 3 seconds, switch back
3. **Expected:** Animation resumes from where it paused (no frame jump or accumulated rotation)

### Responsive: annotation cards hidden below lg

1. Resize browser to mobile width (<1024px)
2. **Expected:** Annotation data cards in the hero are hidden; headline and mesa still visible
3. Resize back to desktop width (≥1024px)
4. **Expected:** Annotation cards reappear

## Failure Signals

- `next build` fails with type errors → import paths or type mismatches in modified files
- Fonts render as fallback (serif/system) → `next/font/google` configuration broken, check layout.tsx font variable classes on `<html>`
- OG image returns 500 → font TTF file missing from `apps/web/assets/` or path calculation wrong in opengraph-image.tsx
- Mesa not visible → `mesa-canvas.tsx` dynamic import failing silently, check browser console for chunk load errors
- `/docs` broken → fumadocs layout or source config disturbed, check `app/docs/layout.tsx` still imports DocsLayout
- CSS variables undefined → `globals.css` `@theme inline` block malformed, check `:root` computed styles

## Requirements Proved By This UAT

- R021 — Vercel landing page (re-executed with new brand direction; original validation was M004/S01)

## Not Proven By This UAT

- Visual design quality assessment against sutera.ch reference — requires human aesthetic judgment beyond automated checks
- Social sharing OG image rendering — requires posting a link on Twitter/Slack to verify unfurling (OG route serves image correctly, but social platform caching behavior varies)
- Performance under load — Vercel handles this; not a driftless concern
- Custom domain mapping — `driftless.dev` not yet configured; meta tags reference it but Vercel URL works

## Notes for Tester

- The fumadocs search bar and theme toggle are visible in the landing page nav — this is the `RootProvider` from fumadocs-ui wrapping the entire app. The custom brand nav elements (brand name, sections) are present below it. This is a known visual artifact of sharing a root layout between the marketing page and docs site.
- Familjen Grotesk renders at weight 700 (not 900 as the brand doc specifies) because Google Fonts doesn't offer weight 900. The condensed letterforms are still visually dense but may appear slightly lighter than the original design intent.
- The OG image URL in meta tags references `driftless.dev` (custom domain) but the image is accessible via the Vercel URL at `/opengraph-image`.
