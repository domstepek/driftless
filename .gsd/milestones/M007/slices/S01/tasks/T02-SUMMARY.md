---
id: T02
parent: S01
milestone: M007
provides:
  - Pricing page at /pricing with two tier cards (PRO, ENTERPRISE) and "COMING SOON" badges
key_files:
  - apps/web/app/(home)/pricing/page.tsx
key_decisions:
  - Used TierCard component pattern matching existing GeneratesCard pattern from landing page — keeps section structure consistent across (home) routes
patterns_established:
  - Pricing page follows section-header + thin-rule + content-grid pattern established in landing page
  - Tier card component accepts tier/audience/description/features props — reusable if tiers expand
observability_surfaces:
  - Build route manifest: grep for `/pricing` in `next build` output confirms route presence
  - Browser: `[ PRICING ]`, `COMING SOON`, `PRO`, `ENTERPRISE` are all text-visible assertions
  - Failure: missing page file → Next.js 404; broken imports → `Module not found` with file path in build stderr
duration: 8m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Build the /pricing page with tier cards

**Created static /pricing page with PRO and ENTERPRISE "coming soon" tier cards using the M006 brand system.**

## What Happened

Built `apps/web/app/(home)/pricing/page.tsx` as a Server Component (no `"use client"`). Structure follows the landing page's section pattern: Nav at top, section label `[ PRICING ]` in monospace amber, display-font headline "BUILT FOR TEAMS THAT SHIP.", two tier cards in a responsive grid with 1px border styling, feature lists with amber arrow markers, "COMING SOON" badges at 18px (WCAG AA), a "building in public" GitHub note, and Footer at bottom. All styling uses existing CSS variables from `globals.css` — no new tokens introduced.

Tier positioning copy sourced from `05-pricing-model.md`: PRO targets B2B SaaS teams with e2e tests (features a–c), ENTERPRISE targets large orgs with SSO/compliance/autonomous pipeline needs.

## Verification

- `pnpm next build` exits 0 — `/pricing` appears in route output as static page (○)
- `pnpm run test` passes 268 (zero regressions)
- No `Module not found` errors in build output
- Browser verification: navigated to `localhost:3000/pricing`, confirmed all content renders correctly
- 8/8 browser assertions passed: URL, PRICING label, headline, PRO, ENTERPRISE, COMING SOON, GitHub note, Nav brand

### Slice-level verification status (intermediate — T02 of 3)

- ✅ `next build` exits 0 with `/pricing` in route output
- ✅ `pnpm run test` passes 268
- ⬜ Landing page at `/` renders identically (not re-verified this task — covered in T01)
- ✅ `/pricing` route renders in browser with correct brand styling
- ⬜ Nav/footer links to `/pricing` — wired in T03
- ✅ Build output clean of `Module not found` errors

## Diagnostics

Future agent can verify this task's output by:
- `grep -r "pricing" apps/web/.next/routes-manifest.json` — confirms route registered
- `grep -c '"use client"' apps/web/app/\(home\)/pricing/page.tsx` — should be 0 (Server Component)
- Browser: assert text "COMING SOON" visible at `/pricing`
- Build: `cd apps/web && pnpm next build 2>&1 | grep -i "module not found"` — should return nothing

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/app/(home)/pricing/page.tsx` — new: static pricing page with TierCard component and two tier cards
- `.gsd/milestones/M007/slices/S01/S01-PLAN.md` — added failure-path diagnostic to verification section (pre-flight fix)
- `.gsd/milestones/M007/slices/S01/tasks/T02-PLAN.md` — added Observability Impact section (pre-flight fix)
