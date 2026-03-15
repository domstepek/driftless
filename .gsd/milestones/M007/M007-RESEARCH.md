# M007: Pricing Page — Research

**Date:** 2026-03-14

## Summary

M007 is a low-risk, single-page addition to `apps/web`. The `/pricing` route lives at `app/(home)/pricing/page.tsx` and inherits the `(home)` layout wrapper. All brand tokens (colors, fonts, spacing) are already defined in `globals.css` — no new CSS variables needed. The page is fully server-rendered with no client components, no data fetching, and no new dependencies.

The main structural question is how to share Nav and Footer between the landing page and the pricing page. Currently both are inline function components inside `app/(home)/page.tsx` — not exported, not in the layout. The cleanest approach is to extract Nav and Footer into shared component files (`components/nav.tsx`, `components/footer.tsx`) and import them in both pages. Moving them into the `(home)` layout is an alternative but would change the landing page's rendering behavior unnecessarily. Component extraction is a minimal refactor with no behavioral change.

The context document's assumption that a `[ DOCS ]` bracket-style nav link exists is incorrect — the nav currently has three zones (brand name left, GitHub CTA pill center, local time right) with no text links. Adding a `[ PRICING ]` link means designing a new nav element. A monospace bracket label fits the brutalist vocabulary and can sit between the brand name and the CTA pill, or as additional links left of the CTA. The footer already has a link row (Docs, GitHub, npm) where "Pricing" slots in naturally.

## Recommendation

**Single slice, three tasks:**
1. Extract Nav and Footer from `page.tsx` into shared components (refactor, no visible change)
2. Build the `/pricing` page with Pro and Enterprise "coming soon" tier cards
3. Add `[ PRICING ]` link to Nav, add Pricing link to Footer, verify build + tests

Prove the refactor first (task 1 — `next build` still passes, landing page unchanged) before adding new content. This de-risks the only non-trivial change.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Routing | Next.js App Router file convention | `app/(home)/pricing/page.tsx` auto-routes to `/pricing` inside the `(home)` layout |
| Brand tokens | `globals.css` `@theme inline` block | All colors, fonts, spacing already defined as CSS variables — just reference them |
| Font loading | `next/font/google` in root `layout.tsx` | Familjen Grotesk, Instrument Sans, JetBrains Mono already loaded globally |
| Internal links | `next/link` `Link` component | Already used in the footer for `/docs` link — use same pattern for `/pricing` |

## Existing Code and Patterns

- `apps/web/app/(home)/page.tsx` — Contains `Nav()`, `Footer()`, `Hero()`, `HowItWorks()`, `WhatItGenerates()`, `Ticker()` as inline function components. Nav and Footer must be extracted to be shared with the pricing page. The pattern for section components (section header in `font-display` + thin rule divider + content) should be replicated on the pricing page.
- `apps/web/app/(home)/layout.tsx` — Minimal wrapper: `div` with `bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen`. Nav and Footer are NOT here — they're in the page. Layout stays minimal.
- `apps/web/app/globals.css` — All M006 brand tokens. Key ones for pricing: `--color-amber`, `--color-surface`, `--color-border`, `--font-display`, `--font-mono`, `--font-body`, spacing vars. No additions needed.
- `apps/web/app/layout.tsx` — Root layout loads all three Google Fonts via `next/font/google`, applies CSS variable classes to `<html>`, wraps in fumadocs `RootProvider`. Pricing page inherits all of this.
- `apps/web/components/local-time.tsx` — Client component (`"use client"`) used by Nav for the real-time clock. Nav component will need this import when extracted.
- `~/Desktop/driftless/brand-identity.md` § 7.1 Navigation — Defines nav as three zones (brand left, CTA pill center, local time right). No existing spec for text nav links — `[ PRICING ]` is a new element type.
- `~/Desktop/driftless/brand-identity.md` § 7.6 Footer — Defines footer center column as "Navigation links: Docs, GitHub, npm". Pricing is a natural 4th link with identical styling.
- `~/Desktop/driftless/05-pricing-model.md` — Tier structure: Pro (early adopter $99/mo), Enterprise (custom). For the "coming soon" page: no pricing numbers, just tier name + brief positioning line + "COMING SOON" label.

## Constraints

- **RSC only** — pricing page is a Server Component. No `"use client"` directive, no `useState`, no `useEffect`. The Nav component (which uses `LocalTime`) is the only client boundary, and it stays self-contained.
- **`next build` must exit 0** — TypeScript strict mode. All imports and types must resolve.
- **268 test baseline holds** — no changes to `packages/*`. `pnpm run test` still passes 268.
- **Tailwind v4 CSS-first** — use existing CSS variables via `var()` in inline styles or Tailwind utilities. No `tailwind.config.js`.
- **No new CSS variables** — everything needed is already in `globals.css`.
- **Brand token accessibility** — `--color-amber` on `--color-bg` only passes WCAG AA for large text (≥18px). "COMING SOON" labels in amber must be at least 18px or used as non-text decoration.
- **No active state on nav link** — context doc's open question resolved: same style as other links, no amber/active treatment for `/pricing`.
- **No pricing numbers** — context doc's open question resolved: keep it purely "coming soon" with positioning copy. No dollar amounts.

## Common Pitfalls

- **Forgetting `Link` vs `<a>` for internal routes** — Footer currently uses `<Link href="/docs">` for internal and `<a>` for external. `/pricing` is internal → use `<Link>`. Getting this wrong means full page reload instead of client-side navigation.
- **Breaking the existing landing page during Nav/Footer extraction** — The refactor must be behavior-identical. Extract functions as-is, then `next build` to confirm zero regression before adding new content.
- **Over-engineering the page** — This is a placeholder. Two tier cards, a headline, a GitHub note. No grid systems, no comparison tables, no toggle switches. The context doc is deliberately sparse — honor that.
- **Amber contrast on small text** — `--color-amber` (#C4862A) on `--color-bg` (#FAFAF8) is 4.6:1 contrast — fails WCAG AA for text under 18px. The "COMING SOON" label must use large text or treat amber as decorative accent (e.g., a badge border or background) with readable text on top.
- **Nav layout shift from adding a link** — The current nav uses `justify-between` for three zones. Adding a 4th element (pricing link) needs to preserve the visual balance. Consider placing nav links as part of the center zone or between left and center.

## Open Risks

- **Nav redesign scope creep** — Adding a link to a nav that was designed for exactly three elements may prompt a visual redesign. Mitigate by keeping the addition minimal: a small monospace link next to the brand name or next to the CTA. Don't redesign the nav.
- **Footer ordering** — Adding "Pricing" to the link row (currently Docs, GitHub, npm) — placement matters for visual flow. "Pricing" before "Docs" reads oddly; "Pricing" after "npm" works but pushes the row wider on mobile. Test at mobile breakpoint.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Next.js App Router | `joelhooks/joelclaw@nextjs-static-shells` (41 installs) | available — not needed for a single static page |
| Frontend design | `frontend-design` | installed locally |

No additional skills needed. This is a straightforward static page using existing patterns.

## Sources

- Nav/Footer structure: `apps/web/app/(home)/page.tsx` (lines 9–534)
- Brand tokens: `apps/web/app/globals.css` (CSS variables in `@theme inline`)
- Brand spec: `~/Desktop/driftless/brand-identity.md` (§ 7.1 Navigation, § 7.6 Footer)
- Tier positioning: `~/Desktop/driftless/05-pricing-model.md` (Tier Structure table)
- Font loading: `apps/web/app/layout.tsx` (next/font/google setup)
- Component inventory: `apps/web/components/` (local-time.tsx, mesa-canvas.tsx, ascii-mesa.tsx, copy-install.tsx)
