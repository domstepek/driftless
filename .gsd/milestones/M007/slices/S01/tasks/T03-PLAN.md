---
estimated_steps: 5
estimated_files: 2
---

# T03: Wire nav/footer links and run full verification

**Slice:** S01 — Pricing page with nav/footer integration
**Milestone:** M007

## Description

Add `[ PRICING ]` link to the Nav component and a Pricing link to the Footer component. Both use `next/link` `Link` for client-side navigation to `/pricing`. Then run the full verification suite: build, tests, browser check, and push for Vercel deployment.

## Steps

1. Edit `apps/web/components/nav.tsx` — add a `[ PRICING ]` link using `Link` from `next/link` to `/pricing`. Style in monospace (`font-mono`), matching the brutalist bracket convention. Place it in the nav layout without disrupting the three-zone balance (brand left, center, local time right). Consider placing nav links between the brand name and the CTA pill or alongside the CTA.
2. Edit `apps/web/components/footer.tsx` — add "Pricing" to the link row. Use `Link` to `/pricing` (internal route, not `<a>`). Place it logically in the existing row (Docs, GitHub, npm) — likely before Docs or after npm.
3. Run `cd apps/web && pnpm next build` — confirm exit 0.
4. Run `pnpm run test` — confirm 268 tests pass.
5. Verify in browser: open `/`, confirm `[ PRICING ]` in nav, click it, confirm `/pricing` loads. Confirm Footer shows Pricing link. Push to main for Vercel auto-deploy.

## Must-Haves

- [ ] `[ PRICING ]` link in Nav routes to `/pricing` via `next/link`
- [ ] Pricing link in Footer routes to `/pricing` via `next/link`
- [ ] `next build` exits 0
- [ ] `pnpm run test` passes 268
- [ ] Vercel deployment triggered (push to main)

## Verification

- `cd apps/web && pnpm next build` exits 0
- `pnpm run test` passes 268
- Browser: nav `[ PRICING ]` link navigates to `/pricing`; footer Pricing link navigates to `/pricing`
- Vercel deployment live at `driftless-six.vercel.app/pricing`

## Inputs

- `apps/web/components/nav.tsx` — shared Nav from T01
- `apps/web/components/footer.tsx` — shared Footer from T01
- `apps/web/app/(home)/pricing/page.tsx` — pricing page from T02

## Observability Impact

- **Nav link discoverability**: `[ PRICING ]` bracket text is greppable in page source and browser accessibility tree — future agent can `browser_find` for text "PRICING" to confirm presence.
- **Footer link discoverability**: "Pricing" text link in footer is greppable and visible in accessibility tree.
- **Route wiring**: Both links use `next/link` `Link` to `/pricing`, so client-side navigation is observable via `browser_assert` url_contains check after click — no full page reload.
- **Failure signals**: If `/pricing` route is removed or renamed, the links still render but navigate to a 404. Agent can detect via `browser_assert` text_visible for pricing page content after navigation.

## Expected Output

- `apps/web/components/nav.tsx` — modified with `[ PRICING ]` link
- `apps/web/components/footer.tsx` — modified with Pricing link
