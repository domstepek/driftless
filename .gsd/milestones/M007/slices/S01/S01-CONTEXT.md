---
id: S01
milestone: M007
status: ready
---

# S01: Pricing Page with Nav/Footer Integration — Context

## Goal

Build a static `/pricing` route with three-tier layout (Free OSS + Pro + Enterprise), add `Pricing` and `Docs` text links to the nav left of the amber CTA pill, extract Nav and Footer into shared components, and deploy to Vercel.

## Why this Slice

M006 shipped the brand. M007 gives curious OSS visitors a commercial signal before Pro features exist — the pricing page is the first thing a potential paying customer looks for. Shipping immediately after M006 ensures brand cohesion from day one and creates a stable URL for marketing references.

## Scope

### In Scope

- **Nav update** — add small text nav links (`Docs  Pricing`) between the brand name and the amber `View on GitHub` CTA pill. Links styled as small sans or monospace text (not pills), matching the existing three-zone layout without displacing it.
- **Extract `Nav` and `Footer`** from `app/(home)/page.tsx` into shared components (`components/nav.tsx`, `components/footer.tsx`). Behavior-identical refactor — `next build` must still pass and the landing page must look unchanged.
- **Footer update** — add `Pricing` link to the footer nav link row (currently: Docs, GitHub, npm → becomes: Docs, Pricing, GitHub, npm).
- **`/pricing` route** at `app/(home)/pricing/page.tsx` — three-tier layout:
  - **Free tier reference** — smaller card or row acknowledging the MIT OSS CLI. Not a full "coming soon" card — just a brief reference that this free tier already exists with a GitHub/npm CTA.
  - **Pro tier card** — thin 1px border, JetBrains Mono label `PRO`, brief positioning blurb, 3–4 feature hint bullets drawn from PRD (managed knowledge base + agent skill, AI-generated guided walkthroughs, automated demo/tutorial videos), `COMING SOON` badge in amber.
  - **Enterprise tier card** — same card style, label `ENTERPRISE`, brief positioning blurb (custom deployment, SSO, SLA, compliance), 3–4 feature hint bullets, `COMING SOON` badge in amber.
  - Below cards: a short line ("We're building in public. Follow along on GitHub.") with a GitHub link. No form, no button, no waitlist.
- **Page headline** — all-caps Familjen Grotesk 700, e.g. `BUILT FOR TEAMS THAT SHIP.`
- **Section header** — `[ PRICING ]` in JetBrains Mono, amber, above headline.
- **Responsive layout** — three tiers stack vertically on mobile: Free first (smaller), then Pro and Enterprise at equal size. On desktop: Free as a narrower row above or aside, Pro and Enterprise side-by-side.
- **Vercel redeploy** — auto-triggers on push to main. No manual step.

### Out of Scope

- Email capture, waitlist form, or any backend integration.
- Actual pricing numbers or dollar amounts on the page.
- A pricing calculator or comparison table.
- A separate OG image for `/pricing` — reuses the root OG image.
- Active/highlighted nav state when on `/pricing` — same rest style as other links.
- Changes to fumadocs `/docs` — completely untouched.
- Any Pro tier code — that is M008+.

## Constraints

- **`(home)` route group** — `/pricing` lives at `app/(home)/pricing/page.tsx` to inherit the existing `HomeLayout` wrapper. No new layout file.
- **RSC only** — the pricing page is a Server Component. `Nav` uses `LocalTime` (a `"use client"` component) which stays self-contained within the extracted `nav.tsx`.
- **Brand tokens only** — no new CSS variables. All styling uses the M006 `globals.css` token system (`--color-amber`, `--color-bg`, `--color-text`, `--color-border`, `--color-surface`, `--font-display`, `--font-mono`, `--font-body`, spacing vars).
- **D085** — Familjen Grotesk weight 700 is the max available. Do not request weight 900.
- **D086** — Client components must be wrapped via the `mesa-canvas.tsx` pattern if `ssr: false` dynamic import is needed. Not needed here.
- **268 test baseline** — no changes to `packages/*`. `pnpm run test` must still pass 268.
- **`next build` exits 0** — TypeScript strict mode. All imports and types must resolve.
- **Amber contrast** — `--color-amber` (`#C4862A`) on `--color-bg` (`#FAFAF8`) is 4.6:1 — WCAG AA for large text only. `COMING SOON` badge must be ≥18px, or use amber as a border/background with readable text on top.
- **No pricing numbers** — page is purely "coming soon" with positioning copy. No dollar amounts.

## Integration Points

### Consumes

- `app/(home)/page.tsx` — existing `Nav()` and `Footer()` inline functions. Extracted as-is into shared components; behavior unchanged.
- `components/local-time.tsx` — client component used by `Nav`. Import path preserved in extracted `nav.tsx`.
- `app/globals.css` — all brand tokens already defined. No new additions.
- `app/layout.tsx` — font CSS variable classes (`--font-display`, `--font-mono`, `--font-body`) inherited by the pricing page via root layout.
- `~/Desktop/driftless/04-product-requirements.md` — source for Pro tier feature bullet copy (features a/b/c).
- `~/Desktop/driftless/brand-identity.md` — reference for component patterns (bracketed labels, thin borders, monospace badge style).

### Produces

- `components/nav.tsx` — extracted `Nav` component. Includes new `Docs` and `Pricing` text links left of the amber CTA pill. Importable by any `(home)` page.
- `components/footer.tsx` — extracted `Footer` component. Includes new `Pricing` link in the link row. Importable by any `(home)` page.
- `app/(home)/pricing/page.tsx` — static pricing page: Free tier reference + Pro card + Enterprise card + GitHub note.
- Updated `app/(home)/page.tsx` — imports shared `Nav` and `Footer` instead of inline functions. No visible change to landing page.

## Open Questions

- **Free tier display format** — should the Free tier be a full card (same size as Pro/Enterprise, just not "coming soon") or a smaller reference row at the top? Current thinking: smaller row or banner above the two main cards, with `FREE` label in monospace and a brief "MIT licensed. Use it today." line + CTA link to GitHub/npm. It shouldn't compete visually with the Pro/Enterprise cards.
- **Nav text link style** — small sans (`text-sm`, muted color) or monospace with brackets (`[ DOCS ]  [ PRICING ]`)? Current thinking: sans, muted gray, same weight as footer links. The brackets read as interactive elements in the brand system and should be reserved for CTAs, not passive nav items. Verify against the existing footer link style for consistency.
- **Feature bullet copy** — exact wording for Pro bullets needs to be pulled from `04-product-requirements.md` feature (a), (b), (c) names without over-committing to timelines. Use present-tense feature names as bullets (e.g. "Managed knowledge base" not "We'll build a managed knowledge base"). Enterprise bullets are more generic (SSO, SLA, custom deployment, compliance).
