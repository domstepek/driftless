---
id: T01
parent: S01
milestone: M007
provides:
  - Nav component at components/nav.tsx (shared, named export)
  - Footer component at components/footer.tsx (shared, named export)
  - page.tsx refactored to import Nav/Footer from components
key_files:
  - apps/web/components/nav.tsx
  - apps/web/components/footer.tsx
  - apps/web/app/(home)/page.tsx
key_decisions: []
patterns_established:
  - Shared components live in apps/web/components/ as named exports, imported via @/components/ alias
observability_surfaces:
  - none — behavior-identical refactor, no new runtime signals
duration: ~5m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Extract Nav and Footer into shared components

**Extracted Nav and Footer from inline functions in page.tsx into dedicated component files with zero behavior change.**

## What Happened

Identified exact boundaries of `Nav()` (lines 9–55) and `Footer()` (lines 438–534) in `apps/web/app/(home)/page.tsx`. Nav depends on `LocalTime` from `./local-time`; Footer depends on `Link` from `next/link`.

Created `apps/web/components/nav.tsx` with `Nav` as a named export, importing `LocalTime` from `./local-time`. Created `apps/web/components/footer.tsx` with `Footer` as a named export, importing `Link` from `next/link`. All JSX, CSS variable references, inline styles, and Tailwind classes preserved byte-for-byte.

Updated `page.tsx`: removed the `Link` and `LocalTime` imports (no longer needed at page level), removed inline `Nav` and `Footer` definitions, added imports from `@/components/nav` and `@/components/footer`. Component composition order in `HomePage()` unchanged.

## Verification

- `cd apps/web && pnpm next build` — exits 0, all 12 routes generated including `/` route
- `pnpm run test` (workspace root) — **268 tests passing** across 14 test files
- No `Module not found` errors in build output
- Route manifest confirms `/` still present as static page

### Slice-level verification (partial — T01 is intermediate):
- ✅ `next build` exits 0
- ✅ `pnpm run test` passes 268
- ⏳ `/pricing` in route output — not yet (T02 creates the page)
- ⏳ Landing page visual regression check — deferred to T03 browser verification
- ⏳ `/pricing` browser rendering — not yet (T02)

## Diagnostics

No new runtime signals. Future agent can verify extraction by:
- `grep -r "from.*@/components/nav" apps/web/app` — confirms Nav import wiring
- `grep -r "from.*@/components/footer" apps/web/app` — confirms Footer import wiring
- `grep -r "function Nav" apps/web/components/nav.tsx` — confirms named function exists

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/components/nav.tsx` — new: extracted Nav component with LocalTime dependency
- `apps/web/components/footer.tsx` — new: extracted Footer component with Link dependency
- `apps/web/app/(home)/page.tsx` — removed inline Nav/Footer, imports from @/components
- `.gsd/milestones/M007/slices/S01/S01-PLAN.md` — added Observability / Diagnostics section
- `.gsd/milestones/M007/slices/S01/tasks/T01-PLAN.md` — added Observability Impact section
