# M007: Pricing Page

**Vision:** A static `/pricing` route that presents Pro and Enterprise "coming soon" tiers in the M006 brand system, reachable from nav and footer — giving curious OSS users a concrete signal that a commercial tier is coming.

## Success Criteria

- `/pricing` loads in-browser and renders two tier cards (Pro, Enterprise) with "COMING SOON" labels in M006 brand styles
- Nav bar shows a `[ PRICING ]` link that routes to `/pricing` via client-side navigation
- Footer includes a Pricing link alongside existing Docs/GitHub/npm links
- `cd apps/web && pnpm next build` exits 0 with no type errors
- `pnpm run test` passes 268 (no regressions to packages/*)

## Key Risks / Unknowns

- None significant. Static page, existing brand tokens, no new dependencies. The Nav/Footer extraction from `page.tsx` into shared components is the only refactor — low risk, verified by build.

## Verification Classes

- Contract verification: `next build` exits 0, `pnpm run test` passes 268
- Integration verification: Vercel deployment live at `driftless-six.vercel.app/pricing`, nav/footer links resolve correctly
- Operational verification: none
- UAT / human verification: none

## Milestone Definition of Done

This milestone is complete only when all are true:

- `/pricing` route exists at `app/(home)/pricing/page.tsx` and renders two tier cards
- Nav and Footer are shared components imported by both landing page and pricing page
- `[ PRICING ]` link in nav and Pricing link in footer both route to `/pricing`
- `cd apps/web && pnpm next build` exits 0
- `pnpm run test` passes 268
- Push to main triggers Vercel deployment; `driftless-six.vercel.app/pricing` renders correctly

## Requirement Coverage

- Covers: none directly (no active requirements map to M007)
- Partially covers: R021 (extends the marketing site surface with a new route; R021 already validated in M004)
- Leaves for later: R025 (Claude-first constraint — unrelated to this milestone)
- Orphan risks: none

## Slices

- [ ] **S01: Pricing page with nav/footer integration** `risk:low` `depends:[]`
  > After this: user navigates to `driftless-six.vercel.app/pricing` and sees Pro + Enterprise "coming soon" tier cards styled in M006 brand; `[ PRICING ]` link is in the nav bar and footer

## Boundary Map

### S01 (only slice)

Produces:
- `components/nav.tsx` — extracted Nav component, importable by any `(home)` page
- `components/footer.tsx` — extracted Footer component, importable by any `(home)` page
- `app/(home)/pricing/page.tsx` — static pricing page with two tier cards
- `[ PRICING ]` nav link and footer Pricing link wired to `/pricing`

Consumes:
- `app/(home)/page.tsx` — existing Nav/Footer inline functions (extracted, not modified in behavior)
- `globals.css` — M006 brand tokens (`--color-amber`, `--color-surface`, `--color-border`, `--font-display`, `--font-mono`, `--font-body`)
- `components/local-time.tsx` — client component used by Nav
