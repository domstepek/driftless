# S01: Pricing page with nav/footer integration

**Goal:** Ship a static `/pricing` page with Pro and Enterprise "coming soon" tier cards, linked from nav and footer, using the M006 brand system.
**Demo:** Navigate to `/pricing` in-browser — see two tier cards styled in brutalist-technical-white with amber "COMING SOON" labels. Click `[ PRICING ]` in the nav bar from any `(home)` page.

## Must-Haves

- Nav and Footer extracted from `page.tsx` into shared components (behavior-identical refactor)
- `/pricing` route at `app/(home)/pricing/page.tsx` — RSC only, no client components
- Two tier cards: Pro and Enterprise, each with brief positioning copy and "COMING SOON" label
- `[ PRICING ]` bracket-style link in nav bar
- Pricing link in footer alongside existing Docs/GitHub/npm links
- All styling uses existing M006 brand tokens — no new CSS variables
- Amber text only at ≥18px (WCAG AA constraint from research)

## Verification

- `cd apps/web && pnpm next build` exits 0 with `/pricing` in route output
- `pnpm run test` passes 268 (no regressions)
- Landing page at `/` renders identically after Nav/Footer extraction (no visual regression)
- `/pricing` route renders in browser with correct brand styling
- **Diagnostic**: `next build` output contains no `Module not found` or `Cannot find module` errors (grep verification)
- **Failure-path diagnostic**: Verify `next build` stderr contains zero `Module not found` / `Cannot resolve` lines — confirms the build error surface is clean and any future import breakage will produce a clear, greppable error with file path and module name

## Tasks

- [x] **T01: Extract Nav and Footer into shared components** `est:20m`
  - Why: Nav and Footer are inline functions in `page.tsx`. Pricing page needs to import them. Extract first, prove no regression, before adding new content.
  - Files: `apps/web/app/(home)/page.tsx`, `apps/web/components/nav.tsx`, `apps/web/components/footer.tsx`
  - Do: Extract `Nav()` and `Footer()` functions from `page.tsx` into `components/nav.tsx` and `components/footer.tsx`. Export as default or named exports. Update `page.tsx` to import from new locations. Nav component imports `LocalTime` from `components/local-time.tsx`. Footer uses `Link` from `next/link` for internal routes. Ensure all CSS variable references and Tailwind classes transfer correctly.
  - Verify: `cd apps/web && pnpm next build` exits 0, all existing routes still in output. `pnpm run test` passes 268.
  - Done when: Nav/Footer are separate files, `page.tsx` imports them, build passes with zero behavior change.

- [x] **T02: Build the /pricing page with tier cards** `est:25m`
  - Why: The core deliverable — a branded pricing page with Pro and Enterprise "coming soon" sections.
  - Files: `apps/web/app/(home)/pricing/page.tsx`
  - Do: Create `app/(home)/pricing/page.tsx` as a Server Component (no `"use client"`). Structure: import shared Nav and Footer. Section header `[ PRICING ]` in JetBrains Mono with amber color. Headline in Familjen Grotesk 700 (e.g. "BUILT FOR TEAMS THAT SHIP."). Two tier cards with thin 1px `--color-border` borders: **PRO** with positioning line for B2B SaaS teams, **ENTERPRISE** with positioning line for larger orgs/SSO/compliance. Each card has "COMING SOON" label in amber at ≥18px. Below cards: a GitHub note ("We're building in public. Follow along on GitHub.") with link to the repo. Use existing brand tokens only (`--color-amber`, `--color-surface`, `--color-border`, `--font-display`, `--font-mono`, `--font-body`). Reference `~/Desktop/driftless/05-pricing-model.md` for tier positioning copy. No pricing numbers — purely "coming soon."
  - Verify: `cd apps/web && pnpm next build` exits 0 with `/pricing` in route list.
  - Done when: `/pricing` route builds successfully with two styled tier cards.

- [x] **T03: Wire nav/footer links and run full verification** `est:15m`
  - Why: The pricing page must be reachable from navigation. This task wires the links and runs the complete verification suite.
  - Files: `apps/web/components/nav.tsx`, `apps/web/components/footer.tsx`
  - Do: Add `[ PRICING ]` link to Nav — monospace bracket style, `Link` from `next/link` to `/pricing`. Place it in a position that preserves the existing three-zone layout (brand left, center zone, local time right). Consider placing it as a text link near the brand name or as part of the center zone. No active state styling — same treatment as any other link. Add "Pricing" to Footer link row using `Link` to `/pricing`, matching existing link styling (alongside Docs, GitHub, npm). Test at mobile breakpoint — ensure footer doesn't overflow.
  - Verify: `cd apps/web && pnpm next build` exits 0. `pnpm run test` passes 268. Open `/` in browser — confirm `[ PRICING ]` link visible in nav, click it, arrive at `/pricing`. Confirm Footer shows Pricing link. Push to main for Vercel deployment.
  - Done when: Nav and Footer both link to `/pricing`, build passes, tests pass, Vercel deployment live.

## Observability / Diagnostics

- **Build output**: `next build` route manifest confirms all expected routes (/, /pricing, /docs) are present — agent can grep for route paths.
- **Test count**: `pnpm run test` summary line shows pass/fail/total — agent verifies 268 passing.
- **Component import errors**: Build failure with module-not-found errors if extraction breaks import paths — clear error messages with file paths.
- **Visual regression**: Browser comparison of `/` before and after extraction — nav height, footer layout, link targets remain identical.
- **Failure-path check**: If Nav or Footer import fails, `next build` emits a typed error with the missing module path and importing file location. No silent fallback.

## Verification

- `cd apps/web && pnpm next build` exits 0 with `/pricing` in route output
- `pnpm run test` passes 268 (no regressions)
- Landing page at `/` renders identically after Nav/Footer extraction (no visual regression)
- `/pricing` route renders in browser with correct brand styling
- **Diagnostic**: `next build` output contains no `Module not found` or `Cannot find module` errors (grep verification)
- **Failure-path diagnostic**: Intentionally import a non-existent component name in a test file or verify that `next build` stderr contains zero `Module not found` / `Cannot resolve` lines — confirms the build error surface is clean and any future import breakage will produce a clear, greppable error with file path and module name

## Files Likely Touched

- `apps/web/app/(home)/page.tsx` — remove inline Nav/Footer, import from components
- `apps/web/components/nav.tsx` — new: extracted Nav component
- `apps/web/components/footer.tsx` — new: extracted Footer component
- `apps/web/app/(home)/pricing/page.tsx` — new: pricing page
