---
id: T02
parent: S02
milestone: M006
provides:
  - Brutalist OG image with Familjen Grotesk 700 loaded as TTF ArrayBuffer
  - Font asset at apps/web/assets/FamiljenGrotesk-Bold.ttf for Satori/ImageResponse
  - mesa-preview temporary route removed
key_files:
  - apps/web/app/opengraph-image.tsx
  - apps/web/assets/FamiljenGrotesk-Bold.ttf
key_decisions:
  - "Familjen Grotesk weight 700 (not 900) — Google Fonts only serves 700 as the boldest TTF for this family"
  - "Font loaded via readFile from assets/ dir — Satori requires TTF ArrayBuffer, next/font/google unavailable in ImageResponse context"
patterns_established:
  - "OG image font loading: readFile(join(process.cwd(), 'assets', 'Font.ttf')) passed to ImageResponse fonts array"
observability_surfaces:
  - "next build — OG image generation included in static page generation; font load failure surfaces as ENOENT build error"
  - "Browser DevTools: meta[property='og:image'] → /opengraph-image route serves PNG"
duration: 12m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Rebuild OG image, download font asset, clean up mesa-preview, and deploy to Vercel

**Rebuilt OpenGraph image with brutalist B&W + amber brand, downloaded Familjen Grotesk TTF for Satori, deleted mesa-preview scaffold, pushed to trigger Vercel deploy.**

## What Happened

Downloaded Familjen Grotesk Bold (weight 700) TTF from Google Fonts gstatic CDN and saved to `apps/web/assets/FamiljenGrotesk-Bold.ttf`. The font CSS API (with a TTF-requesting user-agent) provided the direct gstatic URL.

Rebuilt `opengraph-image.tsx` with the brutalist brand system: white background `#FAFAF8`, dark text `#0A0A0A`, amber accent `#C4862A`. Layout: brand name top-left with amber square dot and monospace-style uppercase tracking, condensed two-line headline center ("YOUR E2E TESTS / BECOME TRAINING DOCS" with amber on second half), framework list bottom in uppercase with amber dot separators. Font loaded as ArrayBuffer via `readFile` and passed to `ImageResponse` fonts config. The existing `twitter-image.tsx` re-exports automatically.

Deleted `apps/web/app/(home)/mesa-preview/page.tsx` and its directory — S01 temporary scaffolding no longer needed since the mesa is integrated in the real page.

Pushed branch `gsd/M006/S02` to trigger Vercel deployment.

## Verification

- `cd apps/web && pnpm next build` — exits 0, all 12 routes generated including `/opengraph-image` and `/twitter-image`
- `pnpm run test` — 268 tests pass
- Browser: `driftless-six.vercel.app` loads with new brutalist design — condensed headline, amber accents, features section, ticker, footer all present
- Browser: `driftless-six.vercel.app/docs` — fumadocs renders correctly with sidebar navigation, "On this page" ToC, code blocks
- Browser: `og:image` meta tag present pointing to `/opengraph-image`, `twitter:image` pointing to `/twitter-image`
- Satori `display: flex` constraint: first build attempt failed because a div had mixed text + span children without explicit `display: flex`. Fixed by wrapping "BECOME" and "TRAINING DOCS" in separate spans inside a flex div.

### Slice-Level Verification

| Check | Result |
|---|---|
| `cd apps/web && pnpm next build` exits 0 | ✅ |
| `pnpm run test` — 268 pass | ✅ |
| Browser: landing page loads with new design | ✅ |
| Browser: `/docs` renders with sidebar | ✅ |
| Browser: OG meta tags present | ✅ |

All slice verification checks pass. This is the final task of S02.

## Diagnostics

- **OG image inspection**: Fetch `/opengraph-image` directly — returns `image/png` with brutalist layout. Build log confirms successful static generation.
- **Font verification**: `file apps/web/assets/FamiljenGrotesk-Bold.ttf` → "TrueType Font data, 16 tables". If font path breaks, build fails with `ENOENT` at the `readFile` call.
- **mesa-preview deletion**: `ls apps/web/app/(home)/mesa-preview` → no such directory. Build confirms no dangling imports.

## Deviations

- Satori requires explicit `display: flex` on every div with multiple children. The "BECOME TRAINING DOCS" line was restructured from mixed text+span to two spans in a flex div. Minor implementation detail, not a plan deviation.

## Known Issues

None.

## Files Created/Modified

- `apps/web/assets/FamiljenGrotesk-Bold.ttf` — Familjen Grotesk Bold (700) TTF font for OG image generation
- `apps/web/app/opengraph-image.tsx` — Rebuilt with brutalist brand: white bg, dark text, amber accent, custom font
- `apps/web/app/(home)/mesa-preview/page.tsx` — Deleted (S01 temporary scaffolding)
- `.gsd/milestones/M006/slices/S02/tasks/T02-PLAN.md` — Added Observability Impact section (pre-flight fix)
