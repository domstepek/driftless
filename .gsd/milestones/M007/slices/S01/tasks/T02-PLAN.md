---
estimated_steps: 4
estimated_files: 1
---

# T02: Build the /pricing page with tier cards

**Slice:** S01 — Pricing page with nav/footer integration
**Milestone:** M007

## Description

Create the static pricing page at `apps/web/app/(home)/pricing/page.tsx`. The page imports shared Nav and Footer components and renders two "coming soon" tier cards (Pro and Enterprise) in the M006 brand system. RSC only — no client components, no data fetching.

## Steps

1. Read `~/Desktop/driftless/05-pricing-model.md` for tier positioning copy (Pro: B2B SaaS teams with e2e tests; Enterprise: SSO/compliance/custom deployment)
2. Read `apps/web/app/(home)/page.tsx` to reference the section component pattern (section header + thin rule + content) and brand token usage
3. Create `apps/web/app/(home)/pricing/page.tsx` — Server Component with: Nav at top, Footer at bottom, section header `[ PRICING ]` in `font-mono` with amber color, headline in `font-display` (e.g. "BUILT FOR TEAMS THAT SHIP."), two tier cards with 1px `--color-border` borders, monospace tier labels, brief positioning lines, "COMING SOON" badges in amber at ≥18px, and a GitHub note at the bottom. Use only existing CSS variables from `globals.css`.
4. Run `cd apps/web && pnpm next build` — confirm `/pricing` appears in route output.

## Must-Haves

- [ ] Page is a Server Component (no `"use client"`)
- [ ] Two tier cards: PRO and ENTERPRISE with "COMING SOON" labels
- [ ] All styling uses existing M006 brand tokens — no new CSS variables
- [ ] Amber text is ≥18px for WCAG AA compliance
- [ ] Page imports and renders shared Nav and Footer
- [ ] `next build` exits 0

## Verification

- `cd apps/web && pnpm next build` exits 0 with `/pricing` in route list

## Inputs

- `apps/web/components/nav.tsx` — shared Nav from T01
- `apps/web/components/footer.tsx` — shared Footer from T01
- `apps/web/app/globals.css` — brand tokens
- `~/Desktop/driftless/05-pricing-model.md` — tier positioning copy reference

## Observability Impact

- **New route**: `/pricing` appears in `next build` route manifest — future agent greps for `pricing` in build output to confirm route presence.
- **Build error surface**: If the pricing page has broken imports or JSX errors, `next build` emits typed errors with file path (`app/(home)/pricing/page.tsx`) and line number. No silent fallback.
- **Browser verification**: `/pricing` renders with `[ PRICING ]` section header, two tier cards, and "COMING SOON" badges — inspectable via `browser_find` for text content or `browser_assert` for text visibility.
- **Failure state**: If the page file is missing or malformed, navigating to `/pricing` returns a Next.js 404 page — distinguishable from a successful render by absence of tier card content.

## Expected Output

- `apps/web/app/(home)/pricing/page.tsx` — static pricing page with two tier cards
