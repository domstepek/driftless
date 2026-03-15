---
id: S01
parent: M007
milestone: M007
provides:
  - Static /pricing route with Pro and Enterprise "coming soon" tier cards in M006 brand system
  - Nav component extracted to components/nav.tsx with [ PRICING ] link
  - Footer component extracted to components/footer.tsx with Pricing link
requires: []
affects: []
key_files:
  - apps/web/app/(home)/pricing/page.tsx
  - apps/web/components/nav.tsx
  - apps/web/components/footer.tsx
  - apps/web/app/(home)/page.tsx
key_decisions:
  - D088 — Nav/Footer extracted to shared components, not moved to layout
  - D089 — /pricing inside (home) route group
  - D090 — No pricing numbers on "coming soon" page
patterns_established:
  - Shared components live in apps/web/components/ as named exports, imported via @/components/ alias
  - Pricing page follows section-header + thin-rule + content-grid pattern from landing page
  - Nav bracket-style links use font-mono text-sm with gray-500 base color and hover transition
observability_surfaces:
  - Build route manifest: grep for /pricing in next build output confirms route presence
  - Browser: [ PRICING ], COMING SOON, PRO, ENTERPRISE are text-visible assertions
  - Failure: missing imports → Module not found with file path in build stderr
drill_down_paths:
  - .gsd/milestones/M007/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M007/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M007/slices/S01/tasks/T03-SUMMARY.md
duration: ~21m
verification_result: passed
completed_at: 2026-03-14
---

# S01: Pricing page with nav/footer integration

**Static /pricing page with Pro and Enterprise "coming soon" tier cards, linked from nav and footer, styled in the M006 brutalist-technical-white brand system.**

## What Happened

Three tasks executed sequentially:

**T01 — Extract Nav and Footer.** Identified Nav (lines 9–55) and Footer (lines 438–534) in `page.tsx`. Extracted each to `components/nav.tsx` and `components/footer.tsx` as named exports. Updated `page.tsx` to import from `@/components/`. Zero behavior change — all CSS variables, Tailwind classes, and JSX preserved byte-for-byte. Build + 268 tests confirmed no regression.

**T02 — Build pricing page.** Created `app/(home)/pricing/page.tsx` as a Server Component. Structure: Nav, section label `[ PRICING ]` in monospace amber, headline "BUILT FOR TEAMS THAT SHIP." in Familjen Grotesk 700, two tier cards (Pro for B2B SaaS teams, Enterprise for SSO/compliance orgs) with 1px border styling and amber "COMING SOON" badges at ≥18px (WCAG AA). Below cards: GitHub "building in public" note with repo link. Footer at bottom. All styling uses existing M006 tokens — no new CSS variables. Tier copy sourced from `05-pricing-model.md`.

**T03 — Wire links.** Added `[ PRICING ]` link to Nav in a flex container next to brand name — monospace, gray-500 with hover transition. Added Pricing as first item in Footer link row (before Docs) using `next/link`. Browser-verified: clicking both links navigates to `/pricing`.

## Verification

| Check | Result |
|---|---|
| `cd apps/web && pnpm next build` exits 0 | ✅ `/pricing` in route output as static page |
| `pnpm run test` passes 268 | ✅ 268 passed across 14 files |
| No `Module not found` / `Cannot resolve` in build | ✅ grep returns empty |
| Landing page `/` renders identically after extraction | ✅ browser-verified in T03 |
| `/pricing` renders with correct brand styling | ✅ browser-verified — all content, fonts, colors correct |
| Nav `[ PRICING ]` link navigates to `/pricing` | ✅ |
| Footer Pricing link navigates to `/pricing` | ✅ |

## Requirements Advanced

- R021 — extends the marketing site surface with a new `/pricing` route (R021 already validated in M004)

## Requirements Validated

- none — M007 doesn't own any unvalidated requirements

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

None.

## Known Limitations

- Tier cards show "COMING SOON" only — no pricing numbers, no CTAs, no signup flow. Intentional per D090.
- No automated visual regression test for the landing page before/after Nav/Footer extraction — verified manually in browser.

## Follow-ups

- none — this is the only slice in M007

## Files Created/Modified

- `apps/web/components/nav.tsx` — new: extracted Nav component with LocalTime dependency and `[ PRICING ]` link
- `apps/web/components/footer.tsx` — new: extracted Footer component with Pricing link as first nav item
- `apps/web/app/(home)/pricing/page.tsx` — new: static pricing page with TierCard component, two tier cards, GitHub note
- `apps/web/app/(home)/page.tsx` — removed inline Nav/Footer, imports from @/components

## Forward Intelligence

### What the next slice should know
- Nav and Footer are now shared components at `apps/web/components/`. Any new `(home)` page should import them the same way pricing does.
- The `(home)` route group layout provides `bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen` — new pages inherit this automatically.

### What's fragile
- Nav's three-zone layout (brand+pricing left, CTA center, local time right) is a single flex row. Adding more nav links will need layout reconsideration.

### Authoritative diagnostics
- `cd apps/web && pnpm next build 2>&1 | grep pricing` — confirms route presence
- `grep -r "href.*pricing" apps/web/components/` — confirms both nav and footer link wiring

### What assumptions changed
- No assumptions changed. The slice executed exactly as planned.
