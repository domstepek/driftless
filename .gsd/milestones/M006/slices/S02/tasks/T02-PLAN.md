---
estimated_steps: 5
estimated_files: 3
---

# T02: Rebuild OG image, download font asset, clean up mesa-preview, and deploy to Vercel

**Slice:** S02 — Landing Page Rebuild + Vercel Deploy
**Milestone:** M006

## Description

Rebuild the OpenGraph image to match the new brutalist brand (white bg, dark text, amber accent, Familjen Grotesk display font). The OG image requires loading the font as a TTF ArrayBuffer because `next/font/google` doesn't work inside `ImageResponse`. Download the font file and commit it to `apps/web/assets/`. Delete the temporary `mesa-preview` route from S01. Push to trigger Vercel deployment and verify the live site.

## Steps

1. **Download Familjen Grotesk TTF** — Get the font file from Google Fonts (the download zip contains all weights as `.ttf`). Extract weight 700 or 900 (boldest available in TTF). Save to `apps/web/assets/FamiljenGrotesk-Bold.ttf`. Satori (ImageResponse renderer) supports `.ttf` and `.woff` but NOT `.woff2`.

2. **Rebuild `opengraph-image.tsx`** — White background `#FAFAF8`, dark text `#0A0A0A`, amber accent `#C4862A`. Load Familjen Grotesk via `readFile(join(process.cwd(), 'assets/FamiljenGrotesk-Bold.ttf'))`. Layout: brand name top-left in mono style, condensed headline center "YOUR E2E TESTS BECOME TRAINING DOCS" in display font, framework list bottom, minimal — no gradients, no rounded logos. Keep `alt`, `size`, `contentType` exports. `twitter-image.tsx` re-exports automatically.

3. **Delete mesa-preview** — Remove `apps/web/app/(home)/mesa-preview/page.tsx` and its directory. This was S01 temporary scaffolding; the mesa is now integrated in the real page.

4. **Build verification** — Run `cd apps/web && pnpm next build` to verify OG image generates correctly with the font (build-time rendering). Run `pnpm run test` to confirm 268 pass.

5. **Deploy and verify** — Git push to the branch. Vercel auto-deploys from `apps/web` (D063). After deploy completes: verify `driftless-six.vercel.app` loads with new design (condensed headline, mesa, ticker visible). Verify `driftless-six.vercel.app/docs` renders fumadocs docs site correctly with sidebar navigation.

## Must-Haves

- [ ] Font TTF file committed at `apps/web/assets/FamiljenGrotesk-Bold.ttf`
- [ ] OG image uses brutalist B&W + amber aesthetic with Familjen Grotesk loaded as ArrayBuffer
- [ ] `mesa-preview` route and directory deleted
- [ ] `cd apps/web && pnpm next build` exits 0
- [ ] `pnpm run test` passes 268
- [ ] Vercel deployment live at `driftless-six.vercel.app` with new design
- [ ] fumadocs `/docs` site renders correctly on the live deployment

## Verification

- `cd apps/web && pnpm next build` — exits 0 (OG image generation included in build)
- `pnpm run test` — 268 tests pass
- Browser: `driftless-six.vercel.app` — new brutalist design loads (check for condensed headline, mesa canvas, amber CTA)
- Browser: `driftless-six.vercel.app/docs` — fumadocs docs site renders with sidebar
- Browser: check OG meta tag `og:image` resolves to `/opengraph-image`

## Observability Impact

- **OG image generation**: `next build` renders OG images at build time — build log shows success/failure for image route generation. A missing or corrupt font file causes a build-time error with a clear stack trace pointing at the `readFile` call.
- **Font loading**: If the TTF path is wrong or file is missing, `readFile` throws `ENOENT` — visible in build output immediately.
- **mesa-preview deletion**: Route removal is verified by `next build` — no dangling imports. If anything still references the route, the build fails with a module-not-found error.
- **Deployment**: Vercel deployment logs show build success/failure. The live site's `og:image` meta tag and the `/opengraph-image` route are inspectable via browser DevTools or `curl -I`.
- **Inspection**: Future agent can verify OG image by checking `<meta property="og:image">` in page source, or fetching `/opengraph-image` directly to confirm it returns `image/png`.

## Inputs

- `apps/web/app/opengraph-image.tsx` — current OG image to rebuild
- `apps/web/app/(home)/page.tsx` — T01 output confirming page is complete
- Brand identity doc — color values for OG image (`#FAFAF8`, `#0A0A0A`, `#C4862A`)
- S01 mesa-preview route at `apps/web/app/(home)/mesa-preview/page.tsx` — to delete

## Expected Output

- `apps/web/assets/FamiljenGrotesk-Bold.ttf` — font file for OG image generation
- `apps/web/app/opengraph-image.tsx` — rebuilt with brutalist aesthetic and custom font
- `apps/web/app/(home)/mesa-preview/` — deleted
- Live deployment at `driftless-six.vercel.app` with complete new brand design
