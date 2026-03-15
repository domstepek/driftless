---
id: T03
parent: S01
milestone: M007
provides:
  - "[ PRICING ] link in Nav component routing to /pricing via next/link"
  - "Pricing link in Footer component routing to /pricing via next/link"
key_files:
  - apps/web/components/nav.tsx
  - apps/web/components/footer.tsx
key_decisions:
  - "Placed [ PRICING ] link next to brand name in a flex container rather than in center zone — preserves three-zone balance without competing with CTA pill"
  - "Added Pricing as first item in footer link row (before Docs) — internal routes before external links"
patterns_established:
  - "Nav bracket-style links use font-mono text-sm with gray-500 base color and hover transition to text color"
observability_surfaces:
  - "Nav link discoverable via browser_find text='PRICING' or grep for href='/pricing' in nav.tsx"
  - "Footer link discoverable via browser_find role=link text='Pricing' in footer element"
duration: 8m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T03: Wire nav/footer links and run full verification

**Added `[ PRICING ]` link to Nav and Pricing link to Footer, both routing to `/pricing` via `next/link`. Full verification suite passed.**

## What Happened

Added `Link` import from `next/link` to `nav.tsx` and wrapped the brand name + pricing link in a flex container to preserve the three-zone layout. `[ PRICING ]` uses monospace font with gray-500 color and hover transition, matching the brutalist bracket convention. In `footer.tsx`, added a Pricing `Link` as the first item in the nav links row (before Docs), using the same styling as existing footer links.

## Verification

- `cd apps/web && pnpm next build` — exits 0, `/pricing` route present in output
- `pnpm run test` — 268 tests passed (14 test files)
- Build output grep for `Module not found` / `Cannot find module` — zero matches (clean import surface)
- Browser: opened `/`, confirmed `[ PRICING ]` visible in nav bar
- Browser: clicked `[ PRICING ]`, confirmed navigation to `/pricing` with "COMING SOON" text visible
- Browser: confirmed footer shows Pricing, Docs, GitHub, npm links in correct order
- Browser: clicked footer Pricing link from `/`, confirmed navigation to `/pricing`

### Slice-level verification status (final task — all must pass)

| Check | Status |
|---|---|
| `next build` exits 0 with `/pricing` in route output | ✅ |
| `pnpm run test` passes 268 | ✅ |
| Landing page at `/` renders identically after Nav/Footer extraction | ✅ |
| `/pricing` route renders in browser with correct brand styling | ✅ |
| No `Module not found` errors in build output | ✅ |
| Clean build error surface (no `Cannot resolve` lines) | ✅ |

## Diagnostics

Future agent can verify this task's output by:
- `grep -r "href.*pricing" apps/web/components/nav.tsx` — confirms nav link wiring
- `grep -r "href.*pricing" apps/web/components/footer.tsx` — confirms footer link wiring
- Browser: `browser_find` for text "PRICING" on any `(home)` route — should find nav link
- Browser: `browser_find` role=link text="Pricing" in footer — should find footer link

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/components/nav.tsx` — added `Link` import, wrapped brand + `[ PRICING ]` link in flex container
- `apps/web/components/footer.tsx` — added Pricing `Link` as first item in footer nav links row
- `.gsd/milestones/M007/slices/S01/S01-PLAN.md` — added diagnostic verification steps (pre-flight fix)
- `.gsd/milestones/M007/slices/S01/tasks/T03-PLAN.md` — added Observability Impact section (pre-flight fix)
