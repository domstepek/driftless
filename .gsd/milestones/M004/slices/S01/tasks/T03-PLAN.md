---
estimated_steps: 5
estimated_files: 2
---

# T03: Deploy to Vercel and verify cross-links

**Slice:** S01 — Landing page + docs site deployed on Vercel
**Milestone:** M004

## Description

Deploy the `apps/web` Next.js application to Vercel and verify that everything works live: landing page, docs, cross-links, search, dark mode, and OG meta tags. This is the operational closure — the slice isn't done until the site is serving real traffic at a Vercel URL.

## Steps

1. Deploy `apps/web` to Vercel — use `vercel` CLI or Vercel dashboard. Configure:
   - Root directory: `apps/web`
   - Build command: `pnpm next build` (or default Next.js)
   - Output directory: `.next`
   - Install command: `pnpm install` (from monorepo root if Vercel auto-detects)
2. Verify landing page loads at the Vercel URL — hero, install command, before/after, all links render
3. Verify `/docs` loads — Quick Start page with fumadocs sidebar, TOC, dark mode toggle, search
4. Test cross-links: landing page "Read the docs" → /docs works, docs sidebar GitHub link works
5. Verify OG meta tags by checking page source at the live URL (or using a link preview tool)
6. Run `pnpm run test` one final time to confirm no regressions (268+ tests)

## Must-Haves

- [ ] Vercel URL serves the landing page at `/`
- [ ] Vercel URL serves docs at `/docs` with Quick Start, sidebar, search
- [ ] Landing page → /docs link works
- [ ] Docs → GitHub link works
- [ ] OG meta tags present in live page source
- [ ] `pnpm run test` at monorepo root → 268+ tests pass

## Verification

- HTTP 200 from Vercel URL at `/` and `/docs`
- Browser loads landing page with all sections visible
- Browser loads `/docs` with fumadocs UI (sidebar, search dialog via Cmd+K, dark mode)
- All navigation links resolve (no 404s)
- `pnpm run test` → 268+ tests pass

## Observability Impact

- **Deploy URL:** After deployment, the Vercel URL is the primary signal — HTTP 200 at `/` and `/docs` confirms the full pipeline is working
- **Future agent inspection:** Check Vercel deployment status via `npx vercel ls` or `npx vercel inspect <url>`. Check live site with `curl -sI <url>` for HTTP status, or browser tools for full rendering
- **Failure visibility:** Vercel deploy errors surface in CLI output with build logs. Post-deploy failures (broken links, missing assets) are visible via browser network tab 404s. OG tag issues visible via `curl -s <url> | grep 'og:'`
- **Redaction:** VERCEL_TOKEN must never be logged or echoed

## Inputs

- `apps/web/` — complete app from T01 + T02
- Vercel account access

## Expected Output

- Live Vercel URL (e.g., `driftless.vercel.app`) serving both landing page and docs
- `apps/web/vercel.json` if custom Vercel configuration was needed
- Confirmed: all cross-links work, OG tags render, docs search functional
